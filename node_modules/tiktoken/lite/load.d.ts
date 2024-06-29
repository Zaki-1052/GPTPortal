export declare function load(registry: ({
    load_tiktoken_bpe: string;
} | {
    data_gym_to_mergeable_bpe_ranks: {
        vocab_bpe_file: string;
        encoder_json_file: string;
    };
}) & {
    explicit_n_vocab?: number;
    pat_str: string;
    special_tokens: Record<string, number>;
}, customFetch?: (url: string) => Promise<string>): Promise<{
    explicit_n_vocab: number | undefined;
    pat_str: string;
    special_tokens: Record<string, number>;
    bpe_ranks: string;
}>;
