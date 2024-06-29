                              
import * as Core from 'openai/core';
import { APIUserAbortError, OpenAIError } from 'openai/error';
import { Run, RunSubmitToolOutputsParamsBase } from 'openai/resources/beta/threads/runs/runs';
import { RunCreateParamsBase, Runs } from 'openai/resources/beta/threads/runs/runs';
import { ThreadCreateAndRunParamsBase, Threads } from 'openai/resources/beta/threads/threads';
export declare abstract class AbstractAssistantStreamRunner<Events extends CustomEvents<any> = AbstractAssistantRunnerEvents> {
    #private;
    controller: AbortController;
    constructor();
    protected _run(executor: () => Promise<any>): void;
    protected _addRun(run: Run): Run;
    protected _connected(): void;
    get ended(): boolean;
    get errored(): boolean;
    get aborted(): boolean;
    abort(): void;
    /**
     * Adds the listener function to the end of the listeners array for the event.
     * No checks are made to see if the listener has already been added. Multiple calls passing
     * the same combination of event and listener will result in the listener being added, and
     * called, multiple times.
     * @returns this ChatCompletionStream, so that calls can be chained
     */
    on<Event extends keyof Events>(event: Event, listener: ListenerForEvent<Events, Event>): this;
    /**
     * Removes the specified listener from the listener array for the event.
     * off() will remove, at most, one instance of a listener from the listener array. If any single
     * listener has been added multiple times to the listener array for the specified event, then
     * off() must be called multiple times to remove each instance.
     * @returns this ChatCompletionStream, so that calls can be chained
     */
    off<Event extends keyof Events>(event: Event, listener: ListenerForEvent<Events, Event>): this;
    /**
     * Adds a one-time listener function for the event. The next time the event is triggered,
     * this listener is removed and then invoked.
     * @returns this ChatCompletionStream, so that calls can be chained
     */
    once<Event extends keyof Events>(event: Event, listener: ListenerForEvent<Events, Event>): this;
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
    emitted<Event extends keyof Events>(event: Event): Promise<EventParameters<Events, Event> extends [infer Param] ? Param : EventParameters<Events, Event> extends [] ? void : EventParameters<Events, Event>>;
    done(): Promise<void>;
    protected _emit<Event extends keyof Events>(event: Event, ...args: EventParameters<Events, Event>): void;
    protected _threadAssistantStream(body: ThreadCreateAndRunParamsBase, thread: Threads, options?: Core.RequestOptions): Promise<Run>;
    protected _runAssistantStream(threadId: string, runs: Runs, params: RunCreateParamsBase, options?: Core.RequestOptions): Promise<Run>;
    protected _runToolAssistantStream(threadId: string, runId: string, runs: Runs, params: RunSubmitToolOutputsParamsBase, options?: Core.RequestOptions): Promise<Run>;
    protected _createThreadAssistantStream(thread: Threads, body: ThreadCreateAndRunParamsBase, options?: Core.RequestOptions): Promise<Run>;
    protected _createToolAssistantStream(run: Runs, threadId: string, runId: string, params: RunSubmitToolOutputsParamsBase, options?: Core.RequestOptions): Promise<Run>;
    protected _createAssistantStream(run: Runs, threadId: string, params: RunCreateParamsBase, options?: Core.RequestOptions): Promise<Run>;
}
type CustomEvents<Event extends string> = {
    [k in Event]: k extends keyof AbstractAssistantRunnerEvents ? AbstractAssistantRunnerEvents[k] : (...args: any[]) => void;
};
type ListenerForEvent<Events extends CustomEvents<any>, Event extends keyof Events> = Event extends (keyof AbstractAssistantRunnerEvents) ? AbstractAssistantRunnerEvents[Event] : Events[Event];
type EventParameters<Events extends CustomEvents<any>, Event extends keyof Events> = Parameters<ListenerForEvent<Events, Event>>;
export interface AbstractAssistantRunnerEvents {
    connect: () => void;
    run: (run: Run) => void;
    error: (error: OpenAIError) => void;
    abort: (error: APIUserAbortError) => void;
    end: () => void;
}
export {};
//# sourceMappingURL=AbstractAssistantStreamRunner.d.ts.map