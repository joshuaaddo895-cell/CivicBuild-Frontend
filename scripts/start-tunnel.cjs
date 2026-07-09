/**
 * Starts Expo with a user-owned ngrok v3 tunnel.
 *
 * @expo/ngrok ships ngrok 2.3.41, which modern ngrok accounts reject
 * (minimum agent v3.20+). This script uses the ngrok v3 CLI instead.
 *
 * Setup:
 * 1. Install ngrok v3: winget install ngrok.ngrok
 * 2. Add NGROK_AUTHTOKEN to .env.development
 */
const { spawn, execSync } = require('child_process');
const http = require('http');
const { existsSync, readFileSync, readdirSync } = require('fs');
const { homedir } = require('os');
const { join, resolve } = require('path');
const qrcode = require('qrcode-terminal');

const PORT = Number(process.env.EXPO_DEV_SERVER_PORT || 8080);
const ROOT = resolve(__dirname, '..');

function loadEnvFile(filename) {
  const filePath = resolve(ROOT, filename);
  if (!existsSync(filePath)) {
    return;
  }

  for (const line of readFileSync(filePath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function sleep(ms) {
  return new Promise((resolveSleep) => setTimeout(resolveSleep, ms));
}

function stopProcessesOnPort(port) {
  if (!Number.isFinite(port) || port <= 0) {
    return;
  }

  const listCommand =
    process.platform === 'win32' ? `netstat -ano | findstr :${port}` : `lsof -ti:${port}`;

  try {
    const output = execSync(listCommand, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
      env: process.env,
    }).trim();

    if (!output) {
      return;
    }

    const pids =
      process.platform === 'win32'
        ? [...new Set(output.split(/\r?\n/).map((line) => line.trim().split(/\s+/).pop()))]
        : output.split(/\r?\n/).map((entry) => entry.trim());

    for (const pid of pids) {
      if (!pid || pid === String(process.pid)) {
        continue;
      }

      try {
        process.kill(Number(pid), 'SIGTERM');
      } catch {
        // Process may already be gone.
      }
    }
  } catch {
    // Nothing listening on this port.
  }
}

function stopExistingDevServers() {
  if (process.platform === 'win32') {
    try {
      execSync('taskkill /F /IM ngrok.exe /T', { stdio: 'ignore' });
    } catch {
      // No ngrok process running.
    }
  } else {
    try {
      execSync('pkill -f "[n]grok http"', { stdio: 'ignore', env: process.env });
    } catch {
      // No ngrok process running.
    }
  }

  stopProcessesOnPort(PORT);
  stopProcessesOnPort(4040);
  stopProcessesOnPort(4041);
}

async function waitForNgrokApiToClear(maxAttempts = 10) {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      await fetchTunnelUrl();
      await sleep(300);
    } catch {
      return;
    }
  }
}

function getNgrokVersion(commandPath) {
  return execSync(`"${commandPath}" version`, {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'ignore'],
    env: process.env,
  }).trim();
}

function isNgrokV3(commandPath) {
  try {
    return /ngrok version 3\./i.test(getNgrokVersion(commandPath));
  } catch {
    return false;
  }
}

function findWindowsWingetNgrok() {
  const packagesRoot = join(
    process.env.LOCALAPPDATA || join(homedir(), 'AppData', 'Local'),
    'Microsoft',
    'WinGet',
    'Packages',
  );

  if (!existsSync(packagesRoot)) {
    return null;
  }

  try {
    const packageDirs = readdirSync(packagesRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && entry.name.toLowerCase().startsWith('ngrok.ngrok'))
      .map((entry) => join(packagesRoot, entry.name, 'ngrok.exe'));

    for (const candidate of packageDirs) {
      if (existsSync(candidate) && isNgrokV3(candidate)) {
        return candidate;
      }
    }
  } catch {
    // Ignore directory read errors.
  }

  return null;
}

function findNgrokOnPath() {
  const lookupCommand = process.platform === 'win32' ? 'where ngrok' : 'which ngrok';
  const candidates = [];

  if (process.platform === 'darwin') {
    candidates.push('/opt/homebrew/bin/ngrok', '/usr/local/bin/ngrok');
  } else if (process.platform !== 'win32') {
    candidates.push('/usr/local/bin/ngrok');
  }

  try {
    const output = execSync(lookupCommand, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
      env: process.env,
    });

    candidates.push(
      ...output
        .trim()
        .split(/\r?\n/)
        .map((entry) => entry.trim())
        .filter(Boolean)
        .filter((entry) => !entry.toLowerCase().includes('node_modules')),
    );
  } catch {
    // ngrok may not be on PATH yet.
  }

  return candidates;
}

function findNgrokCommand() {
  const candidates = [...findNgrokOnPath()];

  const wingetNgrok = findWindowsWingetNgrok();
  if (wingetNgrok) {
    candidates.unshift(wingetNgrok);
  }

  const seen = new Set();

  for (const candidate of candidates) {
    if (seen.has(candidate) || !existsSync(candidate)) {
      continue;
    }

    seen.add(candidate);

    if (isNgrokV3(candidate)) {
      return candidate;
    }
  }

  return null;
}

