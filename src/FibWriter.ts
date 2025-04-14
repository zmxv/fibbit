import { BitWriter } from './BitWriter';
import { fibonacci as fib } from './fibonacci';
import { validateInteger } from './validator';

export class FibWriter {
  private writer: BitWriter;

  constructor(writer: BitWriter) {
    this.writer = writer;
  }

  write(value: number): void {
    validateInteger(value, 1, 0xffffffff);

    // Find the largest Fibonacci number that fits
    let remaining = value;
    const bits: number[] = new Array(fib.length).fill(0);
    let lastOneBit = 0;

    for (let i = fib.length - 1; i >= 0; i--) {
      if (remaining >= fib[i]) {
        bits[i] = 1;
        remaining -= fib[i];
        lastOneBit = Math.max(lastOneBit, i);
      }
    }

    // Write the bits up to the last '1' bit
    for (let i = 0; i <= lastOneBit; i++) {
      this.writer.write(bits[i], 1);
    }

    // Add the terminating '1' marker
    this.writer.write(1, 1);
  }
}