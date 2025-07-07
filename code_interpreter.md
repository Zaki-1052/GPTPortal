Code Interpreter
================

Allow models to write and run Python to solve problems.

The Code Interpreter tool allows models to write and run Python code in a sandboxed environment to solve complex problems in domains like data analysis, coding, and math. Use it for:

*   Processing files with diverse data and formatting
*   Generating files with data and images of graphs
*   Writing and running code iteratively to solve problems—for example, a model that writes code that fails to run can keep rewriting and running that code until it succeeds
*   Boosting visual intelligence in our latest reasoning models (like [o3](/docs/models/o3) and [o4-mini](/docs/models/o4-mini)). The model can use this tool to crop, zoom, rotate, and otherwise process and transform images.

Here's an example of calling the [Responses API](/docs/api-reference/responses) with a tool call to Code Interpreter:

Use the Responses API with Code Interpreter

```bash
curl https://api.openai.com/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-4.1",
    "tools": [{
      "type": "code_interpreter",
      "container": { "type": "auto" }
    }],
    "instructions": "You are a personal math tutor. When asked a math question, write and run code using the python tool to answer the question.",
    "input": "I need to solve the equation 3x + 11 = 14. Can you help me?"
  }'
```

```javascript
import OpenAI from "openai";
const client = new OpenAI();

const instructions = `
You are a personal math tutor. When asked a math question, 
write and run code using the python tool to answer the question.
`;

const resp = await client.responses.create({
  model: "gpt-4.1",
  tools: [
    {
      type: "code_interpreter",
      container: { type: "auto" },
    },
  ],
  instructions,
  input: "I need to solve the equation 3x + 11 = 14. Can you help me?",
});

console.log(JSON.stringify(resp.output, null, 2));
```

```python
from openai import OpenAI

client = OpenAI()

instructions = """
You are a personal math tutor. When asked a math question, 
write and run code using the python tool to answer the question.
"""

resp = client.responses.create(
    model="gpt-4.1",
    tools=[
        {
            "type": "code_interpreter",
            "container": {"type": "auto"}
        }
    ],
    instructions=instructions,
    input="I need to solve the equation 3x + 11 = 14. Can you help me?",
)

print(resp.output)
```

While we call this tool Code Interpreter, the model knows it as the "python tool". Models usually understand prompts that refer to the code interpreter tool, however, the most explicit way to invoke this tool is to ask for "the python tool" in your prompts.

Containers
----------

The Code Interpreter tool requires a [container object](/docs/api-reference/containers/object). A container is a fully sandboxed virtual machine that the model can run Python code in. This container can contain files that you upload, or that it generates.

There are two ways to create containers:

1.  Auto mode: as seen in the example above, you can do this by passing the `"container": { "type": "auto", files: ["file-1", "file-2"] }` property in the tool configuration while creating a new Response object. This automatically creates a new container, or reuses an active container that was used by a previous `code_interpreter_call` item in the model's context. Look for the `code_interpreter_call` item in the output of this API request to find the `container_id` that was generated or used.
2.  Explicit mode: here, you explicitly [create a container](/docs/api-reference/containers/createContainers) using the `v1/containers` endpoint, and assign its `id` as the `container` value in the tool configuration in the Response object. For example:

Use explicit container creation

```bash
curl https://api.openai.com/v1/containers \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
        "name": "My Container"
      }'

# Use the returned container id in the next call:
curl https://api.openai.com/v1/responses \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4.1",
    "tools": [{
      "type": "code_interpreter",
      "container": "cntr_abc123"
    }],
    "tool_choice": "required",
    "input": "use the python tool to calculate what is 4 * 3.82. and then find its square root and then find the square root of that result"
  }'
```

```python
from openai import OpenAI
client = OpenAI()

container = client.containers.create(name="test-container")

response = client.responses.create(
    model="gpt-4.1",
    tools=[{
        "type": "code_interpreter",
        "container": container.id
    }],
    tool_choice="required",
    input="use the python tool to calculate what is 4 * 3.82. and then find its square root and then find the square root of that result"
)

print(response.output_text)
```

```javascript
import OpenAI from "openai";
const client = new OpenAI();

const container = await client.containers.create({ name: "test-container" });

const resp = await client.responses.create({
    model: "gpt-4.1",
    tools: [
      {
        type: "code_interpreter",
        container: container.id
      }
    ],
    tool_choice: "required",
    input: "use the python tool to calculate what is 4 * 3.82. and then find its square root and then find the square root of that result"
});

console.log(resp.output_text);
```

