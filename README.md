# UniGen - Unified Agile Intelligence

UniGen is a powerful web application for generating advanced context files for AI coding assistants, including Cursor (`.cursorrules`), GitHub Copilot, Claude Projects, and Autonomous Agents.

## AI Provider Configuration

UniGen supports multiple AI providers to power its generation engine. You can configure these providers using environment variables (for local development/deployment) or via the UI settings panel.

### Supported Providers & Models
*   **Google Gemini**: Uses `gemini-3-pro-preview` (Default)
*   **OpenAI**: Uses `gpt-5.1` (Bleeding Edge)
*   **Anthropic**: Uses `claude-4.5-sonnet`
*   **Azure OpenAI**: Connects to your private Azure deployments

### Environment Variables

To pre-configure providers without entering keys in the UI every time, create a `.env` file in the project root:

```env
# Google Gemini (Required for Context Analysis)
VITE_GEMINI_API_KEY=your_gemini_key_here

# OpenAI (Optional)
VITE_OPENAI_API_KEY=sk-proj-...

# Anthropic Claude (Optional)
# Note: Browser CORS policies often block direct calls to Anthropic. 
# Use a proxy or enable 'dangerously-allow-browser' carefully.
VITE_ANTHROPIC_API_KEY=sk-ant-...

# Azure OpenAI (Optional)
VITE_AZURE_API_KEY=your_azure_key
VITE_AZURE_ENDPOINT=https://your-resource.openai.azure.com
VITE_AZURE_DEPLOYMENT=gpt-4o-deployment
```

### Using the UI
1.  Navigate to the **Generator** tab.
2.  Click on **Generation Engine** (Settings Icon).
3.  Select your desired provider from the dropdown.
4.  Enter your API Key (keys are stored in React state only and never sent to our servers, only to the AI provider).

## Architecture
*   **Frontend**: React + Vite + Tailwind
*   **AI Logic**: `services/geminiService.ts` (Implements the Provider Pattern)
*   **Deployment**: Static Web App compatible

## Contributing
See `components/References.tsx` for links to the main repository for contributions.
