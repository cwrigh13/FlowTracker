#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🧪 Running FlowTracker Backend Tests...\n');

// Set test environment
process.env.NODE_ENV = 'test';

// Run Jest with proper configuration
const jest = spawn('npx', ['jest', '--config', 'jest.config.js'], {
  stdio: 'inherit',
  cwd: __dirname
});

jest.on('close', (code) => {
  if (code === 0) {
    console.log('\n✅ All tests passed!');
    process.exit(0);
  } else {
    console.log('\n❌ Some tests failed.');
    process.exit(1);
  }
});

jest.on('error', (error) => {
  console.error('❌ Error running tests:', error);
  process.exit(1);
});
