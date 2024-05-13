// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
import { APIResource } from "../../resource.mjs";
import { multipartFormRequestOptions } from "../../core.mjs";
export class Translations extends APIResource {
    /**
     * Translates audio into English.
     */
    create(body, options) {
        return this._client.post('/audio/translations', multipartFormRequestOptions({ body, ...options }));
    }
}
(function (Translations) {
})(Translations || (Translations = {}));
//# sourceMappingURL=translations.mjs.map