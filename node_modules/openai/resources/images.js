"use strict";
// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Images = void 0;
const resource_1 = require("../resource.js");
const core_1 = require("../core.js");
class Images extends resource_1.APIResource {
    /**
     * Creates a variation of a given image.
     */
    createVariation(body, options) {
        return this._client.post('/images/variations', (0, core_1.multipartFormRequestOptions)({ body, ...options }));
    }
    /**
     * Creates an edited or extended image given an original image and a prompt.
     */
    edit(body, options) {
        return this._client.post('/images/edits', (0, core_1.multipartFormRequestOptions)({ body, ...options }));
    }
    /**
     * Creates an image given a prompt.
     */
    generate(body, options) {
        return this._client.post('/images/generations', { body, ...options });
    }
}
exports.Images = Images;
(function (Images) {
})(Images = exports.Images || (exports.Images = {}));
//# sourceMappingURL=images.js.map