import { describe, it, expect, beforeEach } from 'vitest';
import { FibbitWriter } from './FibbitWriter';
import { BitWriter } from './BitWriter';

// Mock BitWriter implementation
class MockBitWriter implements BitWriter {
  public output: string = '';
  public ended: boolean = false;

  write(value: number, nBits: number): void {
    if (this.ended) {
      throw new Error('Cannot write after end() has been called.');
    }
    for (let i = 0; i < nBits; i++) {
      const bit = (value >>> (nBits - i - 1)) & 1;
      this.output += bit.toString();
    }
  }

  end(): void {
    this.ended = true;
  }
}

describe('FibbitWriter', () => {
  let mockBitWriter: MockBitWriter;
  let fibbitWriter: FibbitWriter;

  beforeEach(() => {
    mockBitWriter = new MockBitWriter();
    // NOTE: The FibWriter used internally needs to be consistent with these expectations.
    // We assume FibWriter encodes n as standard Fibonacci code + '1'.
    // e.g. 1 -> 11, 2 -> 011, 3 -> 0011, 4 -> 1011
    fibbitWriter = new FibbitWriter(mockBitWriter);
  });

  it('should be defined', () => {
    expect(FibbitWriter).toBeDefined();
    expect(fibbitWriter).toBeInstanceOf(FibbitWriter);
  });

  // --- Write Tests --- 

  it('should write the first bit directly', () => {
    fibbitWriter.write(1, 1); // Write '1'
    expect(mockBitWriter.output).toBe('1');
    fibbitWriter.end();
    // First bit '1' + Fib(1) = '1' + '11'
    expect(mockBitWriter.output).toBe('111');
  });

  it('should write the first bit directly (0)', () => {
    fibbitWriter.write(0, 1); // Write '0'
    expect(mockBitWriter.output).toBe('0');
    fibbitWriter.end();
    // First bit '0' + Fib(1) = '0' + '11'
    expect(mockBitWriter.output).toBe('011');
  });

  it('should encode a simple run of ones', () => {
    fibbitWriter.write(0b111, 3); // Write '111'
    expect(mockBitWriter.output).toBe('1'); // Only first bit written directly
    fibbitWriter.end();
    // First bit '1' + Fib(3) = '1' + '0011'
    expect(mockBitWriter.output).toBe('10011');
  });

  it('should encode a long run of ones', () => {
    fibbitWriter.write(1, 1);
    fibbitWriter.write(0xf, 4);
    fibbitWriter.write(0xfff, 12);
    fibbitWriter.write(0xfffff, 20);
    fibbitWriter.write(0x7fffff, 23);
    fibbitWriter.write(0xffffffff, 32);
    fibbitWriter.end();
    // First bit '1' + Fib(92) = '1' + '00100000011'
    expect(mockBitWriter.output).toBe('100100000011');
  });

  it('should encode a simple run of zeroes', () => {
    fibbitWriter.write(0, 8); // Write '00000000'
    expect(mockBitWriter.output).toBe('0'); // Only first bit written directly
    fibbitWriter.end();
    // First bit '0' + Fib(8) = '0' + '000011'
    expect(mockBitWriter.output).toBe('0000011');
  });

  it('should encode a long run of zeroes', () => {
    fibbitWriter.write(0, 31);
    fibbitWriter.write(0, 32);
    fibbitWriter.end();
    // First bit '0' + Fib(63) = '0' + '0000100011'
    expect(mockBitWriter.output).toBe('00000100011');
  });

  it('should encode multiple runs', () => {
    fibbitWriter.write(0b110001, 6); // Write '110001'
    // First bit: 1. Output: '1'. currentRun=1, currentBit=1.
    // Next bit 1: currentRun=2.
    // Next bit 0: flush run 1 (len 2). Fib(2)='011'. Output: '1' + '011' = '1011'. currentRun=1, currentBit=0.
    // Next bit 0: currentRun=2.
    // Next bit 0: currentRun=3.
    // Next bit 1: flush run 0 (len 3). Fib(3)='0011'. Output: '1011' + '0011' = '10110011'. currentRun=1, currentBit=1.
    expect(mockBitWriter.output).toBe('10110011');
    fibbitWriter.end();
    // End: flush run 1 (len 1). Fib(1)='11'.
    // Expected output: 1 (first) + 011 (Fib(2)) + 0011 (Fib(3)) + 11 (Fib(1))
    expect(mockBitWriter.output).toBe('1011001111');
  });

  it('should handle writing multiple values', () => {
    fibbitWriter.write(0b11, 2);   // Write '11'. First '1' out. Run '1' len 2.
    // Output: '1'
    fibbitWriter.write(0b000, 3); // Write '000'. First '0' triggers flush run '1' (len 2) -> Fib(2)='011'. Run '0' len 3.
    // Output: '1' + '011' = '1011'
    fibbitWriter.write(0b1, 1);   // Write '1'. First '1' triggers flush run '0' (len 3) -> Fib(3)='0011'. Run '1' len 1.
    // Output: '1011' + '0011' = '10110011'
    // Expected before end: 1 (first) + 011 (Fib(2)) + 0011 (Fib(3))
    expect(mockBitWriter.output).toBe('10110011');
    fibbitWriter.end();
    // End: flush run '1' (len 1) -> Fib(1) = '11'
    // Expected after end: 1 (first) + 011 (Fib(2)) + 0011 (Fib(3)) + 11 (Fib(1))
    expect(mockBitWriter.output).toBe('1011001111');
  });

  it('should handle writing multiple values (2)', () => {
    fibbitWriter.write(0, 1);
    fibbitWriter.write(1, 1);
    fibbitWriter.write(0, 1);
    fibbitWriter.end();
    expect(mockBitWriter.output).toBe('0111111');
  });

  it('should handle writing multiple values (3)', () => {
    fibbitWriter.write(0, 32);
    fibbitWriter.write(1, 1);
    fibbitWriter.write(0, 1);
    fibbitWriter.write(0xffffffff, 32);
    fibbitWriter.end();
    expect(mockBitWriter.output).toBe('000101011111100101011');
  });

  it('should handle writing multiple values (3)', () => {
    fibbitWriter.write(3, 2);
    fibbitWriter.write(1, 1);
    fibbitWriter.write(0, 4);
    fibbitWriter.write(0, 16);
    fibbitWriter.write(12, 4);
    fibbitWriter.write(3, 4);
    fibbitWriter.end();
    expect(mockBitWriter.output).toBe('1001101010110111011011');
  });

  // --- End Tests ---

  it('should call end on the underlying BitWriter', () => {
    // Need to write something first to initialize internal state correctly
    fibbitWriter.write(1, 1);
    // Flush the initial run manually before checking end status
    fibbitWriter.flush();
    // Now call end
    fibbitWriter.end();
    expect(mockBitWriter.ended).toBe(true);
  });


  it('should flush the final run on end', () => {
    fibbitWriter.write(0b00, 2); // Write '00'. First '0' out. Run '0', len=2.
    expect(mockBitWriter.output).toBe('0');
    fibbitWriter.end();
    // End: flush run '0' (len 2) -> Fib(2)='011'.
    // Expected: 0 (first) + 011 (Fib(2))
    expect(mockBitWriter.output).toBe('0011');
  });

  it('end should do nothing if no bits were written', () => {
    fibbitWriter.end();
    expect(mockBitWriter.output).toBe('');
    expect(mockBitWriter.ended).toBe(true);
  });

  it('should throw an error for nBits = 0', () => {
    expect(() => fibbitWriter.write(0, 0)).toThrow();
  });

  it('should throw an error for nBits = 33', () => {
    expect(() => fibbitWriter.write(0, 33)).toThrow();
  });

  it('should throw an error for non-integer nBits', () => {
    expect(() => fibbitWriter.write(0, 1.5)).toThrow();
  });

  it('should throw an error for value = -1', () => {
    expect(() => fibbitWriter.write(-1, 4)).toThrow();
  });

  it('should throw an error for value greater than max allowed', () => {
    const nBits = 4;
    const maxValue = (1 << nBits) - 1; // 15 for nBits = 4
    expect(() => fibbitWriter.write(maxValue + 1, nBits)).toThrow();
  });

  it('should throw an error for non-integer value', () => {
    expect(() => fibbitWriter.write(1.5, 4)).toThrow();
  });
});
