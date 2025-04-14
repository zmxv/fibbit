# Fibbit

Fibbit is a lossless compression algorithm that combines Fibonacci coding and RLE (run-length encoding). It is efficient for encoding sparse bit streams (streams with long runs of identical bits). For certain input patterns, Fibbit can produce shorter output than Roaring Bitmap, Elias Gamma/Delta/Omega, WAH (Word Aligned Hybrid), EWAH (Enhanced Word Aligned Hybrid), or Golomb coding.

This TypeScript library is a reference implementation of the Fibbit encoder and decoder.

## Fibbit algorithm

1.  **First Bit:** The very first bit of the input stream is written directly to the output.
2.  **Run-Length Encoding:** The encoder counts consecutive occurrences of the same bit (a "run").
3.  **Alternating Bits:** When the bit value changes, the length of the completed run is encoded. The encoder then starts counting the run of the new bit value.
4.  **Fibonacci Coding:** Run lengths are encoded using Fibonacci coding. Specifically, to encode an integer *n*, find the unique set of non-consecutive Fibonacci numbers that sum to *n*, represent these as a bitmask in reverse order (largest Fibonacci number last), and append a final `1` bit as a terminator.
5.  **Decoding:** The decoder reads the first bit, then parses Fibonacci codes to determine the lengths of subsequent runs, alternating the bit value for each run.

## Installation

```bash
npm install fibbit
```

## Usage

The library exports `FibbitWriter` for encoding and `FibbitReader` for decoding. These classes operate on generic `BitWriter` and `BitReader` interfaces, offering flexibility in how the resulting encoded data is stored, transmitted, or encoded further.

The package includes `BitWriter` and `BitReader` implementations for writing to and reading from base64url-encoded strings: `Base64URLWriter` and `Base64URLReader`.

`BinaryStringWriter` and `BinaryStringReader` are also provided, primarily for testing purposes.

## Example

```typescript
import { FibbitWriter, FibbitReader, Base64URLWriter, Base64URLReader } from 'fibbit';

// --- Encoding ---

// Create a writer that outputs a base64url string
const base64Writer = new Base64URLWriter();

// Create a Fibbit writer that outputs bits to the base64url writer
const fibbitWriter = new FibbitWriter(base64Writer);

// Write some data
fibbitWriter.write(0b10, 3); // Write 010
fibbitWriter.write(0b1111111111111111, 16); // Write 16 repeated 1's
fibbitWriter.write(0b1111111111, 10); // Write 10 more repeated 1's
fibbitWriter.write(0, 2); // Write 00

// Signal the end of writing
fibbitWriter.end();

// Get the encoded base64url string
const encodedData = base64Writer.toString();
console.log('Encoded:', encodedData); // 'fib'

// Example Output based on the writes above:
//
// Input bits -> 0101111111111111111111111111100
// Alternating runs of 0's and 1's -> 0 1 0 11111111111111111111111111 00
// Run lengths -> 1 1 1 26 2
//
// Fibbit encoding:
// First bit -> 0
// Single 0 -> Fib(1) = 11
// Single 1 -> Fib(1) = 11
// Single 0 -> Fib(1) = 11
// Run of 26 1's -> Fib(26) = 00010011
// Run of two 0's (last two bits) -> Fib(2) = 011
// Concatenated bits -> 0 11 11 11 00010011 011 = 011111100010011011
//
// Base64-url encoding:
// 6-bit chunks -> 011111 100010 011011
// Encoded data -> 'fib'

// --- Decoding ---

// Create a reader for the encoded base64url string
const base64Reader = new Base64URLReader(encodedData);
const fibbitReader = new FibbitReader(base64Reader);

let decodedData = '';
while (!fibbitReader.done()) {
  decodedData += fibbitReader.read(1);
}
console.log('Decoded:', decodedData); // '0101111111111111111111111111100'
```

## Local development

1.  Clone the repository
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run tests:
    ```bash
    npm test
    npm test:coverage
    ```
4.  Build the package:
    ```bash
    npm run build
    ```

## License

MIT 