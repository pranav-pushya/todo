import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../../theme/colors';

export default function PriorityBadge({ priority = 'P3', size = 'md' }) {
  const pData = colors.priority[priority] || colors.priority.P3;
  const isSmall = size === 'sm';

  return (
    <View style={[styles.badge, { backgroundColor: pData.bg }, isSmall && styles.badgeSm]}>
      <View style={[styles.dot, { backgroundColor: pData.color }, isSmall && styles.dotSm]} />
      <Text style={[styles.text, { color: pData.color }, isSmall && styles.textSm]}>
        {priority}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  dotSm: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginRight: 4,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  textSm: {
    fontSize: 9,
  },
});
