# ChatBot Portal for Multi-Modal LLM APIs

Welcome to my **Chat-Bot Portal**, a full-featured *Node.js*-based web application that allows users to interact with a **chatbot** powered by *OpenAI*'s **GPT-4 API**, including the latest *Vision*, *Hearing*, and *Speaking* capabilities with *image-generation*, *file uploads*, and superior *Model Performance* from *advanced* and *editable* **Custom Instructions** in the **System Prompt**.

*GPTPortal* now supports the **Anthropic Claude** and **Mistral AI** models, plus **Google Gemini** via *free* API. It *also* includes a *native* **Code Environment** via **Assistants Mode** to reuse *files* and *instructions* from OpenAI's *Beta API*! **Explore** *all* the additional features added, like *customizable* **Chat History**, **Prompt Templates**, *easy* **Setup**, and *many* more **API Providers**.

**IMPORTANT**: To view the old documentation (which is still applicable to v2), please see the [**Old Documentation Here**](public/uploads/oldDocs.md).

## Table of Contents

- [Features](#features)
- [Examples](#examples)
- [Structure](#structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Assistants](#assistants-use)
- [Author Notes](#author-notes)
- [Further Explanations](#further-explanations)
- [Basic Guide](#guide-basic-setup--use)
- [Google Gemini](#8-optional-google-gemini-setup)
- [Mistral AI](#9-optional-mistral-ai-setup)
- [Anthropic Claude](#10-optional-anthropic-claude-setup)
- [Meta LLaMA AI](#11-optional-meta-llama-setup)
- [OpenRouter AI](#12-optional-open-router-setup)
- [Relevant Links](#relevant-links)
- [Author Links](#author-links--custom-gpts)
- [Research Papers](#research-papers)
- [FAQ](#faq)
- [Glossary](#glossary)
- [Updates](#updates)
- [Tokens](#token-costs-explained)
- [TODOs](#todos)
- [Quick-Start](#quick-start-guide)
- [Docker](#docker)
- [Contributions](#contributions)
- [License](#license)

## Features

- Interactive **chat interface** with support for *text messages*.
- **Voice Conversations** via *Whisper* transcriptions and *spoken responses*.
- **Image Upload** functionality for *visual context* in discussions.
- *Server-side* integration with **SEVEN** *AI* **API** *providers* and **counting**.
- **Basic authentication** for *secure access*.
- Customizable *System-Defined Instructions* and *Model Parameters*.
- Simple and intuitive **UI** with *copy-to-clipboard* features.
- **Markdown** *rendering* for chat messages in *Marked* styles.
- **Export** as *HTML* **button** for *conversation history*.
- Integrated **shutdown** *functionality* at "**Bye!**"
- **Image Generation** with *DALL·E 3* at "**Generate:**".
- **File Uploads** via manual *concatenation* for **large texts**.
- **Assistants API Mode** for *reusable* files and *custom instructions*.
  - Includes **Automatic Python Execution** in stateful *Jupyter Environment*.
  - **Retrieval Augmented Generation** of *uploaded files*.
- *New* **Anthropic Claude**, **Google Gemini**, & **Mistral** Models.
- **Keyboard Shortcuts** to control various *ChatGPT-like functions*.
- **Editable Custom Instructions** via a *frontend UI*.
- **Prompt Templates** for the *System* via **Sidebar**.
- **Conversation History** with *optimized* **context windows**.
- *Automatic* **Token-Cost** *Calculations* and **Summaries**.
- **Model Selector** of various *LLM APIs*. Includes:
  - **GPT-4**: *EVERY* GPT Model Release
    - Includes 4o, Turbo, old v4, 3.5, etc.
  - **Gemini**: *ALL* Google Gemini Models
    - Includes *Gemini-Pro* and *Flash*
  - **Claude Opus-Instant**:
    - *Seven* New *Anthropic* High *Performance* Models
      - A Description can be found under [**Anthropic AI Setup**](#10-optional-anthropic-claude-setup).
  - **Mistral**: *Tiny-Medium*
    - **Six** *New* **Mistral AI** Models
      - *Intelligence* **Varies** by *Size*
      - A Description can be found under [**Mistral AI Setup**](#9-optional-mistral-ai-setup).
  - **LLaMA-3**: *FREE* Llama Models via *Qroq*
  - **Open Router**: *ANY* Other Models you can imagine!

// TODO: Rewrite Documentation

### Model Pricing Table

| Model                 | Input Cost per Million Tokens | Output Cost per Million Tokens |
|-----------------------|-------------------------------|--------------------------------|
| gpt-4                 | $30.00                        | $60.00                         |
| gpt-4-turbo           | $10.00                        | $30.00                         |
| gpt-4o                | $5.00                         | $15.00                         |
| gpt-4o-mini           | $0.15                         | $0.60                          |
| gpt-3.5-turbo-0125    | $0.50                         | $1.50                          |
| claude-3-5-sonnet-20240620 | $3.00                      | $15.00                         |
| claude-3-sonnet-20240229 | $3.00                      | $15.00                         |
| claude-3-opus-20240229 | $15.00                        | $75.00                         |
| claude-3-haiku-20240307 | $0.25                         | $1.25                          |
| claude-2.1            | $8.00                         | $24.00                         |
| claude-2.0            | $8.00                         | $24.00                         |
| claude-instant-1.2    | $0.80                         | $2.40                          |
| open-mistral-7b       | $0.25                         | $0.25                          |
| open-mixtral-8x7b     | $0.70                         | $0.70                          |
| open-mixtral-8x22b    | $2.00                         | $6.00                          |
| mistral-small-2402    | $1.00                         | $3.00                          |
| codestral-2405        | $1.00                         | $3.00                          |
| mistral-medium-2312   | $2.70                         | $8.10                          |
| mistral-large-2402    | $4.00                         | $12.00                         |
| open-mistral-nemo     | $0.30                         | $0.30                          |
| open-codestral-mamba  | $0.25                         | $0.25                          |

#### Free Models

The following models have no cost for input or output tokens:

- gemini-pro
- gemini-pro-vision
- gemini-1.5-pro
- gemini-1.5-flash
- llama3-70b-8192
- llama3-8b-8192
- gemma-7b-it
- mixtral-8x7b-32768