import { describe, it, expect, beforeEach } from 'vitest';
import { Base64URLWriter } from './Base64URLWriter';

describe('Base64URLWriter', () => {
  let writer: Base64URLWriter;

  beforeEach(() => {
    writer = new Base64URLWriter();
  });

  it('should initialize correctly', () => {
    expect(writer.toString()).toBe('');
  });

  it('should write a single value fitting within 6 bits', () => {
    writer.write(0, 6); // 000000 -> 'A'
    writer.end();
    expect(writer.toString()).toBe('A');
  });

  it('should write a single value spanning multiple base64 characters', () => {
    writer.write(0b111111_000000, 12); // 111111 000000 -> '_A'
    writer.end();
    expect(writer.toString()).toBe('_A');
  });

  it('should write multiple values forming base64 characters', () => {
    writer.write(15, 4); // 1111
    writer.write(0, 2);  // 00   -> 111100 (60) -> '8'
    writer.write(63, 6); // 111111 -> '_'
    writer.end();
    expect(writer.toString()).toBe('8_');
  });

  it('should handle remaining bits correctly with end()', () => {
    writer.write(0b1111, 4); // Write 4 bits (1111)
    writer.end(); // Remaining 4 bits padded with 00 -> 111100 (60) -> 'P'
    expect(writer.toString()).toBe('8');
  });

  it('should handle case where end() does nothing if buffer is empty', () => {
    writer.write(0, 6);
    expect(writer.toString()).toBe('A'); // toString() should show completed chars
    writer.end(); // No pending bits
    expect(writer.toString()).toBe('A');
  });

  it('should allow calling toString() before end() for intermediate results', () => {
    writer.write(0b111111_000000, 12);
    expect(writer.toString()).toBe('_A');
    writer.write(0b1111, 4); // Write 4 bits
    expect(writer.toString()).toBe('_A'); // '8' char not complete yet
    writer.end();
    expect(writer.toString()).toBe('_A8');
  });

  it('should encode standard base64url examples correctly', () => {
    const testCases = [
      { input: 'f', output: 'Zg' },       // 0x66
      { input: 'fo', output: 'Zm8' },      // 0x66 0x6f
      { input: 'foo', output: 'Zm9v' },     // 0x66 0x6f 0x6f
      { input: 'foob', output: 'Zm9vYg' },    // 0x66 0x6f 0x6f 0x62
      { input: 'fooba', output: 'Zm9vYmE' },   // 0x66 0x6f 0x6f 0x62 0x61
      { input: 'foobar', output: 'Zm9vYmFy' }, // 0x66 0x6f 0x6f 0x62 0x61 0x72
    ];

    for (const { input, output } of testCases) {
      writer = new Base64URLWriter();
      for (let i = 0; i < input.length; i++) {
        writer.write(input.charCodeAt(i), 8);
      }
      writer.end();
      expect(writer.toString()).toBe(output);
    }
  });

  it('should write maximum value for different bit lengths', () => {
    writer.write(0b111111, 6);
    writer.write(0b1111, 4);
    writer.write(0b11, 2);
    writer.end();
    expect(writer.toString()).toBe('__');
  });

  it('should handle writing 32 bits', () => {
    writer.write(0xffffffff, 32);
    writer.end();
    // 32 bits -> 5 chars (30 bits) + 2 remaining bits
    // 111111 111111 111111 111111 111111 110000
    // _      _      _      _      _      w
    expect(writer.toString()).toBe('_____w');
  });

  describe('Input Validation', () => {
    it('should throw RangeError for nBits < 1', () => {
      expect(() => writer.write(0, 0)).toThrow(RangeError);
      expect(() => writer.write(0, -1)).toThrow(RangeError);
    });

    it('should throw RangeError for nBits > 32', () => {
      expect(() => writer.write(0, 33)).toThrow(RangeError);
    });

    it('should throw RangeError for value out of range for nBits', () => {
      expect(() => writer.write(16, 4)).toThrow(RangeError); // Max is 15 for 4 bits
      expect(() => writer.write(-1, 4)).toThrow(RangeError); // Min is 0
      expect(() => writer.write(Math.pow(2, 8), 8)).toThrow(RangeError); // Max is 255 for 8 bits
    });

    it('should throw RangeError for non-integer value (checked by validateInteger)', () => {
        // While TypeScript might catch this, validateInteger enforces it.
        expect(() => writer.write(1.5, 4)).toThrow(RangeError);
        expect(() => writer.write(NaN, 4)).toThrow(RangeError);
      });

      it('should throw RangeError for non-integer nBits (checked by validateInteger)', () => {
        expect(() => writer.write(1, 4.5)).toThrow(RangeError);
        expect(() => writer.write(1, NaN)).toThrow(RangeError);
      });
  });
});
