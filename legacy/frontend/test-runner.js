#!/usr/bin/env node

const { spawn } = require('child_process');

// Run Jest with a hard timeout
const jest = spawn('npx', ['jest', '--testTimeout=2000', '--forceExit', '--detectOpenHandles'], {
  stdio: 'inherit',
  shell: true
});

// Kill the process after 30 seconds no matter what
const timeout = setTimeout(() => {
  console.log('\n⚠️  Tests taking too long, forcing exit...');
  jest.kill('SIGKILL');
  process.exit(1);
}, 30000);

jest.on('close', (code) => {
  clearTimeout(timeout);
  process.exit(code);
});

jest.on('error', (error) => {
  clearTimeout(timeout);
  console.error('Error running tests:', error);
  process.exit(1);
});