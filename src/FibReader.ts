import { BitReader } from './BitReader';
import { fibonacci as fib } from './fibonacci';

export class FibReader {
  private reader: BitReader;

  constructor(reader: BitReader) {
    this.reader = reader;
  }

  read(): number {
    let result = 0;
    let lastBit = 0;

    for (let i = 0; ; i++) { // Relying on the '11' terminator or error to exit the loop
      const bit = this.reader.read(1);

      if (bit === 1) {
        if (lastBit === 1) {
          // Found '11' terminator.
          if (result > 0xffffffff) {
            throw new RangeError('encoding represents a number larger than 32 bits');
          }
          return result;
        }
        // This is the first '1'. Add the corresponding fib number.
        // But first, check if the index 'i' is valid.
        if (i >= fib.length) {
          // We read a '1' bit but it corresponds to an index
          // beyond our largest Fibonacci number. This implies the number
          // being decoded is too large or the encoding is malformed.
          throw new RangeError('encoding represents a Fibonacci index out of range');
        }
        result += fib[i];
      }
      lastBit = bit;
    }
    // This point should be unreachable due to the loop structure.
  }
}