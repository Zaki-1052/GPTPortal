// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.
import { APIResource } from 'openai/resource';
import { isRequestOptions } from 'openai/core';
import * as CheckpointsAPI from 'openai/resources/fine-tuning/jobs/checkpoints';
import { CursorPage } from 'openai/pagination';
export class Checkpoints extends APIResource {
    list(fineTuningJobId, query = {}, options) {
        if (isRequestOptions(query)) {
            return this.list(fineTuningJobId, {}, query);
        }
        return this._client.getAPIList(`/fine_tuning/jobs/${fineTuningJobId}/checkpoints`, FineTuningJobCheckpointsPage, { query, ...options });
    }
}
export class FineTuningJobCheckpointsPage extends CursorPage {
}
(function (Checkpoints) {
    Checkpoints.FineTuningJobCheckpointsPage = CheckpointsAPI.FineTuningJobCheckpointsPage;
})(Checkpoints || (Checkpoints = {}));
//# sourceMappingURL=checkpoints.mjs.map