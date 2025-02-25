/* tslint:disable */
/* eslint-disable */
export class Tiktoken {
  free(): void;
  constructor(tiktoken_bfe: string, special_tokens: Record<string, number>, pat_str: string);
  encode(text: string, allowed_special?: "all" | string[], disallowed_special?: "all" | string[]): Uint32Array;
  encode_ordinary(text: string): Uint32Array;
  encode_with_unstable(text: string, allowed_special?: "all" | string[], disallowed_special?: "all" | string[]): any;
  encode_single_token(bytes: Uint8Array): number;
  decode(tokens: Uint32Array): Uint8Array;
  decode_single_token_bytes(token: number): Uint8Array;
  token_byte_values(): Array<Array<number>>;
  readonly name: string | undefined;
}
