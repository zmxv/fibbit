import { describe, it, expect } from 'vitest';
import { FibbitReader } from './FibbitReader';
import { BinaryStringReader } from './BinaryStringReader';

describe('FibbitReader', () => {
  // Helper to create FibbitReader from a binary string
  const createReader = (binaryString: string) => {
    return new FibbitReader(new BinaryStringReader(binaryString));
  };

  it('should read the first bit correctly', () => {
    // "1" followed by Fib(1) = "11"
    const reader = createReader('111');
    expect(reader.done()).toBe(false);
    expect(reader.read(1)).toBe(1);
    expect(reader.done()).toBe(true);
  });

  it('should read a simple run of bits', () => {
    // "0" followed by Fib(3) = "0011"
    const reader = createReader('00011');
    expect(reader.read(1)).toBe(0);
    expect(reader.read(1)).toBe(0);
    expect(reader.done()).toBe(false);
    expect(reader.read(1)).toBe(0);
    expect(reader.done()).toBe(true);
  });

  it('should read across a single run boundary', () => {
    // "1" followed by Fib(2) = "011", followed by Fib(1) = "11"
    // Encodes 110
    const reader = createReader('101111');
    expect(reader.read(2)).toBe(0b11); // Read two 1s
    expect(reader.done()).toBe(false);
    expect(reader.read(1)).toBe(0);  // Read one 0
    expect(reader.done()).toBe(true);
  });

  it('should read across multiple run boundaries', () => {
    // "0" followed by Fib(3) = "0011", Fib(2) = "011", Fib(4) = "1011"
    // Encodes 000 11 0000
    const reader = createReader('000110111011');
    expect(reader.read(3)).toBe(0b000);
    expect(reader.read(2)).toBe(0b11);
    expect(reader.done()).toBe(false);
    expect(reader.read(4)).toBe(0b0000);
    expect(reader.done()).toBe(true);
  });

  it('should handle reading multiple bits at once', () => {
    // "1" followed by Fib(5) = "00011", Fib(3) = "0011"
    // Encodes 11111 000
    const reader = createReader('1000110011');
    expect(reader.read(7)).toBe(0b1111100); // Read five 1s and two 0s
    expect(reader.done()).toBe(false);
    expect(reader.read(1)).toBe(0); // Read the last 0
    expect(reader.done()).toBe(true);
  });

  it('should handle reading exactly to the end', () => {
    // "0" followed by Fib(1) = "11"
    const reader = createReader('011');
    expect(reader.done()).toBe(false);
    expect(reader.read(1)).toBe(0);
    expect(reader.done()).toBe(true);
  });

  it('should handle long runs', () => {
    // "0" followed by Fib(0xffffffff)
    const reader = createReader('000100100100010000000100010100010101000010001011');
    expect(reader.done()).toBe(false);
    expect(reader.read(32)).toBe(0);
    expect(reader.done()).toBe(false);
    expect(reader.read(32)).toBe(0);
    expect(reader.done()).toBe(false);

    // "1" followed by Fib(0xffffffff)
    const reader2 = createReader('100100100100010000000100010100010101000010001011');
    expect(reader2.done()).toBe(false);
    expect(reader2.read(32)).toBe(0xffffffff);
    expect(reader2.done()).toBe(false);
    expect(reader2.read(15)).toBe(0x7fff);
    expect(reader2.done()).toBe(false);

    // "0", Fib(1) = "11", Fib(0xffffffff)
    const reader3 = createReader('01100100100100010000000100010100010101000010001011');
    expect(reader3.done()).toBe(false);
    expect(reader3.read(32)).toBe(0x7fffffff);
    expect(reader3.done()).toBe(false);
    expect(reader3.read(15)).toBe(0x7fff);
    expect(reader3.done()).toBe(false);
  });

  it('should report done() correctly', () => {
    // "1" followed by Fib(2) = "011"
    const reader = createReader('1011');
    expect(reader.done()).toBe(false); // Not done initially
    reader.read(1);
    expect(reader.done()).toBe(false); // Still has one '1' in the run
    reader.read(1);
    expect(reader.done()).toBe(true); // Run finished, underlying reader is done
  });

  it('should report done() correctly when underlying reader is done but run remains', () => {
    // "0" followed by Fib(3) = "0011"
    const reader2 = createReader('00011');
    reader2.read(1); // Read the first 0
    reader2.read(1); // Read the second 0
    // currentRun should be 1 now
    expect(reader2.done()).toBe(false); // Not done, even though underlying is finished
  });

  it('should throw EvalError if not enough bits are available', () => {
    // "1" followed by Fib(3) = "0011"
    const reader = createReader('10011');
    reader.read(1); // Reads the first 1
    reader.read(1); // Reads the second 1
    expect(() => reader.read(2)).toThrow(EvalError); // Tries to read 2 more (only 1 left)
  });

  it('should throw EvalError if underlying stream ends prematurely during fib read', () => {
    // "0" followed by Fib(3) = "0011", but stream only has "0001"
    const reader = createReader('0001');
    // Next read triggers fibReader.read(), which encounters end of stream
    expect(() => reader.read(1)).toThrow(EvalError);

    const reader2 = createReader('01101');
    expect(reader2.read(1)).toBe(0);
    // Next read triggers fibReader.read(), which encounters end of stream
    expect(() => reader2.read(1)).toThrow(EvalError);
  });

  it('should throw RangeError for invalid nBits', () => {
    const reader = createReader('011');
    expect(() => reader.read(0)).toThrow(RangeError);
    expect(() => reader.read(33)).toThrow(RangeError);
    expect(() => reader.read(-1)).toThrow(RangeError);
  });

  it('should handle complex alternating sequence', () => {
    // 1 Fib(1)=11, 0 Fib(1)=11, 1 Fib(2)=011, 0 Fib(3)=0011, 1 Fib(1)=11
    // Encodes 1 0 11 000 1
    const binaryString = '1' + '11' + '11' + '011' + '0011' + '11';
    const reader = createReader(binaryString);

    expect(reader.read(8)).toBe(0b10110001);
    expect(reader.done()).toBe(true);
  });
});
