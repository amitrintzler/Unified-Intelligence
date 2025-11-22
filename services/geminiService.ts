import { GoogleGenAI, Type } from "@google/genai";
import { GenerationRequest, IdeType, AnalysisResponse, AiProvider, AiConfiguration } from "../types";

// --- 1. Environment Abstraction (Vite + Node/Sandpack support) ---
const Env = {
  get: (key: string): string | undefined => {
    // Check Vite standard env vars (import.meta.env) if available
    if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env[key]) {
      return (import.meta as any).env[key];
    }
    // Fallback to process.env (Node/Sandpack)
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
    // Specific mapping for the default internal key often used in this env
    if (key === 'VITE_GEMINI_API_KEY' && typeof process !== 'undefined' && process.env.API_KEY) {
      return process.env.API_KEY;
    }
    return undefined;
  }
};

// --- 2. Prompt Engineering Helpers ---

const getSystemPrompt = (ide: IdeType): string => {
  const base = "You are an expert AI Tooling Specialist.";
  
  switch (ide) {
    case IdeType.UNIVERSAL:
      return `${base} You specialize in setting up a "Unified AI Context" for multiple LLM platforms simultaneously (Cursor, Copilot, Claude, OpenAI).`;
    case IdeType.CODEX:
      return `${base} You specialize in OpenAI Codex and GPT-5 system prompts, focusing on strict token efficiency and code correctness.`;
    case IdeType.CLAUDE:
      return `${base} You specialize in Anthropic Claude Projects (4.5 Sonnet), focusing on large context windows, artifacts, and architectural reasoning.`;
    case IdeType.CURSOR:
      return `${base} You specialize in Cursor IDE (.cursorrules), optimizing for hybrid model usage (Claude 4.5 + GPT-5.1).`;
    case IdeType.COPILOT:
      return `${base} You specialize in GitHub Copilot (.github/copilot-instructions.md), focusing on concise, inline suggestions and chat persona.`;
    case IdeType.AGENTS:
      return `${base} You specialize in Autonomous AI Agent architecture (agents.md), using XML protocols and chain-of-thought enforcement.`;
    default:
      return `${base} You generate specific configuration files for AI coding tools.`;
  }
};

const constructPrompt = (request: GenerationRequest): string => {
  let prompt = `
    Generate configuration for: ${request.ide}
    Context/Stack: ${request.context}
  `;

  if (request.answers) {
    prompt += `\nUser Clarifications:\n${Object.entries(request.answers).map(([q, a]) => `Q: ${q}\nA: ${a}`).join('\n')}`;
  }
  
  // Inject Universal/Specific Prompt Instructions
  if (request.ide === IdeType.UNIVERSAL) {
    prompt += `
      \nPlease generate the following 5 files. Use the delimiters strictly.

      1. .cursorrules (For Cursor/VS Code)
         - Focus on: Syntax rules, naming conventions, strict file structure enforcement.
         - Include "Project triggers" (e.g., "When editing .tsx, ensure accessibility").
         - Target Model: Claude 4.5 Sonnet.

      2. agents.md (For Autonomous Agents / Windsurf / Cursor Agent)
         - STYLE: "Advanced Cognitive Architecture" Configuration.
         - DO NOT use simple bullet points. Use XML-style tagging for high informational density (e.g., <role>, <workflow>, <constraints>).
         - STRUCTURE:
           - <global_constraints>: NO hallucinations, strict TDD, "Chain of Thought" mandatory before code.
           - <mcp_tools>: Explicitly define usage of 'postgres-mcp', 'filesystem-mcp' etc. if relevant.
           - <roles>: Define the following with deep <profile>, <triggers>, and <interaction_protocol>:
             - @ProductOwner (Gherkin stories)
             - @Architect (Pattern enforcement, Folder structure)
             - @Developer (Implementation, TDD)
             - @QA (Test generation)
             - @Security (OWASP audits)
             - @Refactor (Context-aware cleanup)
             - @DevOps (CI/CD, Docker)
             - @TechWriter (Docs)
             - @Database (MCP Specialist)
         - MANDATORY: Enforce a <thinking_process> block before any code output to ensure quality.

      3. .github/copilot-instructions.md (For GitHub Copilot)
         - Focus on: Chat tone (terse/verbose), specific framework nuances not covered by linting.
         - Target: GPT-5.1 class models.

      4. claude-project-instructions.md (For Claude Projects)
         - Focus on: "Project Knowledge" and "Custom Instructions".
         - Instruct Claude to use Artifacts for major UI components or complex logic.
         - Define the "Persona" as a Staff Engineer who prefers composition over inheritance and functional patterns.
         - Include a high-level architectural summary of the stack.

      5. codex_system_prompt.txt (For OpenAI Codex / generic LLM Context)
         - A concise System Prompt summarizing the stack, coding style, and constraints for use with raw LLM calls (CLI/Scripts).

      IMPORTANT: Separate each file with this exact delimiter line:
      --- START OF FILE: [filename] ---
    `;
  } else if (request.ide === IdeType.AGENTS) {
      prompt += `
      \nGenerate an agents.md file for Autonomous AI Agents.
      The prompt should:
      - Use XML-structured "Advanced Cognitive Architecture".
      - Define specific roles (@Architect, @QA, etc.).
      - Enforce <thinking> blocks.
      - Define MCP (Model Context Protocol) tool usage.
      Delimiter: --- START OF FILE: agents.md ---
      `;
  } else {
      prompt += `\nGenerate the specific configuration file for ${request.ide}. Ensure strict syntax and best practices.\nDelimiter: --- START OF FILE: output ---`;
  }

  return prompt;
}

