import { GoogleGenAI } from "@google/genai";
import { GenerationRequest, IdeType, AnalysisResponse, AiProvider } from "../types";

// Initialize Gemini Client (Default)
const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Analyzes context - Uses Gemini 3 Pro Preview for deep reasoning on stack detection.
 */
export const analyzeContext = async (context: string): Promise<AnalysisResponse> => {
  if (!process.env.API_KEY) throw new Error("Internal API Key missing for Analysis");

  const prompt = `
    You are a Senior Architect analyzing a request to generate IDE context files.
    
    User Input Context: "${context}"
    
    Task:
    1. Analyze if the input provides enough technical detail (Framework, Language, Testing strategy, Folder structure).
    2. If the user pasted a package.json or file tree, that is usually sufficient -> Return "READY".
    3. If vague (e.g., "Make rules for a website"), return "NEEDS_INFO" and ask specifically about:
       - The testing framework (vital for Agents to run tests).
       - The state management or key libraries.
       - The preferred styling engine.
    
    Output JSON format:
    {
      "status": "READY" | "NEEDS_INFO",
      "summary": "Brief summary of detected stack (e.g., Next.js 14, Jest, Tailwind)",
      "questions": ["Question 1?", "Question 2?"] // Only if NEEDS_INFO
    }
  `;

  const response = await genAI.models.generateContent({
    model: 'gemini-3-pro-preview', // Upgraded to 3 Pro for better analysis
    contents: prompt,
    config: { responseMimeType: 'application/json' }
  });

  if (!response.text) throw new Error("Failed to analyze context");
  return JSON.parse(response.text) as AnalysisResponse;
};

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
      // Generic fallback for single file types
      prompt += `\nGenerate the specific configuration file for ${request.ide}. Ensure strict syntax and best practices.\nDelimiter: --- START OF FILE: output ---`;
  }

  return prompt;
}

/**
 * MAIN GENERATION FUNCTION - ROUTES TO PROVIDER
 */
export const generateRulesStream = async (
  request: GenerationRequest, 
  onChunk: (text: string) => void
): Promise<void> => {
  
  const { provider, apiKey, endpoint, deployment, apiVersion } = request.aiConfig;
  const systemPrompt = getSystemPrompt(request.ide);
  const userPrompt = constructPrompt(request);

  switch (provider) {
    case AiProvider.GEMINI:
      // Uses gemini-3-pro-preview (Complex Tasks)
      await generateWithGemini(userPrompt, systemPrompt, onChunk);
      break;
    case AiProvider.OPENAI:
    case AiProvider.CODEX_CLI:
      // Uses gpt-5.1 (Bleeding Edge)
      await generateWithOpenAI(userPrompt, systemPrompt, apiKey!, onChunk);
      break;
    case AiProvider.AZURE:
      // Uses gpt-5.1 (dependent on user deployment)
      await generateWithAzure(userPrompt, systemPrompt, apiKey!, endpoint!, deployment!, apiVersion!, onChunk);
      break;
    case AiProvider.CLAUDE:
      // Uses claude-4.5-sonnet
      await generateWithClaude(userPrompt, systemPrompt, apiKey!, onChunk);
      break;
    default:
      throw new Error(`Provider ${provider} not implemented`);
  }
};

// --- PROVIDER IMPLEMENTATIONS ---

const generateWithGemini = async (prompt: string, systemInstruction: string, onChunk: (text: string) => void) => {
  if (!process.env.API_KEY) throw new Error("Gemini API Key missing");
  
  const responseStream = await genAI.models.generateContentStream({
    model: 'gemini-3-pro-preview', // Using Gemini 3 Pro for maximum reasoning
    contents: prompt,
    config: {
      systemInstruction: systemInstruction,
      temperature: 0.2,
    }
  });

  for await (const chunk of responseStream) {
    if (chunk.text) onChunk(chunk.text);
  }
};

const generateWithOpenAI = async (prompt: string, system: string, key: string, onChunk: (text: string) => void) => {
  if (!key) throw new Error("OpenAI API Key required");
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`
    },
    body: JSON.stringify({
      model: 'gpt-5.1', // Enforcing GPT-5.1 per user request
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: prompt }
      ],
      stream: true
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI API Error: ${response.statusText} - ${err}`);
  }
  await processSSEStream(response, onChunk, 'openai');
};

const generateWithAzure = async (prompt: string, system: string, key: string, endpoint: string, deployment: string, version: string, onChunk: (text: string) => void) => {
  if (!key || !endpoint || !deployment) throw new Error("Azure Config incomplete");
  
  // Format: https://{resource}.openai.azure.com/openai/deployments/{deployment}/chat/completions?api-version={version}
  const url = `${endpoint.replace(/\/$/, '')}/openai/deployments/${deployment}/chat/completions?api-version=${version || '2025-01-01-preview'}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': key
    },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: prompt }
      ],
      stream: true
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Azure API Error: ${response.statusText} - ${err}`);
  }
  await processSSEStream(response, onChunk, 'azure');
};

const generateWithClaude = async (prompt: string, system: string, key: string, onChunk: (text: string) => void) => {
  if (!key) throw new Error("Anthropic API Key required");
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'dangerously-allow-browser': 'true' 
    },
    body: JSON.stringify({
      model: 'claude-4.5-sonnet', // Enforcing 4.5 Sonnet per user request
      max_tokens: 8192,
      system: system,
      messages: [
        { role: 'user', content: prompt }
      ],
      stream: true
    })
  });

  if (!response.ok) {
     const errText = await response.text();
     if (errText.includes('CORS') || response.status === 0) {
         throw new Error("CORS Error: Browser blocked Anthropic API. Please use a CORS proxy or the 'Gemini' provider.");
     }
     throw new Error(`Claude API Error: ${response.statusText} - ${errText}`);
  }
  await processSSEStream(response, onChunk, 'claude');
};

// Helper to process Server-Sent Events from OpenAI/Azure/Claude
const processSSEStream = async (response: Response, onChunk: (text: string) => void, provider: 'openai' | 'azure' | 'claude') => {
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
      if (!trimmed || trimmed === 'data: [DONE]') continue;
      
      if (trimmed.startsWith('data: ') || trimmed.startsWith('event: completion')) {
        const dataStr = trimmed.replace(/^data: /, '').trim();
        if (!dataStr || dataStr === '[DONE]') continue;

        try {
          const data = JSON.parse(dataStr);
          let text = '';
          
          if (provider === 'openai' || provider === 'azure') {
            text = data.choices?.[0]?.delta?.content || '';
          } else if (provider === 'claude') {
             if (data.type === 'content_block_delta') {
               text = data.delta?.text || '';
             }
          }
          
          if (text) onChunk(text);
        } catch (e) {
          // Partial JSON parse error, skip
        }
      }
    }
  }
};