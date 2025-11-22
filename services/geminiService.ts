import { GoogleGenAI } from "@google/genai";
import { GenerationRequest, IdeType, AnalysisResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Analyzes the user's input to see if we have enough info to generate high-quality rules.
 * If the input is vague (e.g., just "React"), it asks for specifics.
 */
export const analyzeContext = async (context: string): Promise<AnalysisResponse> => {
  if (!process.env.API_KEY) throw new Error("API Key missing");

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

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: { responseMimeType: 'application/json' }
  });

  if (!response.text) throw new Error("Failed to analyze context");
  return JSON.parse(response.text) as AnalysisResponse;
};

const getSystemPrompt = (ide: IdeType): string => {
  const base = "You are an expert AI Tooling Specialist.";
  
  if (ide === IdeType.UNIVERSAL) {
    return `${base} You specialize in setting up a "Unified AI Context". 
    You generate files that work together:
    - cursorrules: Micro-optimizations, formatting, and syntax strictness.
    - agents.md: "Advanced Cognitive Architecture" Configuration. detailed, XML-structured, and high-density prompts.
    - copilot-instructions.md: Chat personality and brevity settings.
    - codex-system.txt: Optimized system prompt for OpenAI Codex models.
    
    Ensure NO duplication of logic. Rules go in cursorrules. Strategy goes in agents.md.`;
  }

  if (ide === IdeType.CODEX) {
    return `${base} You specialize in creating high-performance System Prompts for OpenAI Codex models that define strict coding standards and behaviors.`;
  }

  return `${base} You generate specific configuration files.`;
};

/**
 * Generates the actual content. Supports "Universal" mode which outputs multiple files.
 */
export const generateRulesStream = async (
  request: GenerationRequest, 
  onChunk: (text: string) => void
): Promise<void> => {
  if (!process.env.API_KEY) throw new Error("API Key missing");

  let prompt = `
    Generate configuration for: ${request.ide}
    Context/Stack: ${request.context}
  `;

  if (request.answers) {
    prompt += `\nUser Clarifications:\n${Object.entries(request.answers).map(([q, a]) => `Q: ${q}\nA: ${a}`).join('\n')}`;
  }

  if (request.ide === IdeType.UNIVERSAL) {
    prompt += `
      \nPlease generate the following 4 files. Use the delimiters strictly.

      1. .cursorrules (For Cursor/VS Code)
         - Focus on: Syntax rules, naming conventions, strict file structure enforcement.
         - Include "Project triggers" (e.g., "When editing .tsx, ensure accessibility").

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

      4. codex_system_prompt.txt (For OpenAI Codex / generic LLM Context)
         - A concise System Prompt summarizing the stack, coding style, and constraints for use with raw LLM calls.

      IMPORTANT: Separate each file with this exact delimiter line:
      --- START OF FILE: [filename] ---
    `;
  } else if (request.ide === IdeType.CODEX) {
    prompt += `
      \nGenerate a comprehensive System Prompt (codex_system_prompt.txt) for OpenAI Codex/GPT-4.
      The prompt should:
      - Define the Persona (Senior Engineer in [Stack]).
      - List strict Code Style rules.
      - specific "Do's and Don'ts".
      - Include examples of good vs bad code for this specific context.
    `;
  } else {
     prompt += `\nOutput only the raw file content for ${request.ide}. No markdown fences unless necessary.`;
  }

  try {
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: getSystemPrompt(request.ide),
        temperature: 0.2,
      }
    });

    for await (const chunk of responseStream) {
      if (chunk.text) onChunk(chunk.text);
    }
  } catch (error) {
    console.error("Error generating rules:", error);
    throw new Error("Failed to generate rules.");
  }
};