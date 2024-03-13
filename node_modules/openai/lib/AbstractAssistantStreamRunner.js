"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _AbstractAssistantStreamRunner_connectedPromise, _AbstractAssistantStreamRunner_resolveConnectedPromise, _AbstractAssistantStreamRunner_rejectConnectedPromise, _AbstractAssistantStreamRunner_endPromise, _AbstractAssistantStreamRunner_resolveEndPromise, _AbstractAssistantStreamRunner_rejectEndPromise, _AbstractAssistantStreamRunner_listeners, _AbstractAssistantStreamRunner_ended, _AbstractAssistantStreamRunner_errored, _AbstractAssistantStreamRunner_aborted, _AbstractAssistantStreamRunner_catchingPromiseCreated, _AbstractAssistantStreamRunner_handleError;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractAssistantStreamRunner = void 0;
const error_1 = require("openai/error");
class AbstractAssistantStreamRunner {
    constructor() {
        this.controller = new AbortController();
        _AbstractAssistantStreamRunner_connectedPromise.set(this, void 0);
        _AbstractAssistantStreamRunner_resolveConnectedPromise.set(this, () => { });
        _AbstractAssistantStreamRunner_rejectConnectedPromise.set(this, () => { });
        _AbstractAssistantStreamRunner_endPromise.set(this, void 0);
        _AbstractAssistantStreamRunner_resolveEndPromise.set(this, () => { });
        _AbstractAssistantStreamRunner_rejectEndPromise.set(this, () => { });
        _AbstractAssistantStreamRunner_listeners.set(this, {});
        _AbstractAssistantStreamRunner_ended.set(this, false);
        _AbstractAssistantStreamRunner_errored.set(this, false);
        _AbstractAssistantStreamRunner_aborted.set(this, false);
        _AbstractAssistantStreamRunner_catchingPromiseCreated.set(this, false);
        _AbstractAssistantStreamRunner_handleError.set(this, (error) => {
            __classPrivateFieldSet(this, _AbstractAssistantStreamRunner_errored, true, "f");
            if (error instanceof Error && error.name === 'AbortError') {
                error = new error_1.APIUserAbortError();
            }
            if (error instanceof error_1.APIUserAbortError) {
                __classPrivateFieldSet(this, _AbstractAssistantStreamRunner_aborted, true, "f");
                return this._emit('abort', error);
            }
            if (error instanceof error_1.OpenAIError) {
                return this._emit('error', error);
            }
            if (error instanceof Error) {
                const openAIError = new error_1.OpenAIError(error.message);
                // @ts-ignore
                openAIError.cause = error;
                return this._emit('error', openAIError);
            }
            return this._emit('error', new error_1.OpenAIError(String(error)));
        });
        __classPrivateFieldSet(this, _AbstractAssistantStreamRunner_connectedPromise, new Promise((resolve, reject) => {
            __classPrivateFieldSet(this, _AbstractAssistantStreamRunner_resolveConnectedPromise, resolve, "f");
            __classPrivateFieldSet(this, _AbstractAssistantStreamRunner_rejectConnectedPromise, reject, "f");
        }), "f");
        __classPrivateFieldSet(this, _AbstractAssistantStreamRunner_endPromise, new Promise((resolve, reject) => {
            __classPrivateFieldSet(this, _AbstractAssistantStreamRunner_resolveEndPromise, resolve, "f");
            __classPrivateFieldSet(this, _AbstractAssistantStreamRunner_rejectEndPromise, reject, "f");
        }), "f");
        // Don't let these promises cause unhandled rejection errors.
        // we will manually cause an unhandled rejection error later
        // if the user hasn't registered any error listener or called
        // any promise-returning method.
        __classPrivateFieldGet(this, _AbstractAssistantStreamRunner_connectedPromise, "f").catch(() => { });
        __classPrivateFieldGet(this, _AbstractAssistantStreamRunner_endPromise, "f").catch(() => { });
    }
    _run(executor) {
        // Unfortunately if we call `executor()` immediately we get runtime errors about
        // references to `this` before the `super()` constructor call returns.
        setTimeout(() => {
            executor().then(() => {
                // this._emitFinal();
                this._emit('end');
            }, __classPrivateFieldGet(this, _AbstractAssistantStreamRunner_handleError, "f"));
        }, 0);
    }
    _addRun(run) {
        return run;
    }
    _connected() {
        if (this.ended)
            return;
        __classPrivateFieldGet(this, _AbstractAssistantStreamRunner_resolveConnectedPromise, "f").call(this);
        this._emit('connect');
    }
    get ended() {
        return __classPrivateFieldGet(this, _AbstractAssistantStreamRunner_ended, "f");
    }
    get errored() {
        return __classPrivateFieldGet(this, _AbstractAssistantStreamRunner_errored, "f");
    }
    get aborted() {
        return __classPrivateFieldGet(this, _AbstractAssistantStreamRunner_aborted, "f");
    }
    abort() {
        this.controller.abort();
    }
    /**
     * Adds the listener function to the end of the listeners array for the event.
     * No checks are made to see if the listener has already been added. Multiple calls passing
     * the same combination of event and listener will result in the listener being added, and
     * called, multiple times.
     * @returns this ChatCompletionStream, so that calls can be chained
     */
    on(event, listener) {
        const listeners = __classPrivateFieldGet(this, _AbstractAssistantStreamRunner_listeners, "f")[event] || (__classPrivateFieldGet(this, _AbstractAssistantStreamRunner_listeners, "f")[event] = []);
        listeners.push({ listener });
        return this;
    }
    /**
     * Removes the specified listener from the listener array for the event.
     * off() will remove, at most, one instance of a listener from the listener array. If any single
     * listener has been added multiple times to the listener array for the specified event, then
     * off() must be called multiple times to remove each instance.
     * @returns this ChatCompletionStream, so that calls can be chained
     */
    off(event, listener) {
        const listeners = __classPrivateFieldGet(this, _AbstractAssistantStreamRunner_listeners, "f")[event];
        if (!listeners)
            return this;
        const index = listeners.findIndex((l) => l.listener === listener);
        if (index >= 0)
            listeners.splice(index, 1);
        return this;
    }
    /**
     * Adds a one-time listener function for the event. The next time the event is triggered,
     * this listener is removed and then invoked.
     * @returns this ChatCompletionStream, so that calls can be chained
     */
    once(event, listener) {
        const listeners = __classPrivateFieldGet(this, _AbstractAssistantStreamRunner_listeners, "f")[event] || (__classPrivateFieldGet(this, _AbstractAssistantStreamRunner_listeners, "f")[event] = []);
        listeners.push({ listener, once: true });
        return this;
    }
    /**
     * This is similar to `.once()`, but returns a Promise that resolves the next time
     * the event is triggered, instead of calling a listener callback.
     * @returns a Promise that resolves the next time given event is triggered,
     * or rejects if an error is emitted.  (If you request the 'error' event,
     * returns a promise that resolves with the error).
     *
     * Example:
     *
     *   const message = await stream.emitted('message') // rejects if the stream errors
     */
    emitted(event) {
        return new Promise((resolve, reject) => {
            __classPrivateFieldSet(this, _AbstractAssistantStreamRunner_catchingPromiseCreated, true, "f");
            if (event !== 'error')
                this.once('error', reject);
            this.once(event, resolve);
        });
    }
    async done() {
        __classPrivateFieldSet(this, _AbstractAssistantStreamRunner_catchingPromiseCreated, true, "f");
        await __classPrivateFieldGet(this, _AbstractAssistantStreamRunner_endPromise, "f");
    }
    _emit(event, ...args) {
        // make sure we don't emit any events after end
        if (__classPrivateFieldGet(this, _AbstractAssistantStreamRunner_ended, "f")) {
            return;
        }
        if (event === 'end') {
            __classPrivateFieldSet(this, _AbstractAssistantStreamRunner_ended, true, "f");
            __classPrivateFieldGet(this, _AbstractAssistantStreamRunner_resolveEndPromise, "f").call(this);
        }
        const listeners = __classPrivateFieldGet(this, _AbstractAssistantStreamRunner_listeners, "f")[event];
        if (listeners) {
            __classPrivateFieldGet(this, _AbstractAssistantStreamRunner_listeners, "f")[event] = listeners.filter((l) => !l.once);
            listeners.forEach(({ listener }) => listener(...args));
        }
        if (event === 'abort') {
            const error = args[0];
            if (!__classPrivateFieldGet(this, _AbstractAssistantStreamRunner_catchingPromiseCreated, "f") && !listeners?.length) {
                Promise.reject(error);
            }
            __classPrivateFieldGet(this, _AbstractAssistantStreamRunner_rejectConnectedPromise, "f").call(this, error);
            __classPrivateFieldGet(this, _AbstractAssistantStreamRunner_rejectEndPromise, "f").call(this, error);
            this._emit('end');
            return;
        }
        if (event === 'error') {
            // NOTE: _emit('error', error) should only be called from #handleError().
            const error = args[0];
            if (!__classPrivateFieldGet(this, _AbstractAssistantStreamRunner_catchingPromiseCreated, "f") && !listeners?.length) {
                // Trigger an unhandled rejection if the user hasn't registered any error handlers.
                // If you are seeing stack traces here, make sure to handle errors via either:
                // - runner.on('error', () => ...)
                // - await runner.done()
                // - await runner.finalChatCompletion()
                // - etc.
                Promise.reject(error);
            }
            __classPrivateFieldGet(this, _AbstractAssistantStreamRunner_rejectConnectedPromise, "f").call(this, error);
            __classPrivateFieldGet(this, _AbstractAssistantStreamRunner_rejectEndPromise, "f").call(this, error);
            this._emit('end');
        }
    }
    async _threadAssistantStream(body, thread, options) {
        return await this._createThreadAssistantStream(thread, body, options);
    }
    async _runAssistantStream(threadId, runs, params, options) {
        return await this._createAssistantStream(runs, threadId, params, options);
    }
    async _runToolAssistantStream(threadId, runId, runs, params, options) {
        return await this._createToolAssistantStream(runs, threadId, runId, params, options);
    }
    async _createThreadAssistantStream(thread, body, options) {
        const signal = options?.signal;
        if (signal) {
            if (signal.aborted)
                this.controller.abort();
            signal.addEventListener('abort', () => this.controller.abort());
        }
        // this.#validateParams(params);
        const runResult = await thread.createAndRun({ ...body, stream: false }, { ...options, signal: this.controller.signal });
        this._connected();
        return this._addRun(runResult);
    }
    async _createToolAssistantStream(run, threadId, runId, params, options) {
        const signal = options?.signal;
        if (signal) {
            if (signal.aborted)
                this.controller.abort();
            signal.addEventListener('abort', () => this.controller.abort());
        }
        const runResult = await run.submitToolOutputs(threadId, runId, { ...params, stream: false }, { ...options, signal: this.controller.signal });
        this._connected();
        return this._addRun(runResult);
    }
    async _createAssistantStream(run, threadId, params, options) {
        const signal = options?.signal;
        if (signal) {
            if (signal.aborted)
                this.controller.abort();
            signal.addEventListener('abort', () => this.controller.abort());
        }
        // this.#validateParams(params);
        const runResult = await run.create(threadId, { ...params, stream: false }, { ...options, signal: this.controller.signal });
        this._connected();
        return this._addRun(runResult);
    }
}
exports.AbstractAssistantStreamRunner = AbstractAssistantStreamRunner;
_AbstractAssistantStreamRunner_connectedPromise = new WeakMap(), _AbstractAssistantStreamRunner_resolveConnectedPromise = new WeakMap(), _AbstractAssistantStreamRunner_rejectConnectedPromise = new WeakMap(), _AbstractAssistantStreamRunner_endPromise = new WeakMap(), _AbstractAssistantStreamRunner_resolveEndPromise = new WeakMap(), _AbstractAssistantStreamRunner_rejectEndPromise = new WeakMap(), _AbstractAssistantStreamRunner_listeners = new WeakMap(), _AbstractAssistantStreamRunner_ended = new WeakMap(), _AbstractAssistantStreamRunner_errored = new WeakMap(), _AbstractAssistantStreamRunner_aborted = new WeakMap(), _AbstractAssistantStreamRunner_catchingPromiseCreated = new WeakMap(), _AbstractAssistantStreamRunner_handleError = new WeakMap();
//# sourceMappingURL=AbstractAssistantStreamRunner.js.map