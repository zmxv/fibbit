import { BitWriter } from './BitWriter';
import { validateInteger } from './validator';

export class BinaryStringWriter implements BitWriter {
  private result: string = '';

  write(value: number, nBits: number): void {
    validateInteger(nBits, 1, 32);
    validateInteger(value, 0, Math.pow(2, nBits) - 1);
    this.result += value.toString(2).padStart(nBits, '0');
  }

  end(): void {
  }

  toString(): string {
    return this.result;
  }
}