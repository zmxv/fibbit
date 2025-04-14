import { describe, it, expect } from 'vitest';
import { BinaryStringWriter } from './BinaryStringWriter';

describe('BinaryStringWriter', () => {
  it('should write a single bit', () => {
    const writer = new BinaryStringWriter();
    writer.write(1, 1);
    expect(writer.toString()).toBe('1');
  });

  it('should handle end() method (currently no-op)', () => {
    const writer = new BinaryStringWriter();
    writer.write(1, 1);
    writer.end();
    expect(writer.toString()).toBe('1');
  });

  it('should write multiple bits', () => {
    const writer = new BinaryStringWriter();
    writer.write(5, 3); // 101 in binary
    expect(writer.toString()).toBe('101');
  });

  it('should pad bits with zeros when needed', () => {
    const writer = new BinaryStringWriter();
    writer.write(1, 4); // 1 in binary, padded to 4 bits
    expect(writer.toString()).toBe('0001');
  });

  it('should concatenate multiple writes', () => {
    const writer = new BinaryStringWriter();
    writer.write(1, 2); // 01
    writer.write(2, 2); // 10
    expect(writer.toString()).toBe('0110');
  });

  it('should handle zero values', () => {
    const writer = new BinaryStringWriter();
    writer.write(0, 4);
    expect(writer.toString()).toBe('0000');
  });

  it('should handle maximum values for given bit length', () => {
    const writer = new BinaryStringWriter();
    writer.write(7, 3); // 111 in binary (max value for 3 bits)
    expect(writer.toString()).toBe('111');
  });

  it('should handle maximum 32-bit unsigned integer value', () => {
    const writer = new BinaryStringWriter();
    writer.write(0xffffffff, 32); // 11111111111111111111111111111111 in binary
    expect(writer.toString()).toBe('11111111111111111111111111111111');
  });

  it('should return empty string when no writes have been performed', () => {
    const writer = new BinaryStringWriter();
    expect(writer.toString()).toBe('');
  });
});
