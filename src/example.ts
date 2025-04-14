import { FibbitWriter, FibbitReader, Base64URLWriter, Base64URLReader } from './index';

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
// Raw bits -> 0 11 11 11 00010011 011 = 011111100010011011
//
// base64-url encoding:
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
