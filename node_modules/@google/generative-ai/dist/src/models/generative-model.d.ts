/**
 * @license
 * Copyright 2024 Google LLC
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
import { BatchEmbedContentsRequest, BatchEmbedContentsResponse, CountTokensRequest, CountTokensResponse, EmbedContentRequest, EmbedContentResponse, GenerateContentRequest, GenerateContentResult, GenerateContentStreamResult, GenerationConfig, ModelParams, Part, RequestOptions, SafetySetting, StartChatParams, Tool } from "../../types";
import { ChatSession } from "../methods/chat-session";
/**
 * Class for generative model APIs.
 * @public
 */
export declare class GenerativeModel {
    apiKey: string;
    model: string;
    generationConfig: GenerationConfig;
    safetySettings: SafetySetting[];
    requestOptions: RequestOptions;
    tools?: Tool[];
    constructor(apiKey: string, modelParams: ModelParams, requestOptions?: RequestOptions);
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
