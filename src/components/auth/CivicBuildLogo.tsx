import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

/**
 * CivicBuildLogo
 *
 * Uses the official logo asset (500×500 px square PNG with transparent background).
 * The asset contains the house icon mark on the left and "CivicBuild" wordmark on
 * the right. Both are centred vertically within the canvas with generous padding.
 *
 * Layout of the 500×500 canvas (approximate px positions):
 *   Icon mark : x 50–185, y 155–345  →  135 w × 190 h
 *   Full block: x 50–455, y 155–345  →  405 w × 190 h
 *
 * showWordmark=true  → render the full 500×500 image at a scaled height
 * showWordmark=false → clip to the icon mark only (left ~37% of the canvas width)
 */

const LOGO_SOURCE = require('../../assets/images/logo.png');

// Canvas is 500×500 — so aspect ratio is 1:1
const CANVAS_SIZE = 500;

// Approximate bounding box of the visible content (icon + wordmark together)
const CONTENT_LEFT = 50; // px from canvas left edge
const CONTENT_RIGHT = 455; // px from canvas left edge
const CONTENT_TOP = 155; // px from canvas top edge
const CONTENT_BOTTOM = 345; // px from canvas top edge

// Icon mark right boundary (where the wordmark starts)
const MARK_RIGHT = 185; // px from canvas left edge

// Derived ratios
const CONTENT_WIDTH_RATIO = (CONTENT_RIGHT - CONTENT_LEFT) / CANVAS_SIZE; // ~0.81
const CONTENT_HEIGHT_RATIO = (CONTENT_BOTTOM - CONTENT_TOP) / CANVAS_SIZE; // ~0.38

// Mark occupies [CONTENT_LEFT, MARK_RIGHT] = 135 px wide
const MARK_WIDTH_RATIO = (MARK_RIGHT - CONTENT_LEFT) / CANVAS_SIZE; // ~0.27
// Mark occupies full content height

interface CivicBuildLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  layout?: 'stack' | 'inline';
}

// Desired rendered height of the icon mark at each size
const MARK_HEIGHTS = { sm: 36, md: 44, lg: 56 } as const;

export default function CivicBuildLogo({
  size = 'md',
  showWordmark = true,
  layout = 'stack',
}: CivicBuildLogoProps) {
  const markHeight = MARK_HEIGHTS[size];

  // The canvas height that makes the content block appear at `markHeight` tall:
  //   canvasHeight × CONTENT_HEIGHT_RATIO = markHeight
  //   → canvasHeight = markHeight / CONTENT_HEIGHT_RATIO
  const canvasRenderHeight = markHeight / CONTENT_HEIGHT_RATIO;
  const canvasRenderWidth = canvasRenderHeight; // square canvas

  if (showWordmark) {
    // Show full logo: clip to content bounding box
    const clipWidth = canvasRenderWidth * CONTENT_WIDTH_RATIO;
    const clipHeight = markHeight; // = canvasRenderHeight × CONTENT_HEIGHT_RATIO

    return (
      <View
        style={[
          styles.container,
          layout === 'inline' ? styles.containerInline : styles.containerStack,
        ]}
        accessibilityRole="image"
        accessibilityLabel="CivicBuild logo"
      >
        {/* Overflow-hidden container sized to the visible content region */}
        <View
          style={{
            width: clipWidth,
            height: clipHeight,
            overflow: 'hidden',
          }}
        >
          {/* Position the full canvas image so the content region is visible */}
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
      </View>
    );
  }

  // Icon-only: clip to just the mark (left portion)
  const markClipWidth = canvasRenderWidth * MARK_WIDTH_RATIO;
  const markClipHeight = markHeight;

  return (
    <View
      style={styles.container}
      accessibilityRole="image"
      accessibilityLabel="CivicBuild logo mark"
    >
      <View
        style={{
          width: markClipWidth,
          height: markClipHeight,
          overflow: 'hidden',
        }}
      >
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerStack: {
    flexDirection: 'column',
  },
  containerInline: {
    flexDirection: 'row',
  },
});
