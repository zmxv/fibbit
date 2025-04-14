export function isValidInteger(value: number, min: number, max: number): boolean {
  return Number.isInteger(value) && value >= min && value <= max;
}

export function validateInteger(value: number, min: number, max: number): void {
  if (!isValidInteger(value, min, max)) {
    throw new RangeError(`invalid integer: ${value}`);
  }
}