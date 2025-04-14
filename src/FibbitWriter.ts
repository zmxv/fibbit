import { BitWriter } from './BitWriter';
import { FibWriter } from './FibWriter';
import { validateInteger } from './validator';

/**
 * A class for writing bits using the Fibbit encoding scheme
 */
export class FibbitWriter implements BitWriter {
  private bitWriter: BitWriter;
  private fibWriter: FibWriter;
  private currentBit: number = 0;
  private currentRun: number = 0;
  private firstBit: number = -1;

  constructor(bitWriter: BitWriter) {
    this.bitWriter = bitWriter;
    this.fibWriter = new FibWriter(bitWriter);
  }

  /**
   * Writes a value to the buf using the specified number of bits
   * @param value The value to write
   * @param nBits Number of bits to use for encoding
   */
  write(value: number, nBits: number): void {
    validateInteger(nBits, 1, 32);
    validateInteger(value, 0, Math.pow(2, nBits) - 1);

    for (let i = 0; i < nBits; i++) {
      const bit = (value >>> (nBits - i - 1)) & 1;
      if (this.firstBit === -1) {
        this.firstBit = bit;
        this.bitWriter.write(bit, 1);
        this.currentBit = bit;
        this.currentRun = 1;
      } else {
        if (bit === this.currentBit) {
          this.currentRun++;
        } else {
          this.flush();
          this.currentBit = bit;
          this.currentRun = 1;
        }
      }
    }
  }

  end(): void {
    this.flush();
    this.bitWriter.end();
  }

  /**
   * Flushes the current run and resets it to zero.
   */
  flush(): void {
    if (this.currentRun > 0) {
      this.fibWriter.write(this.currentRun);
      this.currentRun = 0;
    }
  }
}