function fetchTunnelUrl() {
  return new Promise((resolveUrl, reject) => {
    const request = http.get('http://127.0.0.1:4040/api/tunnels', (response) => {
      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        try {
          const json = JSON.parse(data);
          const tunnels = json.tunnels ?? [];
          const httpsTunnel = tunnels.find((tunnel) => tunnel.public_url?.startsWith('https://'));
          const publicUrl = httpsTunnel?.public_url ?? tunnels[0]?.public_url;

          if (publicUrl) {
            resolveUrl(publicUrl);
            return;
          }

          reject(new Error('No public URL in ngrok API response'));
        } catch (error) {
          reject(error);
        }
      });
    });

    request.on('error', reject);
    request.setTimeout(2000, () => {
      request.destroy(new Error('ngrok API timeout'));
    });
  });
}

async function waitForTunnelUrl(maxAttempts = 40) {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      return await fetchTunnelUrl();
    } catch {
      await sleep(500);
    }
  }

  throw new Error('Timed out waiting for ngrok tunnel URL (is port 4040 available?)');
}

function buildExpoGoUrl(tunnelUrl) {
  const parsed = new URL(tunnelUrl);
  const port = parsed.port || (parsed.protocol === 'https:' ? '443' : '80');

  return `exp://${parsed.hostname}:${port}`;
}

function printConnectionInfo(tunnelUrl) {
  const expoGoUrl = buildExpoGoUrl(tunnelUrl);

  console.log('\nScan this QR code with Expo Go:\n');
  qrcode.generate(expoGoUrl, { small: true }, (code) => console.log(code));
  console.log(`Expo Go URL: ${expoGoUrl}`);
  console.log(`Tunnel URL:  ${tunnelUrl}\n`);
}

async function main() {
  loadEnvFile('.env.development');
  loadEnvFile('.env.local');

  const authtoken = process.env.NGROK_AUTHTOKEN?.trim();

  if (!authtoken) {
    console.error('\nNGROK_AUTHTOKEN is missing.\n');
    console.error('Add to .env.development:');
    console.error('NGROK_AUTHTOKEN=your_token_here');
    console.error('\nGet a free token: https://dashboard.ngrok.com/get-started/your-authtoken\n');
    process.exit(1);
  }

  const ngrokCommand = findNgrokCommand();

  if (!ngrokCommand) {
    console.error('\nngrok v3 CLI is not installed.\n');
    console.error('Install it, then run npm run start:tunnel again:\n');
    if (process.platform === 'darwin') {
      console.error('  brew install ngrok/ngrok/ngrok');
    } else if (process.platform === 'win32') {
      console.error('  winget install ngrok.ngrok');
    }
    console.error('  — or download from https://ngrok.com/download');
    console.error('\nIf you already installed ngrok, close and reopen this terminal.\n');
    process.exit(1);
  }

  console.log('Stopping any existing Expo/ngrok processes on this port...');
  stopExistingDevServers();
  await waitForNgrokApiToClear();
  await sleep(500);

  console.log(`Starting ngrok v3 tunnel on port ${PORT}...`);

  const ngrokProcess = spawn(
    ngrokCommand,
    ['http', String(PORT), '--host-header=localhost', '--log=stdout', '--log-level=info'],
    {
      cwd: ROOT,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: false,
      env: {
        ...process.env,
        NGROK_AUTHTOKEN: authtoken,
      },
    },
  );

  ngrokProcess.stdout.on('data', (chunk) => {
    const message = chunk.toString().trim();
    if (message) {
      console.log(`[ngrok] ${message}`);
    }
  });

  ngrokProcess.stderr.on('data', (chunk) => {
    const message = chunk.toString().trim();
    if (message) {
      console.error(`[ngrok] ${message}`);
    }
  });

  let tunnelUrl;

  try {
    tunnelUrl = await waitForTunnelUrl();
  } catch (error) {
    console.error('\nFailed to start ngrok tunnel.\n');
    console.error(error?.message || error);
    ngrokProcess.kill('SIGTERM');
    process.exit(1);
  }

  console.log(`\nTunnel ready: ${tunnelUrl}\n`);
  printConnectionInfo(tunnelUrl);

  const expoProcess =
    process.platform === 'win32'
      ? spawn(`npx expo start --lan --port ${PORT}`, {
          cwd: ROOT,
          stdio: 'inherit',
          shell: true,
          env: {
            ...process.env,
            EXPO_PACKAGER_PROXY_URL: tunnelUrl,
          },
        })
      : spawn('npx', ['expo', 'start', '--lan', '--port', String(PORT)], {
          cwd: ROOT,
          stdio: 'inherit',
          shell: false,
          env: {
            ...process.env,
            EXPO_PACKAGER_PROXY_URL: tunnelUrl,
          },
        });

  let shuttingDown = false;

  const shutdown = (exitCode = 0) => {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;

    if (!ngrokProcess.killed) {
      ngrokProcess.kill('SIGTERM');
    }

    if (!expoProcess.killed) {
      expoProcess.kill('SIGTERM');
    }

    process.exit(exitCode);
  };

  process.on('SIGINT', () => shutdown(0));
  process.on('SIGTERM', () => shutdown(0));

  ngrokProcess.on('exit', (code) => {
    if (!shuttingDown && code !== 0) {
      console.error(`ngrok exited with code ${code ?? 'unknown'}`);
      shutdown(code ?? 1);
    }
  });

  expoProcess.on('exit', (code) => {
    shutdown(code ?? 0);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
