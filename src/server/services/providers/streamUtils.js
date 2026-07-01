// src/server/services/providers/streamUtils.js
// Shared streaming utilities and the provider streaming contract.
//
// Streaming contract (implemented by every provider handler):
//   async *streamCompletion(payload) -> yields event objects:
//     { type: 'thinking', value: string }  // reasoning/thinking delta
//     { type: 'text',     value: string }  // answer text delta
//     { type: 'error',    value: string }  // recoverable error text
//     { type: 'usage',    usage: object }  // final token usage (yielded last)
//   The handler must append the assembled assistant message to the conversation
//   history (same arrays it mutates in handleRequest) before returning, so a
//   streamed turn leaves history in the same shape as a non-streamed turn.
//
// providerFactory.handleRequestStream(modelID, payload) delegates to the routed
// handler's streamCompletion(); the chat route serializes each event as SSE.

/**
 * Set Server-Sent Events headers and flush them immediately.
 * @param {import('express').Response} res
 */
function sseHeaders(res) {
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // disable proxy buffering
  if (typeof res.flushHeaders === 'function') res.flushHeaders();
}

/**
 * Write one streaming event to an Express SSE response.
 * @param {import('express').Response} res
 * @param {object} event - a contract event ({type, value?, usage?})
 */
function writeSSE(res, event) {
  res.write(`data: ${JSON.stringify(event)}\n\n`);
}

/**
 * Parse an OpenAI-compatible SSE stream (Chat Completions with stream:true,
 * requested via axios `responseType: 'stream'`). Yields contract events.
 * Handles `reasoning_content` deltas (DeepSeek/Grok/etc.) as 'thinking'.
 * @param {NodeJS.ReadableStream} stream - the axios response.data stream
 */
async function* parseOpenAISSE(stream) {
  let buffer = '';
  let usage = null;
  for await (const chunk of stream) {
    buffer += chunk.toString('utf8');
    let nl;
    while ((nl = buffer.indexOf('\n')) >= 0) {
      const line = buffer.slice(0, nl).trim();
      buffer = buffer.slice(nl + 1);
      if (!line || !line.startsWith('data:')) continue;
      const data = line.slice(5).trim();
      if (data === '[DONE]') {
        if (usage) yield { type: 'usage', usage };
        return;
      }
      let json;
      try { json = JSON.parse(data); } catch { continue; }
      if (json.usage) usage = json.usage;
      const delta = json.choices && json.choices[0] && json.choices[0].delta;
      if (delta) {
        if (delta.reasoning_content) yield { type: 'thinking', value: delta.reasoning_content };
        if (delta.content) yield { type: 'text', value: delta.content };
      }
    }
  }
  if (usage) yield { type: 'usage', usage };
}

/**
 * Parse an Anthropic Messages SSE stream (POST /v1/messages with stream:true,
 * requested via axios `responseType: 'stream'`). Yields contract events.
 * Maps `thinking_delta` -> 'thinking' and `text_delta` -> 'text'.
 * @param {NodeJS.ReadableStream} stream - the axios response.data stream
 */
async function* parseAnthropicSSE(stream) {
  let buffer = '';
  let usage = {};
  for await (const chunk of stream) {
    buffer += chunk.toString('utf8');
    let nl;
    while ((nl = buffer.indexOf('\n')) >= 0) {
      const line = buffer.slice(0, nl).trim();
      buffer = buffer.slice(nl + 1);
      if (!line || line.startsWith('event:') || !line.startsWith('data:')) continue;
      const data = line.slice(5).trim();
      let json;
      try { json = JSON.parse(data); } catch { continue; }
      switch (json.type) {
        case 'message_start':
          if (json.message && json.message.usage) usage = { ...usage, ...json.message.usage };
          break;
        case 'content_block_delta':
          if (json.delta && json.delta.type === 'thinking_delta') {
            yield { type: 'thinking', value: json.delta.thinking };
          } else if (json.delta && json.delta.type === 'text_delta') {
            yield { type: 'text', value: json.delta.text };
          }
          break;
        case 'message_delta':
          if (json.usage) usage = { ...usage, ...json.usage };
          break;
        default:
          break;
      }
    }
  }
  yield { type: 'usage', usage };
}

module.exports = { sseHeaders, writeSSE, parseOpenAISSE, parseAnthropicSSE };
