import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';

import theme from '@theme/index';

const LOGO_SOURCE = require('../assets/images/logo.png');

// ── Canvas / crop constants (matches CivicBuildLogo.tsx) ──────────────────────
// The PNG is a 500×500 canvas. Visible content lives roughly at:
//   Full block : x 50–455, y 155–345  →  405 w × 190 h
const CANVAS_SIZE = 500;
const CONTENT_LEFT = 50;
const CONTENT_TOP = 155;
const CONTENT_WIDTH_RATIO = (455 - 50) / CANVAS_SIZE; // ~0.81
const CONTENT_HEIGHT_RATIO = (345 - 155) / CANVAS_SIZE; // ~0.38

interface SplashScreenProps {
  onFinish: () => void;
}

const HOLD_MS = 2200; // visible time
const FADE_IN_MS = 400;
const FADE_OUT_MS = 400;

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      // Fade in
      Animated.timing(opacity, {
        toValue: 1,
        duration: FADE_IN_MS,
        useNativeDriver: true,
      }),
      // Hold
      Animated.delay(HOLD_MS),
      // Fade out
      Animated.timing(opacity, {
        toValue: 0,
        duration: FADE_OUT_MS,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onFinish();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Render the full logo (icon + wordmark) cropped from the PNG canvas
  const LOGO_RENDER_HEIGHT = 56;
  const canvasRenderHeight = LOGO_RENDER_HEIGHT / CONTENT_HEIGHT_RATIO;
  const canvasRenderWidth = canvasRenderHeight; // square canvas
  const clipWidth = canvasRenderWidth * CONTENT_WIDTH_RATIO;
  const clipHeight = LOGO_RENDER_HEIGHT;

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity }]}>
        {/* Logo image — cropped to content bounding box */}
        <View style={{ width: clipWidth, height: clipHeight, overflow: 'hidden' }}>
          <Image
            source={LOGO_SOURCE}
            style={{
              position: 'absolute',
              width: canvasRenderWidth,
              height: canvasRenderHeight,
              left: -(canvasRenderWidth * (CONTENT_LEFT / CANVAS_SIZE)),
              top: -(canvasRenderHeight * (CONTENT_TOP / CANVAS_SIZE)),
            }}
            resizeMode="stretch"
          />
        </View>

        {/* Tagline beneath the logo */}
        <Text style={styles.tagline}>Building communities, together.</Text>
      </Animated.View>

      {/* Bottom brand dot */}
      <Animated.View style={[styles.footer, { opacity }]}>
        <View style={styles.dot} />
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  tagline: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    color: theme.colors.onSurfaceVariant,
    letterSpacing: 0.3,
    marginTop: theme.spacing.xs,
  },
  footer: {
    position: 'absolute',
    bottom: 48,
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.outlineVariant,
  },
  dotActive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
});
