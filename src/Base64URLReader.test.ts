import { describe, it, expect } from 'vitest';
import { Base64URLReader } from './Base64URLReader';

describe('Base64URLReader', () => {
  it('should read bits correctly within a single character', () => {
    const reader = new Base64URLReader('A'); // 'A' is 0 (000000)
    expect(reader.read(3)).toBe(0);
    expect(reader.read(2)).toBe(0);
    expect(reader.done()).toBe(false);
    expect(reader.read(1)).toBe(0);
    expect(reader.done()).toBe(true);
  });

  it('should read bits correctly across character boundaries', () => {
    // "AQ" -> 000000 010000
    const reader1 = new Base64URLReader('AQ');
    expect(reader1.read(4)).toBe(0); // Reads 0000
    expect(reader1.read(4)).toBe(1); // Reads 0001
    expect(reader1.read(4)).toBe(0); // Reads 0000
    expect(reader1.done()).toBe(true);

    const reader2 = new Base64URLReader('___'); // 111111 111111 111111
    expect(reader2.read(16)).toBe(0xffff); // Reads 1111111111111111
    expect(reader2.read(2)).toBe(0b11);
    expect(reader2.done()).toBe(true);

    // "-_" -> 111110 111111
    const reader3 = new Base64URLReader('-_');
    expect(reader3.read(5)).toBe(31); // Reads 11111
    expect(reader3.read(7)).toBe(63); // Reads 0111111
    expect(reader3.done()).toBe(true);
  });

  it('should handle complex bit reading sequences (RFC 4648 Example)', () => {
    // "f" (01100110) -> Base64URL: Zg
    // 'Z' (011001) 'g' (100000) -> Stream: 011001 100000
    const reader = new Base64URLReader('Zg');
    expect(reader.read(8)).toBe(102); // Reads 01100110
    expect(reader.done()).toBe(false); // Remaining bits: 0000
    expect(reader.read(4)).toBe(0);    // Reads 0000
    expect(reader.done()).toBe(true);
  });

  it('should return correct done status', () => {
    const reader = new Base64URLReader('AA'); // 000000 000000
    expect(reader.done()).toBe(false);
    reader.read(6);
    expect(reader.done()).toBe(false);
    reader.read(6);
    expect(reader.done()).toBe(true);

    // Case with remaining bits in buffer after full read
    const reader2 = new Base64URLReader('A'); // 000000
    reader2.read(4); // Reads 0000, 2 bits left (00)
    expect(reader2.done()).toBe(false);
    reader2.read(2); // Reads 00
    expect(reader2.done()).toBe(true);
  });

   it('should return correct done status even if bits are left in buffer but no more chars', () => {
     // This scenario relies on the reader knowing it can't fulfill a request
     // even if bits are technically left, if more are needed than available + next char
     // Let's test reading most bits, leaving some, then asking for more than possible
     const reader = new Base64URLReader('A'); // 6 bits: 000000
     reader.read(5); // Read 5 bits, 1 left
     expect(reader.done()).toBe(false);
     // Cannot read 2 more bits as only 1 is left and no more chars
     expect(() => reader.read(2)).toThrow(EvalError);
     expect(reader.done()).toBe(true);

   });

  it('should throw error when reading past the end (no more chars and buffer empty)', () => {
    const reader = new Base64URLReader('A'); // 6 bits
    reader.read(6); // Consume all bits
    expect(reader.done()).toBe(true);
    expect(() => reader.read(1)).toThrow(EvalError);
  });

   it('should throw error when reading past the end (need more bits than available)', () => {
    const reader = new Base64URLReader('A'); // 6 bits
    reader.read(4); // 2 bits left
    expect(() => reader.read(3)).toThrow(EvalError); // Need 3, only 2 left, no more chars
   });


  it('should throw error on invalid character', () => {
    const reader = new Base64URLReader('A='); // '=' is not a valid Base64URL char
    reader.read(6); // Reads 'A' fine
    // Next read triggers reading '=', which is invalid
    expect(() => reader.read(1)).toThrow(RangeError);

    const reader2 = new Base64URLReader('='); // Invalid char at start
    expect(() => reader2.read(1)).toThrow(RangeError);

  });

  it('should throw error for invalid nBits in read()', () => {
    const reader = new Base64URLReader('A');
    expect(() => reader.read(0)).toThrow(RangeError); // validateInteger ensures > 0
    expect(() => reader.read(33)).toThrow(RangeError); // validateInteger ensures <= 32
    expect(() => reader.read(-1)).toThrow(RangeError);
    expect(() => reader.read(1.5)).toThrow(RangeError); // Must be integer
  });

  it('should handle empty input string', () => {
    const reader = new Base64URLReader('');
    expect(reader.done()).toBe(true);
    expect(() => reader.read(1)).toThrow(EvalError); // Cannot read from empty input
  });

});
