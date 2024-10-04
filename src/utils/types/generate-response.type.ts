export interface GenerateResponse {
  headers: Record<string, string>;
  code: number;
  buffer: Buffer;
}
