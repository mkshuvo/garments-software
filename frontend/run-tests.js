#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🧪 Running Centralized Test Suite\n');

const testCommands = [
  {
    name: 'Basic Tests',
    command: 'npx jest __tests__/basic.test.tsx --verbose'
  },
  {
    name: 'Hook Tests',
    command: 'npx jest __tests__/hooks --verbose'
  },
  {
    name: 'UI Component Tests',
    command: 'npx jest __tests__/components/ui --verbose'
  },
  {
    name: 'Accounting Component Tests (may have issues)',
    command: 'npx jest __tests__/components/accounting --verbose --testTimeout=3000'
  }
];

let totalPassed = 0;
let totalFailed = 0;
let totalSuites = 0;

for (const test of testCommands) {
  console.log(`\n📋 Running: ${test.name}`);
  console.log('=' .repeat(50));
  
  try {
    const output = execSync(test.command, { 
      encoding: 'utf8',
      cwd: __dirname,
      timeout: 10000 // 10 second timeout per test suite
    });
    
    console.log(output);
    
    // Parse results
    const suiteMatch = output.match(/Test Suites: (\d+) passed/);
    const testMatch = output.match(/Tests:\s+(\d+) passed/);
    
    if (suiteMatch) totalSuites += parseInt(suiteMatch[1]);
    if (testMatch) totalPassed += parseInt(testMatch[1]);
    
    console.log(`✅ ${test.name} - PASSED`);
    
  } catch (error) {
    console.log(`❌ ${test.name} - FAILED`);
    console.log(error.stdout || error.message);
    totalFailed++;
  }
}

console.log('\n' + '='.repeat(60));
console.log('📊 FINAL RESULTS');
console.log('='.repeat(60));
console.log(`Test Suites: ${totalSuites} passed`);
console.log(`Tests: ${totalPassed} passed, ${totalFailed} failed`);
console.log(`Total: ${totalPassed + totalFailed} tests`);

if (totalFailed === 0) {
  console.log('\n🎉 All tests passed!');
  process.exit(0);
} else {
  console.log(`\n⚠️  ${totalFailed} test suite(s) failed`);
  process.exit(1);
}