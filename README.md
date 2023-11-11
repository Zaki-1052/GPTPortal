# Chatbot Portal with GPT-4 API

Welcome to the Chatbot Portal, a Node.js-based web application that allows users to interact with a chatbot powered by OpenAI's GPT-4 API, including the latest vision capabilities.

## Features

- Interactive chat interface with support for text messages.
- Image upload functionality for visual context in discussions.
- Server-side integration with OpenAI GPT-4 API.
- Basic authentication for secure access.
- Customized system instructions and model parameters.
- Simple and intuitive UI with copy-to-clipboard feature for chat messages.

## Structure

- **portal.html**: The main HTML file for user interaction. It includes the chat interface layout, a message input area, an image upload button, and links to the `script.js` file.
- **script.js**: Contains client-side logic for handling user inputs, sending messages and images to the server, and displaying responses in the chat interface. It also includes file selection for image uploads and a copy-to-clipboard function.
- **server.js**: The server-side Node.js file using Express.js. It processes POST requests to `/message`, interacts with the OpenAI GPT-4 API, and manages CORS, authentication, and static file serving.

## Prerequisites

- Node.js installed on your machine.
- An OpenAI API key for accessing GPT-4.

## Installation

1. **Clone the Repository**:
   - Use Git to clone the repository to your local machine:

     ```sh
     git clone https://github.com/Zaki-1052/GPTPortal.git
     ```

2. **Navigate to the Project Directory**:
   - Change into the project's directory:

     ```sh
     cd GPTPortal
     ```

3. **Install Dependencies**:
   - Install the required Node.js packages:

     ```sh
     npm install
     ```

4. **Set Up Environment Variables**:
   - Create a `.env` file in the root directory.
     - Format shown in `.env.example`
   - Add your OpenAI API key and basic authentication:

     ```env
     OPENAI_API_KEY=your_api_key_here
      USER_USERNAME=Username
      USER_PASSWORD=Password
     ```

5. **Start the Server**:
   - Launch the server with Node.js:

     ```sh
     node server.js
     ```

6. **Access the Chat Interface**:
   - Open a web browser and go to `http://localhost:3000/portal`.

## Usage

- **Sending a Message**:
  - Type your message in the text box.
  - Press Enter or click the Send button to submit.
- **Uploading an Image**:
  - Click the 🖼️ button to open the file selector.
  - Choose an image file. It will be sent with your next message.

## Author Notes

- **Smartest Snapshot of ChatGPT**: This application uses the latest GPT-4 model with vision capabilities. However, users can switch to the standard `gpt-4` model and adjust token limits (default is 4000) for different use cases.
- **Billing for API Use**: A $5 deposit is required to access the paid tier of the OpenAI API. See OpenAI documentation for billing setup.
- **Understanding GPT Parameters**:
  - **Temperature**: Controls randomness. Lower values make responses more predictable.
  - **Max Tokens**: Determines the length of each completion.
  - **Other Parameters**: Explore prompt engineering for custom behaviors.
- **API Chat Completions**: Tailor chat completions to your specific use case.
- **Session Management**: Each page reload starts a new session. Session history isn't preserved.
- **Custom Instructions**: Found in `instructions.md`. Modify user profile and instructions as needed. These are optimized for GPT-4 based on extensive research.

The OpenAI API, or Application Programming Interface, directly sends HTTP requests to the unsanitized and original GPT-4 model and lets you customize certain weights of the model’s responses, like randomness or "temperature", and length or "tokens". You'll need to monitor your usage of the more expensive but intelligent GPT-4 model, which will cost just over 10 cents per full session, and needs you to add five dollars in credit to be able to use your key.

Be aware that at base usage of this web application, you send roughly 1000 tokens for one message to GPT-4, or three cents, and another six cents will be used when it responds with over 1000 words. This is due to the information concatenated to the System Prompt in the Custom Instructions.

Model behavior will be primarily influenced by whatever context is first provided to the API; it lacks a severe filter compared to ChatGPT with increased steerability, but is more expensive than the regular Chat Interface and will restrict you from sending messages once you are rate-limited.

