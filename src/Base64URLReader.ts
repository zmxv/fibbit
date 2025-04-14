import { BitReader } from './BitReader';
import { validateInteger } from './validator';
import { CHARS } from './base64url';

export class Base64URLReader implements BitReader {
  private readonly content: string;
  private pos: number = 0;
  private buf: number = 0;
  private bits: number = 0;

  constructor(content: string) {
    this.content = content;
  }

  read(nBits: number): number {
    validateInteger(nBits, 1, 32);

    let result = 0;
    let bitsRemaining = nBits;
    while (bitsRemaining > 0) {
      if (!this.bits) {
        if (this.pos >= this.content.length) {
          throw new EvalError('Attempted to read past the end of the input.');
        }
        const ch = CHARS.indexOf(this.content[this.pos++]);
        if (ch < 0) {
          throw new RangeError('Invalid Base64URL character encountered');
        }
        this.buf = ch;
        this.bits = 6;
      }

      const bitsToRead = Math.min(bitsRemaining, this.bits);
      result = (result << bitsToRead) | ((this.buf >>> (this.bits - bitsToRead)) & ((1 << bitsToRead) - 1));
      this.bits -= bitsToRead;
      bitsRemaining -= bitsToRead;
    }
    return result;
  }

  done(): boolean {
    // Done if we have processed all characters and the buffer is empty
    return this.pos >= this.content.length && this.bits === 0;
  }
}
