// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
import { APIResource } from 'openai/resource';
import { isRequestOptions } from 'openai/core';
import * as BatchesAPI from 'openai/resources/batches';
import { CursorPage } from 'openai/pagination';
export class Batches extends APIResource {
    /**
     * Creates and executes a batch from an uploaded file of requests
     */
    create(body, options) {
        return this._client.post('/batches', { body, ...options });
    }
    /**
     * Retrieves a batch.
     */
    retrieve(batchId, options) {
        return this._client.get(`/batches/${batchId}`, options);
    }
    list(query = {}, options) {
        if (isRequestOptions(query)) {
            return this.list({}, query);
        }
        return this._client.getAPIList('/batches', BatchesPage, { query, ...options });
    }
    /**
     * Cancels an in-progress batch.
     */
    cancel(batchId, options) {
        return this._client.post(`/batches/${batchId}/cancel`, options);
    }
}
export class BatchesPage extends CursorPage {
}
(function (Batches) {
    Batches.BatchesPage = BatchesAPI.BatchesPage;
})(Batches || (Batches = {}));
//# sourceMappingURL=batches.mjs.map