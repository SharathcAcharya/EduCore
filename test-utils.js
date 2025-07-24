/**
 * Test utilities for validation scripts
 */

// Simple test framework implementation
const describe = (description, testFn) => {
  console.log(`\n📋 ${description}`);
  testFn();
};

const it = (description, testFn) => {
  try {
    testFn();
    console.log(`✅ ${description}`);
  } catch (error) {
    console.error(`❌ ${description}`);
    console.error(`   Error: ${error.message}`);
    if (error.expected !== undefined) {
      console.error(`   Expected: ${JSON.stringify(error.expected)}`);
      console.error(`   Received: ${JSON.stringify(error.received)}`);
    }
  }
};

// Simple assertion library
const expect = (actual) => {
  return {
    toBe: (expected) => {
      if (actual !== expected) {
        const error = new Error(`Expected ${actual} to be ${expected}`);
        error.expected = expected;
        error.received = actual;
        throw error;
      }
    },
    toEqual: (expected) => {
      const actualStr = JSON.stringify(actual);
      const expectedStr = JSON.stringify(expected);
      if (actualStr !== expectedStr) {
        const error = new Error(`Expected ${actualStr} to equal ${expectedStr}`);
        error.expected = expected;
        error.received = actual;
        throw error;
      }
    },
    toBeTruthy: () => {
      if (!actual) {
        const error = new Error(`Expected ${actual} to be truthy`);
        throw error;
      }
    },
    toBeFalsy: () => {
      if (actual) {
        const error = new Error(`Expected ${actual} to be falsy`);
        throw error;
      }
    },
    toBeNull: () => {
      if (actual !== null) {
        const error = new Error(`Expected ${actual} to be null`);
        throw error;
      }
    },
    not: {
      toBe: (expected) => {
        if (actual === expected) {
          const error = new Error(`Expected ${actual} not to be ${expected}`);
          throw error;
        }
      },
      toBeNull: () => {
        if (actual === null) {
          const error = new Error(`Expected ${actual} not to be null`);
          throw error;
        }
      }
    },
    toBeUndefined: () => {
      if (actual !== undefined) {
        const error = new Error(`Expected ${actual} to be undefined`);
        throw error;
      }
    },
    toContain: (substring) => {
      if (typeof actual !== 'string' || !actual.includes(substring)) {
        const error = new Error(`Expected "${actual}" to contain "${substring}"`);
        throw error;
      }
    }
  };
};

module.exports = { describe, it, expect };
