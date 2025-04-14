import { describe, it, expect } from 'vitest';
import { BinaryStringReader } from './BinaryStringReader';

describe('BinaryStringReader', () => {
  it('should read bits correctly', () => {
    const reader = new BinaryStringReader('10110');
    expect(reader.read(3)).toBe(5); // 101
    expect(reader.read(2)).toBe(2); // 10
  });

  it('should handle multiple reads', () => {
    const reader = new BinaryStringReader('1101101011111111000000001111111100000000');
    expect(reader.read(1)).toBe(1);
    expect(reader.read(2)).toBe(2); // 10
    expect(reader.read(3)).toBe(6); // 110
    expect(reader.read(2)).toBe(2); // 10
    expect(reader.read(32)).toBe(0xff00ff00); // 11111111000000001111111100000000
  });

  it('should indicate when done', () => {
    const reader = new BinaryStringReader('101');
    expect(reader.done()).toBe(false);
    reader.read(3);
    expect(reader.done()).toBe(true);
  });

  it('should throw EvalError when reading past the end', () => {
    const reader = new BinaryStringReader('10');
    reader.read(2);
    expect(() => reader.read(1)).toThrow(EvalError);
  });

  it('should handle reading zero bits initially', () => {
    const reader = new BinaryStringReader('111');
    // validateInteger should throw, but let's confirm the reader handles it
    expect(() => reader.read(0)).toThrow();
  });

  it('should handle reading negative bits', () => {
    const reader = new BinaryStringReader('111');
    // validateInteger should throw, but let's confirm the reader handles it
    expect(() => reader.read(-1)).toThrow();
  });

  it('should handle reading more than 32 bits', () => {
    const reader = new BinaryStringReader('1'.repeat(33));
    // validateInteger should throw, but let's confirm the reader handles it
    expect(() => reader.read(33)).toThrow();
  });

  it('should handle an empty string', () => {
    const reader = new BinaryStringReader('');
    expect(reader.done()).toBe(true);
    expect(() => reader.read(1)).toThrow(EvalError);
  });
}); 