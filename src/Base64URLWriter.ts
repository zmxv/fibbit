import { BitWriter } from './BitWriter';
import { validateInteger } from './validator';
import { CHARS } from './base64url';

export class Base64URLWriter implements BitWriter {
  private buf: number = 0;
  private bits: number = 6;
  private result: string = '';

  write(value: number, nBits: number): void {
    validateInteger(nBits, 1, 32);
    validateInteger(value, 0, Math.pow(2, nBits) - 1);

    let bitsRemaining = nBits;
    while (bitsRemaining > 0) {
      const n = Math.min(bitsRemaining, this.bits);
      const mask = (1 << n) - 1;
      const chunk = (value >>> (bitsRemaining - n)) & mask;
      this.buf |= chunk << (this.bits - n);
      bitsRemaining -= n;
      this.bits -= n;
      if (this.bits === 0) {
        this.result += CHARS[this.buf];
        this.buf = 0;
        this.bits = 6;
      }
    }
  }

  end(): void {
    if (this.bits !== 6) {
      this.result += CHARS[this.buf];
    }
  }

  /**
   * Finalizes the writing process and returns the base64url encoded string.
   * Any remaining bits in the buffer are padded with zeros to form a final
   * base64url character. No '=' padding characters are added.
   * @returns The base64url encoded string.
   */
  toString(): string {
    return this.result;
  }
}
