import { describe, it, expect } from 'vitest';
import { fibonacci as fib } from './fibonacci';

describe('Fibonacci Sequence', () => {
  it('should contain the correct Fibonacci sequence values', () => {
    // Check the first few values
    expect(fib[0]).toBe(1);
    expect(fib[1]).toBe(2);
    expect(fib[2]).toBe(3);
    expect(fib[3]).toBe(5);
    expect(fib[4]).toBe(8);
    expect(fib[5]).toBe(13);
    expect(fib[6]).toBe(21);
    expect(fib[7]).toBe(34);
    expect(fib[8]).toBe(55);
    expect(fib[9]).toBe(89);
  });

  it('should have the correct length', () => {
    expect(fib.length).toBe(46);
  });

  it('should follow the Fibonacci pattern (each number is the sum of the two preceding ones)', () => {
    for (let i = 2; i < fib.length; i++) {
      expect(fib[i]).toBe(fib[i - 1] + fib[i - 2]);
    }
  });

  it('should contain some specific large Fibonacci numbers', () => {
    // Check some specific large values
    expect(fib[40]).toBe(267914296);
    expect(fib[41]).toBe(433494437);
    expect(fib[42]).toBe(701408733);
    expect(fib[43]).toBe(1134903170);
    expect(fib[44]).toBe(1836311903);
    expect(fib[45]).toBe(2971215073);
  });
});
