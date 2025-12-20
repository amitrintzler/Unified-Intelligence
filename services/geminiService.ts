import { GoogleGenAI, Type } from "@google/genai";
import { GenerationRequest, IdeType, AnalysisResponse, AiProvider, AiConfiguration, OutputStyle } from "../types";

// The Google Gemini API key must be obtained exclusively from process.env.API_KEY
const getGeminiKey = () => process.env.API_KEY;

const getSystemPrompt = (ide: IdeType): string => {
  const base = "You are an expert AI Cognitive Architect specialized in technical context orchestration.";
  
  switch (ide) {
    case IdeType.UNIVERSAL:
      return `${base} You specialize in creating a "Unified AI Context" for multiple LLM platforms. Ensure each output file follows its platform's strict standards.`;
    case IdeType.CLAUDE:
      return `${base} You specialize in creating official "Anthropic Skills." You MUST use the strict XML root tag <anthropic_skill> as defined in Anthropic's documentation for persistent capabilities.`;
    case IdeType.CODEX:
      return `${base} You specialize in OpenAI Codex "Instruction Skills." Create high-density system prompts that act as persistent skill-sets for OpenAI's Codex and GPT models.`;
    default:
      return `${base} You generate expert-level configuration files for AI coding tools.`;
  }
};

const constructPrompt = (request: GenerationRequest): string => {
  const style = request.style;
  
  let prompt = `
    TASK: Generate highly specialized configuration files for ${request.ide}.
    CONTEXT: ${request.context}
    OUTPUT STYLE: ${style}
  `;

  if (request.answers) {
    prompt += `\nUSER CLARIFICATIONS:\n${Object.entries(request.answers).map(([q, a]) => `Q: ${q}\nA: ${a}`).join('\n')}`;
  }

  if (request.ide === IdeType.UNIVERSAL) {
    prompt += `
      Generate exactly 5 files. Use the delimiters strictly.

      1. .cursorrules (For Cursor) - High-density rules for file structure and syntax.
      2. agents.md (For Autonomous Agents) - Multi-agent role definitions (@Architect, @Developer).
      3. .github/copilot-instructions.md (For GitHub Copilot) - Markdown instructions for chat behavior.
      4. claude_skill.xml (Anthropic Skill Standard) - Compliant <anthropic_skill> XML block.
      5. codex_skill.md (OpenAI Codex Skill) - Procedural rules for GPT-series persistent behavior.

      Use delimiter: --- START OF FILE: [filename] ---
    `;
  } else if (request.ide === IdeType.CLAUDE) {
    prompt += `
      Generate a "Claude Skill" using the official Anthropic standard.
      MANDATORY XML STRUCTURE:
      <anthropic_skill>
        <name>[Skill Name]</name>
        <description>[What this skill does]</description>
        <instruction_set>
          <instruction>[Procedural Step 1]</instruction>
          <instruction>[Procedural Step 2]</instruction>
        </instruction_set>
        <examples>
          <example>
            <input>[Sample Query]</input>
            <output>[Sample Code]</output>
          </example>
        </examples>
        <constraints>
          <constraint>[Forbidden behavior]</constraint>
        </constraints>
      </anthropic_skill>
      Delimiter: --- START OF FILE: claude_skill.xml ---
    `;
  } else if (request.ide === IdeType.CODEX) {
    prompt += `
      Generate an "OpenAI Codex Skill" (Instruction Set).
      Focus on high-performance procedural rules for GPT models to act as a permanent specialist.
      Structure:
      ## Skill: [Name]
      ### Role Definition
      ### Core Capabilities
      ### Procedural Constraints
      ### Knowledge Architecture
      Delimiter: --- START OF FILE: codex_skill.md ---
    `;
  } else {
    prompt += `\nGenerate the output for ${request.ide}.\nDelimiter: --- START OF FILE: output ---`;
  }

  return prompt;
};

export const generateRulesStream = async (request: GenerationRequest, onChunk: (text: string) => void): Promise<void> => {
  const key = getGeminiKey();
  if (!key) throw new Error("Gemini API Key missing (process.env.API_KEY).");

  const ai = new GoogleGenAI({ apiKey: key });
  const systemPrompt = getSystemPrompt(request.ide);
  const userPrompt = constructPrompt(request);

  try {
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-3-pro-preview',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        thinkingConfig: { thinkingBudget: 16000 }
      }
    });

    for await (const chunk of responseStream) {
      if (chunk.text) onChunk(chunk.text);
    }
  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    throw new Error(error.message || "An error occurred during rule generation.");
  }
};

export const analyzeContext = async (context: string): Promise<AnalysisResponse> => {
  const key = getGeminiKey();
  if (!key) throw new Error("Gemini API Key missing (process.env.API_KEY).");

  const ai = new GoogleGenAI({ apiKey: key });
  const prompt = `Analyze this project context and determine if it is ready for AI rule generation: "${context}". If missing info (like stack details), ask specific questions. Return strictly valid JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { 
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: { type: Type.STRING, enum: ['READY', 'NEEDS_INFO'] },
            questions: { type: Type.ARRAY, items: { type: Type.STRING } },
            summary: { type: Type.STRING },
          },
          required: ['status'],
        },
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI analysis.");
    return JSON.parse(text) as AnalysisResponse;
  } catch (error: any) {
    console.error("Context Analysis Error:", error);
    throw new Error(error.message || "Failed to analyze context.");
  }
};