// --- 3. Provider Abstractions ---

interface IContentGenerator {
  generateStream(
    prompt: string, 
    systemPrompt: string, 
    config: AiConfiguration, 
    onChunk: (text: string) => void
  ): Promise<void>;
}

// --- GEMINI IMPLEMENTATION ---
class GeminiProvider implements IContentGenerator {
  async generateStream(prompt: string, systemPrompt: string, config: AiConfiguration, onChunk: (text: string) => void) {
    const key = config.apiKey || Env.get('VITE_GEMINI_API_KEY');
    if (!key) throw new Error("Gemini API Key missing. Add VITE_GEMINI_API_KEY to .env or settings.");

    const genAI = new GoogleGenAI({ apiKey: key });
    
    const responseStream = await genAI.models.generateContentStream({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.2,
      }
    });

    for await (const chunk of responseStream) {
      if (chunk.text) onChunk(chunk.text);
    }
  }
}

// --- OPENAI IMPLEMENTATION (Handles GPT-5.1 & Codex CLI) ---
class OpenAIProvider implements IContentGenerator {
  async generateStream(prompt: string, systemPrompt: string, config: AiConfiguration, onChunk: (text: string) => void) {
    const key = config.apiKey || Env.get('VITE_OPENAI_API_KEY');
    if (!key) throw new Error("OpenAI API Key missing. Add VITE_OPENAI_API_KEY to .env or settings.");

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({
        model: 'gpt-5.1', // Bleeding edge target
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        stream: true
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OpenAI API Error: ${response.statusText} - ${err}`);
    }
    await this.processSSE(response, onChunk);
  }

  protected async processSSE(response: Response, onChunk: (text: string) => void) {
    const reader = response.body?.getReader();
    if (!reader) return;
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ') && trimmed !== 'data: [DONE]') {
          try {
            const data = JSON.parse(trimmed.replace(/^data: /, ''));
            const content = data.choices?.[0]?.delta?.content;
            if (content) onChunk(content);
          } catch (e) { /* ignore parse error */ }
        }
      }
    }
  }
}

// --- AZURE IMPLEMENTATION ---
class AzureProvider extends OpenAIProvider {
  async generateStream(prompt: string, systemPrompt: string, config: AiConfiguration, onChunk: (text: string) => void) {
    const key = config.apiKey || Env.get('VITE_AZURE_API_KEY');
    const endpoint = config.endpoint || Env.get('VITE_AZURE_ENDPOINT');
    const deployment = config.deployment || Env.get('VITE_AZURE_DEPLOYMENT');
    const version = config.apiVersion || '2025-01-01-preview';

    if (!key || !endpoint || !deployment) throw new Error("Azure Config incomplete. Need Key, Endpoint, and Deployment.");

    const url = `${endpoint.replace(/\/$/, '')}/openai/deployments/${deployment}/chat/completions?api-version=${version}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': key
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        stream: true
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Azure API Error: ${response.statusText} - ${err}`);
    }
    await this.processSSE(response, onChunk);
  }
}

// --- ANTHROPIC IMPLEMENTATION ---
class AnthropicProvider implements IContentGenerator {
  async generateStream(prompt: string, systemPrompt: string, config: AiConfiguration, onChunk: (text: string) => void) {
    const key = config.apiKey || Env.get('VITE_ANTHROPIC_API_KEY');
    if (!key) throw new Error("Anthropic API Key missing.");

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        'dangerously-allow-browser': 'true'
      },
      body: JSON.stringify({
        model: 'claude-4.5-sonnet',
        max_tokens: 8192,
        system: systemPrompt,
        messages: [{ role: 'user', content: prompt }],
        stream: true
      })
    });

    if (!response.ok) {
      const err = await response.text();
       if (err.includes('CORS') || response.status === 0) {
         throw new Error("CORS Error: Browser blocked Anthropic API. Please use a proxy.");
       }
      throw new Error(`Claude API Error: ${response.statusText} - ${err}`);
    }

    const reader = response.body?.getReader();
    if (!reader) return;
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ')) {
          try {
             const data = JSON.parse(trimmed.replace(/^data: /, ''));
             if (data.type === 'content_block_delta') {
               onChunk(data.delta?.text || '');
             }
          } catch (e) { /* ignore */ }
        }
      }
    }
  }
}

// --- 4. Service Factory & Public Exports ---

const getProviderImplementation = (provider: AiProvider): IContentGenerator => {
  switch (provider) {
    case AiProvider.GEMINI: return new GeminiProvider();
    case AiProvider.OPENAI: 
    case AiProvider.CODEX_CLI: return new OpenAIProvider();
    case AiProvider.AZURE: return new AzureProvider();
    case AiProvider.CLAUDE: return new AnthropicProvider();
    default: throw new Error(`Provider ${provider} not supported`);
  }
};

/**
 * Main entry point for generating rules via the selected provider.
 */
export const generateRulesStream = async (
  request: GenerationRequest, 
  onChunk: (text: string) => void
): Promise<void> => {
  const providerImpl = getProviderImplementation(request.aiConfig.provider);
  const systemPrompt = getSystemPrompt(request.ide);
  const userPrompt = constructPrompt(request);
  
  await providerImpl.generateStream(userPrompt, systemPrompt, request.aiConfig, onChunk);
};

/**
 * Analyze context using a cheap/fast model (Defaulting to Gemini for analysis)
 */
export const analyzeContext = async (context: string): Promise<AnalysisResponse> => {
  // Defaults to using the internal Gemini key for analysis regardless of selected provider
  // to save user tokens on other platforms.
  const key = Env.get('VITE_GEMINI_API_KEY');
  if (!key) throw new Error("Analysis requires VITE_GEMINI_API_KEY");

  const genAI = new GoogleGenAI({ apiKey: key });
  const prompt = `
    You are a Senior Architect.
    Analyze this context: "${context}"
    Is there enough info to generate framework-specific rules?
    Return JSON: { "status": "READY" | "NEEDS_INFO", "questions": [], "summary": "" }
  `;

  const response = await genAI.models.generateContent({
    model: 'gemini-2.5-flash', // Cheap model for analysis
    contents: prompt,
    config: { 
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          status: {
            type: Type.STRING,
            enum: ['READY', 'NEEDS_INFO'],
          },
          questions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          summary: {
            type: Type.STRING,
          },
        },
        required: ['status'],
      },
    }
  });

  if (!response.text) throw new Error("Failed to analyze context");
  return JSON.parse(response.text) as AnalysisResponse;
};