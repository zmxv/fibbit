import { BitReader } from './BitReader';
import { FibReader } from './FibReader';
import { validateInteger } from './validator';

/**
 * A class for reading bits encoded using the Fibbit encoding scheme.
 * It reads the first bit directly, then uses FibReader to decode
 * run lengths of alternating subsequent bits.
 */
export class FibbitReader implements BitReader {
  private bitReader: BitReader;
  private fibReader: FibReader;
  private currentBit: number = -1; // Value of the bit in the current run
  private currentRun: number = 0; // Length of the current run

  constructor(bitReader: BitReader) {
    this.bitReader = bitReader;
    this.fibReader = new FibReader(bitReader);
  }

  /**
   * Reads the specified number of bits from the decoded stream.
   * @param nBits The number of bits to read (must be between 1 and 32).
   * @returns The integer value composed from the read bits.
   * @throws EvalError if not enough bits are available.
   * @throws RangeError if nBits or result is outside the valid range.
   */
  read(nBits: number): number {
    validateInteger(nBits, 1, 32);

    let bitsRemaining = nBits;
    let result = 0;

    if (this.currentBit < 0) {
      this.currentBit = this.bitReader.read(1);
      this.currentRun = this.fibReader.read();
    }

    while (bitsRemaining > 0) {
      if (!this.currentRun) {
        this.currentBit ^= 1;
        this.currentRun = this.fibReader.read();
      }

      const bitsToRead = Math.min(this.currentRun, bitsRemaining);
      result = (result << bitsToRead);
      if (this.currentBit) {
        result = (result | (0xffffffff >>> (32 - bitsToRead))) >>> 0;
      }
      bitsRemaining -= bitsToRead;
      this.currentRun -= bitsToRead;
    }

    return result;
  }

  /**
   * Checks if the reader has reached the end of the bit stream and
   * the internal buffer is empty.
   * @returns True if no more bits can be read, false otherwise.
   */
  done(): boolean {
    if (this.currentBit < 0) {
      return this.bitReader.done();
    }
    return this.currentRun === 0 && this.bitReader.done();
  }
}