Note that containers created with the auto mode are also accessible using the [`/v1/containers`](/docs/api-reference/containers) endpoint.

### Expiration

We highly recommend you treat containers as ephemeral and store all data related to the use of this tool on your own systems. Expiration details:

*   A container expires if it is not used for 20 minutes. When this happens, using the container in `v1/responses` will fail. You'll still be able to see a snapshot of the container's metadata at its expiry, but all data associated with the container will be discarded from our systems and not recoverable. You should download any files you may need from the container while it is active.
*   You can't move a container from an expired state to an active one. Instead, create a new container and upload files again. Note that any state in the old container's memory (like python objects) will be lost.
*   Any container operation, like retrieving the container, or adding or deleting files from the container, will automatically refresh the container's `last_active_at` time.

Work with files
---------------

When running Code Interpreter, the model can create its own files. For example, if you ask it to construct a plot, or create a CSV, it creates these images directly on your container. When it does so, it cites these files in the `annotations` of its next message. Here's an example:

```json
{
  "id": "msg_682d514e268c8191a89c38ea318446200f2610a7ec781a4f",
  "content": [
    {
      "annotations": [
        {
          "file_id": "cfile_682d514b2e00819184b9b07e13557f82",
          "index": null,
          "type": "container_file_citation",
          "container_id": "cntr_682d513bb0c48191b10bd4f8b0b3312200e64562acc2e0af",
          "end_index": 0,
          "filename": "cfile_682d514b2e00819184b9b07e13557f82.png",
          "start_index": 0
        }
      ],
      "text": "Here is the histogram of the RGB channels for the uploaded image. Each curve represents the distribution of pixel intensities for the red, green, and blue channels. Peaks toward the high end of the intensity scale (right-hand side) suggest a lot of brightness and strong warm tones, matching the orange and light background in the image. If you want a different style of histogram (e.g., overall intensity, or quantized color groups), let me know!",
      "type": "output_text",
      "logprobs": []
    }
  ],
  "role": "assistant",
  "status": "completed",
  "type": "message"
}
```

You can download these constructed files by calling the [get container file content](/docs/api-reference/container-files/retrieveContainerFileContent) method.

Any [files in the model input](/docs/guides/pdf-files) get automatically uploaded to the container. You do not have to explicitly upload it to the container.

### Uploading and downloading files

Add new files to your container using [Create container file](/docs/api-reference/container-files/createContainerFile). This endpoint accepts either a multipart upload or a JSON body with a `file_id`. List existing container files with [List container files](/docs/api-reference/container-files/listContainerFiles) and download bytes from [Retrieve container file content](/docs/api-reference/container-files/retrieveContainerFileContent).

### Dealing with citations

Files and images generated by the model are returned as annotations on the assistant's message. `container_file_citation` annotations point to files created in the container. They include the `container_id`, `file_id`, and `filename`. You can parse these annotations to surface download links or otherwise process the files.

### Supported files

|File format|MIME type|
|---|---|
|.c|text/x-c|
|.cs|text/x-csharp|
|.cpp|text/x-c++|
|.csv|text/csv|
|.doc|application/msword|
|.docx|application/vnd.openxmlformats-officedocument.wordprocessingml.document|
|.html|text/html|
|.java|text/x-java|
|.json|application/json|
|.md|text/markdown|
|.pdf|application/pdf|
|.php|text/x-php|
|.pptx|application/vnd.openxmlformats-officedocument.presentationml.presentation|
|.py|text/x-python|
|.py|text/x-script.python|
|.rb|text/x-ruby|
|.tex|text/x-tex|
|.txt|text/plain|
|.css|text/css|
|.js|text/javascript|
|.sh|application/x-sh|
|.ts|application/typescript|
|.csv|application/csv|
|.jpeg|image/jpeg|
|.jpg|image/jpeg|
|.gif|image/gif|
|.pkl|application/octet-stream|
|.png|image/png|
|.tar|application/x-tar|
|.xlsx|application/vnd.openxmlformats-officedocument.spreadsheetml.sheet|
|.xml|application/xml or "text/xml"|
|.zip|application/zip|

Usage notes
-----------

||
|ResponsesChat CompletionsAssistants|100 RPM per org|PricingZDR and data residency|

Was this page useful?