Consult the provided links and documentation for more guidance on setup and prompting.
More information will be added about model behavior and API usage to the ReadMe in the future.

## Relevant Links

- [Pricing](https://openai.com/pricing) - OpenAI's pricing details for different API Models.
- [API Keys](https://platform.openai.com/api-keys) - Where to create and manage your OpenAI API keys.
- [Billing Activity/Usage](https://platform.openai.com/usage) - Check your usage and billing activity for OpenAI models.
  - [Account Limits](https://platform.openai.com/account/limits) - Information on billing and rate limits per tokens.
  - [Payment Balance](https://platform.openai.com/account/billing/overview) - Check and increase your API Credit and add your information.
  - [Rate Limiting](https://platform.openai.com/docs/guides/rate-limits) - Guide on rate limits for OpenAI API usage.
  - [Usage Tiers](https://platform.openai.com/docs/guides/rate-limits/usage-tiers) - Details on different usage tiers and their limits.
- [Tokenizer](https://platform.openai.com/tokenizer) - Visit the OpenAI Token Counter to determine message lengths.
- [Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering) - A guide to effective prompt engineering with OpenAI models.
- [Reddit: Zaki_1052_](https://www.reddit.com/user/Zaki_1052_) - My Reddit account for prompts and discussions.
- [My Website](http://www.nazalibhai.com) - Visit my custom website for a look at my web development.

### Research Papers: Chain and Tree of Thought Prompting

- [Chain of Thought Prompting Elicits Reasoning in Large Language Models](https://arxiv.org/pdf/2201.11903.pdf)
- [Tree of Thoughts: Deliberate Problem Solving with Large Language Models](https://arxiv.org/pdf/2305.10601.pdf)
- [Chain-of-Thought Style Prompting Increases Performance](https://arxiv.org/pdf/2305.14215v1.pdf)
- [Chain of Thought Prompting Assists LLM Reasoning](https://arxiv.org/pdf/2306.00550v1.pdf)
- [Zero-Shot CoT Prompting Aids in NLP Tasks](https://arxiv.org/pdf/2305.04091v3.pdf)
- [Reducing Hallucinations with CoT Verification](https://arxiv.org/pdf/2309.11495.pdf)
- [Google DeepMind: Attention Is All You Need](https://arxiv.org/pdf/1706.03762.pdf)
- [Reviewing Prompt Engineering in LLMs](https://arxiv.org/pdf/2310.14735.pdf)
- [CoT Reasoning Capabilities in GPTs](https://arxiv.org/pdf/2305.02897.pdf)
- [Emergent Abilities of Large Language Models](https://arxiv.org/pdf/2206.07682.pdf)
- [Enhancing LLMs with Dialog-Enabled Resolving Agents](https://arxiv.org/pdf/2303.17071.pdf)
- [GPT-4 Technical Report](https://arxiv.org/pdf/2303.08774.pdf)
- [Reflexion: Verbal Reinforcement Learning](https://arxiv.org/pdf/2303.11366.pdf)
- [Step-By-Step Verification](https://cdn.openai.com/improving-mathematical-reasoning-with-process-supervision/Lets_Verify_Step_by_Step.pdf)
- [Probabalistic Prompting Methods in NLP](https://arxiv.org/pdf/2107.13586.pdf)
- [Sparks of Artificial General Intelligence](https://arxiv.org/pdf/2303.12712.pdf)
- [Few-Shot Prompting](https://arxiv.org/pdf/2005.14165.pdf)
- [Zero-Shot Reasoning](https://arxiv.org/pdf/2205.11916.pdf)
- [Automatic CoT Prompting in LLMs](https://arxiv.org/pdf/2210.03493.pdf)
- [Self-Consistency Improvements in LLMs via CoT](https://arxiv.org/pdf/2203.11171.pdf)
- [GPT-4V System Card](https://cdn.openai.com/papers/GPTV_System_Card.pdf)

## Contributions

Contributions are welcome! Please fork the repository and submit a pull request with your updates.

## License

This project is open source and available under the [MIT License](LICENSE.md).
