export interface BitWriter {
  write(value: number, nBits: number): void;
  end(): void;
}