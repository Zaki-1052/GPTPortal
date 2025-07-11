Responses vs. Chat Completions
==============================

Compare the Responses API and Chat Completions API.

The [Responses API](https://platform.openai.com/docs/api-reference/responses) and [Chat Completions API](https://platform.openai.com/docs/api-reference/chat) are two different ways to interact with OpenAI's models. This guide explains the key differences between the two APIs.

Why the Responses API?
----------------------

The Responses API is our newest core API and an agentic API primitive, combining the simplicity of Chat Completions with the ability to do more agentic tasks. As model capabilities evolve, the Responses API is a flexible foundation for building action-oriented applications, with built-in tools:

* [Web search](/docs/guides/tools-web-search)
* [File search](/docs/guides/tools-file-search)
* [Computer use](/docs/guides/tools-computer-use)

If you're a new user, we recommend using the Responses API.

|Capabilities|Chat Completions API|Responses API|
|---|---|---|
|Text generation|||
|Audio||Coming soon|
|Vision|||
|Structured Outputs|||
|Function calling|||
|Web search|||
|File search|||
|Computer use|||
|Code interpreter||Coming soon|

### The Chat Completions API is not going away

The Chat Completions API is an industry standard for building AI applications, and we intend to continue supporting this API indefinitely. We're introducing the Responses API to simplify workflows involving tool use, code execution, and state management. We believe this new API primitive will allow us to more effectively enhance the OpenAI platform into the future.

### A stateful API and semantic events

Events are simpler with the Responses API. It has a predictable, event-driven architecture, whereas the Chat Completions API continuously appends to the content field as tokens are generated—requiring you to manually track differences between each state. Multi-step conversational logic and reasoning are easier to implement with the Responses API.

The Responses API clearly emits semantic events detailing precisely what changed (e.g., specific text additions), so you can write integrations targeted at specific emitted events (e.g., text changes), simplifying integration and improving type safety.

### Model availability in each API

Whenever possible, all new models will be added to both the Chat Completions API and Responses API. Some models may only be available through Responses API if they use built-in tools (e.g. our computer use models), or trigger multiple model generation turns behind the scenes (e.g. o1-pro) . The detail pages for each [model](/docs/models) will indicate if they support Chat Completions, Responses, or both.

Compare the code
----------------

The following examples show how to make a basic API call to the [Chat Completions API](https://platform.openai.com/docs/api-reference/chat) and the [Responses API](https://platform.openai.com/docs/api-reference/responses).

### Text generation example

Both APIs make it easy to generate output from our models. A completion requires a `messages` array, but a response requires an `input` (string or array, as shown below).

Chat Completions API

```python
from openai import OpenAI
client = OpenAI()

completion = client.chat.completions.create(
  model="gpt-4.1",
  messages=[
      {
          "role": "user",
          "content": "Write a one-sentence bedtime story about a unicorn."
      }
  ]
)

print(completion.choices[0].message.content)
```

Responses API

```python
from openai import OpenAI
client = OpenAI()

response = client.responses.create(
  model="gpt-4.1",
  input=[
      {
          "role": "user",
          "content": "Write a one-sentence bedtime story about a unicorn."
      }
  ]
)

print(response.output_text)
```

When you get a response back from the Responses API, the fields differ slightly. Instead of a `message`, you receive a typed `response` object with its own `id`. Responses are stored by default. Chat completions are stored by default for new accounts. To disable storage when using either API, set `store: false`.

Chat Completions API

```json
[
{
  "index": 0,
  "message": {
    "role": "assistant",
    "content": "Under the soft glow of the moon, Luna the unicorn danced through fields of twinkling stardust, leaving trails of dreams for every child asleep.",
    "refusal": null
  },
  "logprobs": null,
  "finish_reason": "stop"
}
]
```

Responses API

```json
[
{
  "id": "msg_67b73f697ba4819183a15cc17d011509",
  "type": "message",
  "role": "assistant",
  "content": [
    {
      "type": "output_text",
      "text": "Under the soft glow of the moon, Luna the unicorn danced through fields of twinkling stardust, leaving trails of dreams for every child asleep.",
      "annotations": []
    }
  ]
}
]
```

### Other noteworthy differences

* The Responses API returns `output`, while the Chat Completions API returns a `choices` array.
* Structured Outputs API shape is different. Instead of `response_format`, use `text.format` in Responses. Learn more in the [Structured Outputs](/docs/guides/structured-outputs) guide.
* Function calling API shape is different—both for the function config on the request and function calls sent back in the response. See the full difference in the [function calling guide](/docs/guides/function-calling).
* Reasoning is different. Instead of `reasoning_effort` in Chat Completions, use `reasoning.effort` with the Responses API. Read more details in the [reasoning](/docs/guides/reasoning) guide.
* The Responses SDK has an `output_text` helper, which the Chat Completions SDK does not have.
* Conversation state: You have to manage conversation state yourself in Chat Completions, while Responses has `previous_response_id` to help you with long-running conversations.
* Responses are stored by default. Chat completions are stored by default for new accounts. To disable storage, set `store: false`.

What this means for existing APIs
---------------------------------

### Chat Completions

The Chat Completions API remains our most widely used API. We'll continue supporting it with new models and capabilities. If you don't need built-in tools for your application, you can confidently continue using Chat Completions.

We'll keep releasing new models to Chat Completions whenever their capabilities don't depend on built-in tools or multiple model calls. When you're ready for advanced capabilities designed specifically for agent workflows, we recommend the Responses API.

Assistants
----------

Based on developer feedback from the [Assistants API](/docs/api-reference/assistants) beta, we've incorporated key improvements into the Responses API to make it more flexible, faster, and easier to use. The Responses API represents the future direction for building agents on OpenAI.

We're working to achieve full feature parity between the Assistants and the Responses API, including support for Assistant-like and Thread-like objects and the Code Interpreter tool. When complete, we plan to formally announce the deprecation of the Assistants API with a target sunset date in the first half of 2026.

Upon deprecation, we will provide a clear migration guide from the Assistants API to the Responses API that allows developers to preserve all their data and migrate their applications. Until we formally announce the deprecation, we'll continue delivering new models to the Assistants API.

Was this page useful?
