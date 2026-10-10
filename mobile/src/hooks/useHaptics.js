import * as Haptics from 'expo-haptics';

export function useHaptics() {
  const triggerLight = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Gracefully fall back if device doesn't support haptics
    }
  };

  const triggerMedium = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // Fallback
    }
  };

  const triggerSuccess = async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // Fallback
    }
  };

  const triggerError = async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch {
      // Fallback
    }
  };

  const triggerSelection = async () => {
    try {
      await Haptics.selectionAsync();
    } catch {
      // Fallback
    }
  };

  return {
    triggerLight,
    triggerMedium,
    triggerSuccess,
    triggerError,
    triggerSelection,
  };
}

export default useHaptics;
