import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import theme from '@theme/index';

type StepStatus = 'complete' | 'active' | 'upcoming';

interface ProgressStep {
  id: string;
  label: string;
  status: StepStatus;
  stepNumber?: number;
}

const STEPS: ProgressStep[] = [
  { id: 'registration', label: 'Registration', status: 'complete' },
  { id: 'verification', label: 'Verification', status: 'active', stepNumber: 2 },
  { id: 'launch', label: 'Launch', status: 'upcoming', stepNumber: 3 },
];

export default function OnboardingProgressTracker() {
  return (
    <View style={styles.container} accessibilityRole="summary">
      {STEPS.map((step, index) => (
        <React.Fragment key={step.id}>
          <View style={styles.step}>
            <StepCircle step={step} />
            <Text
              style={[
                styles.stepLabel,
                step.status === 'complete' && styles.stepLabelComplete,
                step.status === 'active' && styles.stepLabelActive,
                step.status === 'upcoming' && styles.stepLabelUpcoming,
              ]}
            >
              {step.label}
            </Text>
          </View>
          {index < STEPS.length - 1 ? (
            <View
              style={[
                styles.connector,
                index === 0 ? styles.connectorActive : styles.connectorInactive,
              ]}
            />
          ) : null}
        </React.Fragment>
      ))}
    </View>
  );
}

function StepCircle({ step }: { step: ProgressStep }) {
  if (step.status === 'complete') {
    return (
      <View style={[styles.circle, styles.circleComplete]}>
        <MaterialIcons name="check" size={20} color={theme.colors.onPrimary} />
      </View>
    );
  }

  if (step.status === 'active') {
    return (
      <View style={[styles.circle, styles.circleActive]}>
        <Text style={styles.circleNumber}>{step.stepNumber}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.circle, styles.circleUpcoming]}>
      <Text style={styles.circleNumberMuted}>{step.stepNumber}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.stackMd,
    marginTop: theme.spacing.stackLg,
  },
  step: {
    flex: 1,
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleComplete: {
    backgroundColor: theme.colors.primary,
  },
  circleActive: {
    backgroundColor: theme.colors.primaryContainer,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  circleUpcoming: {
    backgroundColor: theme.colors.surfaceContainer,
  },
  circleNumber: {
    fontFamily: theme.typography.fontFamily.headline,
    fontSize: theme.typography.fontSize.headlineSm,
    color: theme.colors.onPrimaryContainer,
  },
  circleNumberMuted: {
    fontFamily: theme.typography.fontFamily.headline,
    fontSize: theme.typography.fontSize.headlineSm,
    color: theme.colors.onSurfaceVariant,
  },
  stepLabel: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    lineHeight: theme.typography.lineHeight.labelMd,
    letterSpacing: theme.typography.letterSpacing.labelMd,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  stepLabelComplete: {
    color: theme.colors.primary,
  },
  stepLabelActive: {
    color: theme.colors.primary,
  },
  stepLabelUpcoming: {
    color: theme.colors.onSurfaceVariant,
    opacity: 0.4,
  },
  connector: {
    height: 2,
    flex: 0.6,
    marginTop: 20,
    marginHorizontal: -4,
  },
  connectorActive: {
    backgroundColor: theme.colors.primaryContainer,
  },
  connectorInactive: {
    backgroundColor: theme.colors.outlineVariant,
  },
});
