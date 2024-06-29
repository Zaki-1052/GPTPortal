/* tslint:disable */
/* eslint-disable */
/**
*/
export class Tiktoken {
  free(): void;
/**
* @param {string} tiktoken_bfe
* @param {any} special_tokens
* @param {string} pat_str
*/
  constructor(tiktoken_bfe: string, special_tokens: Record<string, number>, pat_str: string);
/**
* @param {string} text
* @param {any} allowed_special
* @param {any} disallowed_special
* @returns {Uint32Array}
*/
  encode(text: string, allowed_special?: "all" | string[], disallowed_special?: "all" | string[]): Uint32Array;
/**
* @param {string} text
* @returns {Uint32Array}
*/
  encode_ordinary(text: string): Uint32Array;
/**
* @param {string} text
* @param {any} allowed_special
* @param {any} disallowed_special
* @returns {any}
*/
  encode_with_unstable(text: string, allowed_special?: "all" | string[], disallowed_special?: "all" | string[]): any;
/**
* @param {Uint8Array} bytes
* @returns {number}
*/
  encode_single_token(bytes: Uint8Array): number;
/**
* @param {Uint32Array} tokens
* @returns {Uint8Array}
*/
  decode(tokens: Uint32Array): Uint8Array;
/**
* @param {number} token
* @returns {Uint8Array}
*/
  decode_single_token_bytes(token: number): Uint8Array;
/**
* @returns {any}
*/
  token_byte_values(): Array<Array<number>>;
/**
*/
  readonly name: string | undefined;
}
