# GPTPortal

A comprehensive AI chat portal that provides access to multiple AI models including OpenAI GPT, Claude, Gemini, Mistral, and more through a unified web interface.

## Prerequisites

Before installing GPTPortal, ensure you have the following installed on your system:

- **Node.js** (version 16 or higher)
  - Download from [nodejs.org](https://nodejs.org/)
  - Verify installation: `node --version`
- **npm** (comes with Node.js)
  - Verify installation: `npm --version`
- **Git**
  - Download from [git-scm.com](https://git-scm.com/)
  - Verify installation: `git --version`

## Installation Instructions

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/GPTPortal.git
cd GPTPortal
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required dependencies including:
- Express.js for the web server
- OpenAI SDK for GPT models
- Google Generative AI for Gemini
- Anthropic Claude SDK
- Mistral AI SDK
- And other necessary packages

### Step 3: Environment Configuration

1. **Copy the environment template:**
   ```bash
   cp .env.example .env
   ```
   
   If `.env.example` doesn't exist, create a new `.env` file:
   ```bash
   touch .env
   ```

2. **Configure your API keys and settings:**
   
   Open the `.env` file in your preferred text editor and add the following configuration:

   ```env
   # Server Configuration
   PORT_SERVER=3018
   HOST_SERVER=localhost
   PORT_CLIENT=3018
   HOST_CLIENT=localhost
   
   # Authentication (Change these to secure values)
   USER_USERNAME=your_username
   USER_PASSWORD=your_secure_password
   
   # AI Provider API Keys (Add your own keys)
   OPENAI_API_KEY=your_openai_api_key_here
   CLAUDE_API_KEY=your_claude_api_key_here
   GOOGLE_API_KEY=your_google_api_key_here
   MISTRAL_API_KEY=your_mistral_api_key_here
   QROQ_API_KEY=your_groq_api_key_here
   DEEPSEEK_API_KEY=your_deepseek_api_key_here
   CODESTRAL_API_KEY=your_codestral_api_key_here
   
   # Default Settings
   DEFAULT_MODEL=claude-3-5-sonnet-latest
   TEMPERATURE=1
   ```

### Step 4: Obtain API Keys

You'll need to obtain API keys from the AI providers you want to use:

#### OpenAI (Required for GPT models)
1. Visit [platform.openai.com](https://platform.openai.com/)
2. Sign up or log in
3. Go to API Keys section
4. Create a new API key
5. Add it to your `.env` file as `OPENAI_API_KEY`

#### Anthropic Claude (Required for Claude models)
1. Visit [console.anthropic.com](https://console.anthropic.com/)
2. Sign up or log in
3. Go to API Keys section
4. Create a new API key
5. Add it to your `.env` file as `CLAUDE_API_KEY`

#### Google AI (Required for Gemini models)
1. Visit [aistudio.google.com](https://aistudio.google.com/)
2. Sign up or log in
3. Get your API key
4. Add it to your `.env` file as `GOOGLE_API_KEY`

#### Mistral AI (Optional)
1. Visit [console.mistral.ai](https://console.mistral.ai/)
2. Sign up or log in
3. Get your API key
4. Add it to your `.env` file as `MISTRAL_API_KEY`

#### Groq (Optional)
1. Visit [console.groq.com](https://console.groq.com/)
2. Sign up or log in
3. Get your API key
4. Add it to your `.env` file as `QROQ_API_KEY`

#### DeepSeek (Optional)
1. Visit [platform.deepseek.com](https://platform.deepseek.com/)
2. Sign up or log in
3. Get your API key
4. Add it to your `.env` file as `DEEPSEEK_API_KEY`

## Running the Application

### Development Mode

To start the server in development mode:

```bash
npm start
```

The server will start on the configured port (default: 3018).

### Accessing the Application

1. Open your web browser
2. Navigate to: `http://localhost:3018`
3. Log in using the credentials you set in your `.env` file
4. Start chatting with AI models!

## Project Structure

```
GPTPortal/
├── public/                 # Frontend static files
│   ├── portal.html        # Main chat interface
│   ├── setup.html         # Setup page
│   ├── js/                # Frontend JavaScript
│   └── uploads/           # File uploads directory
├── src/                   # Backend source code
│   ├── server/            # Server-side code
│   │   ├── core/          # Core application classes
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic services
│   │   └── middleware/    # Express middleware
│   └── shared/            # Shared utilities
├── server.js              # Main server entry point
├── package.json           # Node.js dependencies
└── .env                   # Environment configuration
```

## Features

- **Multiple AI Models**: Access GPT-4, Claude, Gemini, Mistral, and more
- **Unified Interface**: Single chat interface for all models
- **File Uploads**: Support for document and image uploads
- **Export Capabilities**: Export conversations in various formats
- **Model Switching**: Easily switch between different AI models
- **Context Management**: Intelligent context window handling
- **Cost Tracking**: Monitor API usage and costs
- **Secure Authentication**: Basic authentication system

## Configuration Options

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT_SERVER` | Server port | 3018 |
| `HOST_SERVER` | Server host | localhost |
| `USER_USERNAME` | Login username | Required |
| `USER_PASSWORD` | Login password | Required |
| `DEFAULT_MODEL` | Default AI model | claude-3-5-sonnet-latest |
| `TEMPERATURE` | Model temperature | 1 |

### Customizing the Application

- **Change default model**: Modify `DEFAULT_MODEL` in `.env`
- **Adjust temperature**: Modify `TEMPERATURE` in `.env` (0-2 range)
- **Add custom prompts**: Place them in `public/uploads/prompts/`
- **Modify UI**: Edit files in `public/js/modules/`

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```
   Error: listen EADDRINUSE :::3018
   ```
   Solution: Change `PORT_SERVER` in `.env` to a different port

2. **API key errors**
   ```
   Error: Invalid API key
   ```
   Solution: Verify your API keys are correct and have sufficient credits

3. **Module not found errors**
   ```
   Error: Cannot find module
   ```
   Solution: Run `npm install` again

4. **Permission denied**
   ```
   Error: EACCES permission denied
   ```
   Solution: Ensure you have write permissions to the project directory

### Getting Help

If you encounter issues:
1. Check the console logs for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure your API keys are valid and have sufficient credits
4. Check that all dependencies are installed with `npm install`

## Security Considerations

- **Never commit your `.env` file** to version control
- **Use strong passwords** for authentication
- **Keep API keys secure** and rotate them regularly
- **Run behind a reverse proxy** in production
- **Enable HTTPS** in production environments

## Development

### Adding New AI Providers

1. Create a new handler in `src/server/services/providers/`
2. Register the provider in `src/server/services/providers/providerFactory.js`
3. Add configuration options to the frontend
4. Update documentation

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License - see the LICENSE file for details.

## Support

For support and questions:
- Check the troubleshooting section above
- Review the code documentation
- Open an issue on GitHub

---

**Note**: This application requires API keys from various AI providers. Some providers may charge for API usage. Please review the pricing for each provider before extensive use.