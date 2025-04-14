import { describe, it, expect } from 'vitest';
import { FibReader } from './FibReader';
import { fibonacci as fib } from './fibonacci';
import { BinaryStringReader } from './BinaryStringReader';

describe('FibReader', () => {
  it('should read 1 (encoded as 11)', () => {
    const reader = new BinaryStringReader('11');
    const fibReader = new FibReader(reader);
    expect(fibReader.read()).toBe(1);
  });

  it('should read 2 (encoded as 011)', () => {
    const reader = new BinaryStringReader('011');
    const fibReader = new FibReader(reader);
    expect(fibReader.read()).toBe(2);
  });

  it('should read 5 (encoded as 00011)', () => {
    const reader = new BinaryStringReader('00011');
    const fibReader = new FibReader(reader);
    expect(fibReader.read()).toBe(5);
  });

  it('should read 9 (encoded as 100011)', () => {
    const reader = new BinaryStringReader('100011');
    const fibReader = new FibReader(reader);
    expect(fibReader.read()).toBe(9);
  });

  it('should read multiple numbers from the stream (5 and 2)', () => {
    // Encode 5 (00011) and 2 (011)
    const reader = new BinaryStringReader('00011011');
    const fibReader = new FibReader(reader);
    expect(fibReader.read()).toBe(5);
    expect(fibReader.read()).toBe(2);
  });

  it('should read 0xffffffff', () => {
    const reader = new BinaryStringReader('00100100100010000000100010100010101000010001011');
    const fibReader = new FibReader(reader);
    expect(fibReader.read()).toBe(0xffffffff);
  });

  it('should throw RangeError for 0xffffffff + 1', () => {
    const reader = new BinaryStringReader('10100100100010000000100010100010101000010001011');
    const fibReader = new FibReader(reader);
    expect(() => fibReader.read()).toThrow(RangeError);
  });

  it('should throw EvalError if stream ends prematurely', () => {
    const reader = new BinaryStringReader('001'); // Missing terminating 1
    const fibReader = new FibReader(reader);
    expect(() => fibReader.read()).toThrow(EvalError);
  });

  it('should throw EvalError for empty stream', () => {
    const reader = new BinaryStringReader('');
    const fibReader = new FibReader(reader);
    expect(() => fibReader.read()).toThrow(EvalError);
  });

  it('should throw RangeError if encoding is too long without terminator', () => {
    // Create a string longer than the fib array length
    const longEncoding = '0'.repeat(fib.length) + '11';
    const reader = new BinaryStringReader(longEncoding);
    const fibReader = new FibReader(reader);
    // The loop in FibReader should finish without finding '11', triggering the error
    expect(() => fibReader.read()).toThrow(RangeError);
  });

  it('should throw RangeError for 0xffffffff (4294967295)', () => {
    // Encoding requires fib[46], and terminator 11 ends at index 47.
    // fib.length is 47, loop runs i=0..46. Reads bit[46], lastBit=1. Loop ends.
    // Throws RangeError because terminator wasn't found *within* the loop.
    const encoding = '001000100100100000000100010010010101000001001011';
    const reader = new BinaryStringReader(encoding);
    const fibReader = new FibReader(reader);
    expect(() => fibReader.read()).toThrow(RangeError);
  });
}); 