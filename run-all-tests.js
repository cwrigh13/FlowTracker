#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🧪 Running All FlowTracker Tests...\n');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test configuration
const tests = [
  {
    name: 'Backend Tests',
    command: 'npm',
    args: ['test'],
    cwd: path.join(__dirname, 'backend'),
    env: { ...process.env, NODE_ENV: 'test' }
  },
  {
    name: 'Frontend Tests',
    command: 'npm',
    args: ['test:run'],
    cwd: __dirname,
    env: { ...process.env, NODE_ENV: 'test' }
  }
];

let passedTests = 0;
let totalTests = tests.length;

// Run tests sequentially
async function runTests() {
  for (const test of tests) {
    log(`\n${colors.bold}Running ${test.name}...${colors.reset}`);
    
    try {
      await runTest(test);
      passedTests++;
      log(`✅ ${test.name} passed!`, 'green');
    } catch (error) {
      log(`❌ ${test.name} failed!`, 'red');
      console.error(error.message);
    }
  }
  
  // Summary
  log(`\n${colors.bold}Test Summary:${colors.reset}`);
  log(`Passed: ${passedTests}/${totalTests}`, passedTests === totalTests ? 'green' : 'yellow');
  
  if (passedTests === totalTests) {
    log('\n🎉 All tests passed!', 'green');
    process.exit(0);
  } else {
    log('\n💥 Some tests failed!', 'red');
    process.exit(1);
  }
}

function runTest(test) {
  return new Promise((resolve, reject) => {
    const child = spawn(test.command, test.args, {
      cwd: test.cwd,
      env: test.env,
      stdio: 'inherit'
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Test failed with exit code ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

// Handle process termination
process.on('SIGINT', () => {
  log('\n\n⚠️  Tests interrupted by user', 'yellow');
  process.exit(1);
});

process.on('SIGTERM', () => {
  log('\n\n⚠️  Tests terminated', 'yellow');
  process.exit(1);
});

// Run the tests
runTests().catch(error => {
  log(`\n💥 Test runner failed: ${error.message}`, 'red');
  process.exit(1);
});
