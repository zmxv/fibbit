export interface BitReader {
  read(nBits: number): number;
  done(): boolean;
}
