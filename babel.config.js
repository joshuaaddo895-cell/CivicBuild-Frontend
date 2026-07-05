module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@components': './src/components',
            '@screens': './src/screens',
            '@services': './src/api',
            '@utils': './src/utils',
            '@hooks': './src/hooks',
            '@appTypes': './src/types',
            '@store': './src/store',
            '@theme': './src/theme',
            '@assets': './src/assets',
            '@navigation': './src/navigation',
          },
        },
      ],
    ],
  };
};
