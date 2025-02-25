/* tslint:disable */
/* eslint-disable */

export type TiktokenEncoding = "gpt2" | "r50k_base" | "p50k_base" | "p50k_edit" | "cl100k_base" | "o200k_base";

/**
 * @param {TiktokenEncoding} encoding
 * @param {Record<string, number>} [extend_special_tokens]
 * @returns {Tiktoken}
 */
export function get_encoding(encoding: TiktokenEncoding, extend_special_tokens?: Record<string, number>): Tiktoken;



export type TiktokenModel =
    | "davinci-002"
    | "babbage-002"
    | "text-davinci-003"
    | "text-davinci-002"
    | "text-davinci-001"
    | "text-curie-001"
    | "text-babbage-001"
    | "text-ada-001"
    | "davinci"
    | "curie"
    | "babbage"
    | "ada"
    | "code-davinci-002"
    | "code-davinci-001"
    | "code-cushman-002"
    | "code-cushman-001"
    | "davinci-codex"
    | "cushman-codex"
    | "text-davinci-edit-001"
    | "code-davinci-edit-001"
    | "text-embedding-ada-002"
    | "text-embedding-3-small"
    | "text-embedding-3-large"
    | "text-similarity-davinci-001"
    | "text-similarity-curie-001"
    | "text-similarity-babbage-001"
    | "text-similarity-ada-001"
    | "text-search-davinci-doc-001"
    | "text-search-curie-doc-001"
    | "text-search-babbage-doc-001"
    | "text-search-ada-doc-001"
    | "code-search-babbage-code-001"
    | "code-search-ada-code-001"
    | "gpt2"
    | "gpt-3.5-turbo"
    | "gpt-35-turbo"
    | "gpt-3.5-turbo-0301"
    | "gpt-3.5-turbo-0613"
    | "gpt-3.5-turbo-1106"
    | "gpt-3.5-turbo-0125"
    | "gpt-3.5-turbo-16k"
    | "gpt-3.5-turbo-16k-0613"
    | "gpt-3.5-turbo-instruct"
    | "gpt-3.5-turbo-instruct-0914"
    | "gpt-4"
    | "gpt-4-0314"
    | "gpt-4-0613"
    | "gpt-4-32k"
    | "gpt-4-32k-0314"
    | "gpt-4-32k-0613"
    | "gpt-4-turbo"
    | "gpt-4-turbo-2024-04-09"
    | "gpt-4-turbo-preview"
    | "gpt-4-1106-preview"
    | "gpt-4-0125-preview"
    | "gpt-4-vision-preview"
    | "gpt-4o"
    | "gpt-4o-2024-05-13"
    | "gpt-4o-2024-08-06"
    | "gpt-4o-2024-11-20"
    | "gpt-4o-mini-2024-07-18"
    | "gpt-4o-mini"
    | "o1"
    | "o1-2024-12-17"
    | "o1-mini"
    | "o1-preview"
    | "o1-preview-2024-09-12"
    | "o1-mini-2024-09-12"
    | "o3-mini"
    | "o3-mini-2025-01-31"
    | "chatgpt-4o-latest"
    | "gpt-4o-realtime"
    | "gpt-4o-realtime-preview-2024-10-01"

/**
 * @param {TiktokenModel} encoding
 * @param {Record<string, number>} [extend_special_tokens]
 * @returns {Tiktoken}
 */
export function encoding_for_model(model: TiktokenModel, extend_special_tokens?: Record<string, number>): Tiktoken;


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
