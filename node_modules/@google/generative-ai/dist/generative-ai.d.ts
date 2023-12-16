/**
 * Base parameters for a number of methods.
 * @public
 */
export declare interface BaseParams {
    safetySettings?: SafetySetting[];
    generationConfig?: GenerationConfig;
}

/**
 * Params for calling  {@link GenerativeModel.batchEmbedContents}
 * @public
 */
export declare interface BatchEmbedContentsRequest {
    requests: EmbedContentRequest[];
}

/**
 * Response from calling {@link GenerativeModel.batchEmbedContents}.
 * @public
 */
export declare interface BatchEmbedContentsResponse {
    embeddings: ContentEmbedding[];
}

/**
 * Reason that a prompt was blocked.
 * @public
 */
export declare enum BlockReason {
    BLOCKED_REASON_UNSPECIFIED = "BLOCKED_REASON_UNSPECIFIED",
    SAFETY = "SAFETY",
    OTHER = "OTHER"
}

/**
 * ChatSession class that enables sending chat messages and stores
 * history of sent and received messages so far.
 *
 * @public
 */
export declare class ChatSession {
    model: string;
    params?: StartChatParams;
    private _apiKey;
    private _history;
    private _sendPromise;
    constructor(apiKey: string, model: string, params?: StartChatParams);
    /**
     * Gets the chat history so far. Blocked prompts are not added to history.
     * Blocked candidates are not added to history, nor are the prompts that
     * generated them.
     */
    getHistory(): Promise<Content[]>;
    /**
     * Sends a chat message and receives a non-streaming
     * {@link GenerateContentResult}
     */
    sendMessage(request: string | Array<string | Part>): Promise<GenerateContentResult>;
    /**
     * Sends a chat message and receives the response as a
     * {@link GenerateContentStreamResult} containing an iterable stream
     * and a response promise.
     */
    sendMessageStream(request: string | Array<string | Part>): Promise<GenerateContentStreamResult>;
}

/**
 * Citation metadata that may be found on a {@link GenerateContentCandidate}.
 * @public
 */
export declare interface CitationMetadata {
    citationSources: CitationSource[];
}

/**
 * A single citation source.
 * @public
 */
export declare interface CitationSource {
    startIndex?: number;
    endIndex?: number;
    uri?: string;
    license?: string;
}

/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Content type for both prompts and response candidates.
 * @public
 */
export declare interface Content extends InputContent {
    parts: Part[];
}

/**
 * A single content embedding.
 * @public
 */
export declare interface ContentEmbedding {
    values: number[];
}

/**
 * Params for calling {@link GenerativeModel.countTokens}
 * @public
 */
export declare interface CountTokensRequest {
    contents: Content[];
}

/**
 * Response from calling {@link GenerativeModel.countTokens}.
 * @public
 */
export declare interface CountTokensResponse {
    totalTokens: number;
}

/**
 * Params for calling {@link GenerativeModel.embedContent}
 * @public
 */
export declare interface EmbedContentRequest {
    content: Content;
    taskType?: TaskType;
    title?: string;
}

/**
 * Response from calling {@link GenerativeModel.embedContent}.
 * @public
 */
export declare interface EmbedContentResponse {
    embedding: ContentEmbedding;
}

/**
 * Response object wrapped with helper methods.
 *
 * @public
 */
export declare interface EnhancedGenerateContentResponse extends GenerateContentResponse {
    /**
     * Returns the text string from the response, if available.
     * Throws if the prompt or candidate was blocked.
     */
    text: () => string;
}

/**
 * Reason that a candidate finished.
 * @public
 */
export declare enum FinishReason {
    FINISH_REASON_UNSPECIFIED = "FINISH_REASON_UNSPECIFIED",
    STOP = "STOP",
    MAX_TOKENS = "MAX_TOKENS",
    SAFETY = "SAFETY",
    RECITATION = "RECITATION",
    OTHER = "OTHER"
}

/**
 * A candidate returned as part of a {@link GenerateContentResponse}.
 * @public
 */
export declare interface GenerateContentCandidate {
    index: number;
    content: Content;
    finishReason?: FinishReason;
    finishMessage?: string;
    safetyRatings?: SafetyRating[];
    citationMetadata?: CitationMetadata;
}

/**
 * Request sent to `generateContent` endpoint.
 * @public
 */
export declare interface GenerateContentRequest extends BaseParams {
    contents: Content[];
}

/**
 * Individual response from {@link GenerativeModel.generateContent} and
 * {@link GenerativeModel.generateContentStream}.
 * `generateContentStream()` will return one in each chunk until
 * the stream is done.
 * @public
 */
export declare interface GenerateContentResponse {
    candidates?: GenerateContentCandidate[];
    promptFeedback?: PromptFeedback;
}

/**
 * Result object returned from generateContent() call.
 *
 * @public
 */
export declare interface GenerateContentResult {
    response: EnhancedGenerateContentResponse;
}

/**
 * Result object returned from generateContentStream() call.
 * Iterate over `stream` to get chunks as they come in and/or
 * use the `response` promise to get the aggregated response when
 * the stream is done.
 *
 * @public
 */
export declare interface GenerateContentStreamResult {
    stream: AsyncGenerator<EnhancedGenerateContentResponse>;
    response: Promise<EnhancedGenerateContentResponse>;
}

/**
 * Config options for content-related requests
 * @public
 */
export declare interface GenerationConfig {
    candidateCount?: number;
    stopSequences?: string[];
    maxOutputTokens?: number;
    temperature?: number;
    topP?: number;
    topK?: number;
}

/**
 * Interface for sending an image.
 * @public
 */
