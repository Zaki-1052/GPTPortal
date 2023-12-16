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
import { Content, EmbedContentRequest, GenerateContentRequest, Part } from "../../types";
export declare function formatNewContent(request: string | Array<string | Part>, role: string): Content;
export declare function formatGenerateContentInput(params: GenerateContentRequest | string | Array<string | Part>): GenerateContentRequest;
export declare function formatEmbedContentInput(params: EmbedContentRequest | string | Array<string | Part>): EmbedContentRequest;
