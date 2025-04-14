import { describe, it, expect } from 'vitest';
import { FibWriter } from './FibWriter';
import { BinaryStringWriter } from './BinaryStringWriter';

describe('FibWriter', () => {
  it('should encode small numbers correctly', () => {
    const writer = new BinaryStringWriter();
    const fibWriter = new FibWriter(writer);

    expect(writer.toString()).toBe('');

    // Test value 1
    fibWriter.write(1);
    expect(writer.toString()).toBe('11'); // 1 + terminating '1'

    // Test value 2
    const writer2 = new BinaryStringWriter();
    const fibWriter2 = new FibWriter(writer2);
    fibWriter2.write(2);
    expect(writer2.toString()).toBe('011'); // 2 + terminating '1'

    // Test value 3
    const writer3 = new BinaryStringWriter();
    const fibWriter3 = new FibWriter(writer3);
    fibWriter3.write(3);
    expect(writer3.toString()).toBe('0011'); // 1 + 2 + terminating '1'

    // Test value 4
    const writer4 = new BinaryStringWriter();
    const fibWriter4 = new FibWriter(writer4);
    fibWriter4.write(4);
    expect(writer4.toString()).toBe('1011'); // 1 + 3 + terminating '1'

    // Test value 5
    const writer5 = new BinaryStringWriter();
    const fibWriter5 = new FibWriter(writer5);
    fibWriter5.write(5);
    expect(writer5.toString()).toBe('00011'); // 5 + terminating '1'
  });

  it('should encode larger numbers correctly', () => {
    const writer = new BinaryStringWriter();
    const fibWriter = new FibWriter(writer);

    // Test value 100
    fibWriter.write(100);
    expect(writer.toString()).toBe('00101000011');

    // Test value 200
    const writer2 = new BinaryStringWriter();
    const fibWriter2 = new FibWriter(writer2);
    fibWriter2.write(200);
    expect(writer2.toString()).toBe('100000001011');

    // Test value 400
    const writer3 = new BinaryStringWriter();
    const fibWriter3 = new FibWriter(writer3);
    fibWriter3.write(400);
    expect(writer3.toString()).toBe('01000010000011');

    // Test value 0xffffffff (max uint32)
    const writerMax = new BinaryStringWriter();
    const fibWriterMax = new FibWriter(writerMax);
    fibWriterMax.write(0xffffffff);
    expect(writerMax.toString()).toBe('00100100100010000000100010100010101000010001011');
  });

  it('should handle multiple writes', () => {
    const writer = new BinaryStringWriter();
    const fibWriter = new FibWriter(writer);

    fibWriter.write(1);
    fibWriter.write(2);
    fibWriter.write(3);
    expect(writer.toString()).toBe('110110011'); // 1 + 2 + 3 with terminating '1's
  });

  it('should throw for invalid values', () => {
    const writer = new BinaryStringWriter();
    const fibWriter = new FibWriter(writer);

    // Test non-integer
    expect(() => fibWriter.write(1.5)).toThrow();

    // Test zero
    expect(() => fibWriter.write(0)).toThrow();

    // Test value larger than 0xffffffff
    expect(() => fibWriter.write(0xffffffff + 1)).toThrow();
  });
});