export declare interface GenerativeContentBlob {
    mimeType: string;
    /**
     * Image as a base64 string.
     */
    data: string;
}

/**
 * Class for generative model APIs.
 * @public
 */
export declare class GenerativeModel {
    apiKey: string;
    model: string;
    generationConfig: GenerationConfig;
    safetySettings: SafetySetting[];
    constructor(apiKey: string, modelParams: ModelParams);
    /**
     * Makes a single non-streaming call to the model
     * and returns an object containing a single {@link GenerateContentResponse}.
     */
    generateContent(request: GenerateContentRequest | string | Array<string | Part>): Promise<GenerateContentResult>;
    /**
     * Makes a single streaming call to the model
     * and returns an object containing an iterable stream that iterates
     * over all chunks in the streaming response as well as
     * a promise that returns the final aggregated response.
     */
    generateContentStream(request: GenerateContentRequest | string | Array<string | Part>): Promise<GenerateContentStreamResult>;
    /**
     * Gets a new {@link ChatSession} instance which can be used for
     * multi-turn chats.
     */
    startChat(startChatParams?: StartChatParams): ChatSession;
    /**
     * Counts the tokens in the provided request.
     */
    countTokens(request: CountTokensRequest | string | Array<string | Part>): Promise<CountTokensResponse>;
    /**
     * Embeds the provided content.
     */
    embedContent(request: EmbedContentRequest | string | Array<string | Part>): Promise<EmbedContentResponse>;
    /**
     * Embeds an array of {@link EmbedContentRequest}s.
     */
    batchEmbedContents(batchEmbedContentRequest: BatchEmbedContentsRequest): Promise<BatchEmbedContentsResponse>;
}

/**
 * Top-level class for this SDK
 * @public
 */
export declare class GoogleGenerativeAI {
    apiKey: string;
    constructor(apiKey: string);
    /**
     * Gets a {@link GenerativeModel} instance for the provided model name.
     */
    getGenerativeModel(modelParams: ModelParams): GenerativeModel;
}

/**
 * Threshhold above which a prompt or candidate will be blocked.
 * @public
 */
export declare enum HarmBlockThreshold {
    HARM_BLOCK_THRESHOLD_UNSPECIFIED = "HARM_BLOCK_THRESHOLD_UNSPECIFIED",
    BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE",
    BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE",
    BLOCK_ONLY_HIGH = "BLOCK_ONLY_HIGH",
    BLOCK_NONE = "BLOCK_NONE"
}

/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Harm categories that would cause prompts or candidates to be blocked.
 * @public
 */
export declare enum HarmCategory {
    HARM_CATEGORY_UNSPECIFIED = "HARM_CATEGORY_UNSPECIFIED",
    HARM_CATEGORY_HATE_SPEECH = "HARM_CATEGORY_HATE_SPEECH",
    HARM_CATEGORY_SEXUALLY_EXPLICIT = "HARM_CATEGORY_SEXUALLY_EXPLICIT",
    HARM_CATEGORY_HARASSMENT = "HARM_CATEGORY_HARASSMENT",
    HARM_CATEGORY_DANGEROUS_CONTENT = "HARM_CATEGORY_DANGEROUS_CONTENT"
}

/**
 * Probability that a prompt or candidate matches a harm category.
 * @public
 */
export declare enum HarmProbability {
    HARM_PROBABILITY_UNSPECIFIED = "HARM_PROBABILITY_UNSPECIFIED",
    NEGLIGIBLE = "NEGLIGIBLE",
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH"
}

/**
 * Content part interface if the part represents an image.
 * @public
 */
export declare interface InlineDataPart {
    text?: never;
    inlineData: GenerativeContentBlob;
}

/**
 * Content that can be provided as history input to startChat().
 * @public
 */
export declare interface InputContent {
    parts: string | Array<string | Part>;
    role: string;
}

/**
 * Params passed to {@link GoogleGenerativeAI.getGenerativeModel}.
 * @public
 */
export declare interface ModelParams extends BaseParams {
    model: string;
}

/**
 * Content part - includes text or image part types.
 * @public
 */
export declare type Part = TextPart | InlineDataPart;

/**
 * If the prompt was blocked, this will be populated with `blockReason` and
 * the relevant `safetyRatings`.
 * @public
 */
export declare interface PromptFeedback {
    blockReason: BlockReason;
    safetyRatings: SafetyRating[];
    blockReasonMessage?: string;
}

/**
 * A safety rating associated with a {@link GenerateContentCandidate}
 * @public
 */
export declare interface SafetyRating {
    category: HarmCategory;
    probability: HarmProbability;
}

/**
 * Safety setting that can be sent as part of request parameters.
 * @public
 */
export declare interface SafetySetting {
    category: HarmCategory;
    threshold: HarmBlockThreshold;
}

/**
 * Params for {@link GenerativeModel.startChat}.
 * @public
 */
export declare interface StartChatParams extends BaseParams {
    history?: InputContent[];
}

/**
 * Task type for embedding content.
 * @public
 */
export declare enum TaskType {
    TASK_TYPE_UNSPECIFIED = "TASK_TYPE_UNSPECIFIED",
    RETRIEVAL_QUERY = "RETRIEVAL_QUERY",
    RETRIEVAL_DOCUMENT = "RETRIEVAL_DOCUMENT",
    SEMANTIC_SIMILARITY = "SEMANTIC_SIMILARITY",
    CLASSIFICATION = "CLASSIFICATION",
    CLUSTERING = "CLUSTERING"
}

/**
 * Content part interface if the part represents a text string.
 * @public
 */
export declare interface TextPart {
    text: string;
    inlineData?: never;
}

export { }
