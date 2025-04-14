import { BitReader } from './BitReader';
import { validateInteger } from './validator';

export class BinaryStringReader implements BitReader {
  private readonly content: string;
  private pos: number;

  constructor(content: string) {
    this.content = content;
    this.pos = 0;
  }

  read(nBits: number): number {
    validateInteger(nBits, 1, 32);
    if (this.pos + nBits > this.content.length) {
      throw new EvalError('cannot read more bits from the bit stream');
    }
    const result = parseInt(this.content.slice(this.pos, this.pos + nBits), 2);
    this.pos += nBits;
    return result;
  }

  done(): boolean {
    return this.pos >= this.content.length;
  }
}
