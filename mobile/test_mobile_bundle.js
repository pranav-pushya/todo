const babel = require('@babel/core');
const fs = require('fs');
const path = require('path');

const filesToTest = [
  'App.js',
  'index.js',
  'src/theme/colors.js',
  'src/theme/typography.js',
  'src/services/storage.js',
  'src/services/api.js',
  'src/hooks/useHaptics.js',
  'src/components/common/ScreenContainer.js',
  'src/components/common/Header.js',
  'src/components/common/PriorityBadge.js',
  'src/components/common/CustomButton.js',
  'src/components/tasks/SwipeableTaskRow.js',
  'src/components/tasks/AddTaskModal.js',
  'src/context/AuthContext.js',
  'src/context/ProjectContext.js',
  'src/context/TaskContext.js',
  'src/context/AgentContext.js',
  'src/navigation/AppNavigator.js',
  'src/navigation/BottomTabNavigator.js',
  'src/screens/TodayScreen.js',
  'src/screens/InboxScreen.js',
  'src/screens/ProjectsScreen.js',
  'src/screens/NotesScreen.js',
  'src/screens/AgentScreen.js',
  'src/screens/ProfileScreen.js',
  'src/screens/AuthScreen.js',
];

console.log('⚡ Starting Kortex Mobile Test Suite...\n');

let passed = 0;
let failed = 0;

for (const relPath of filesToTest) {
  const fullPath = path.resolve(__dirname, relPath);
  try {
    if (!fs.existsSync(fullPath)) {
      throw new Error(`File does not exist: ${relPath}`);
    }
    babel.transformFileSync(fullPath, {
      presets: ['babel-preset-expo'],
    });
    console.log(`  ✓ [PASS] ${relPath}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ [FAIL] ${relPath}: ${err.message}`);
    failed++;
  }
}

console.log(`\n================================`);
console.log(`Total Files Tested: ${filesToTest.length}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Status: ${failed === 0 ? 'ALL TESTS PASSED ✅' : 'FAILURES DETECTED ❌'}`);
console.log(`================================\n`);

if (failed > 0) {
  process.exit(1);
}
