export enum IdeType {
  UNIVERSAL = 'Universal (All Platforms)',
  CURSOR = 'Cursor (.cursorrules)',
  COPILOT = 'GitHub Copilot (copilot-instructions.md)',
  AGENTS = 'Autonomous Agents (agents.md)',
  CLAUDE = 'Claude (Anthropic Skill Standard)',
  CODEX = 'OpenAI Codex (Instruction Skills)'
}

export enum TemplateType {
  DETECT_AUTO = 'Auto-Detect (Paste package.json/Context)',
  REACT_TS = 'React + TypeScript',
  NEXT_JS = 'Next.js (App Router)',
  PYTHON_FLASK = 'Python (Flask)',
  PYTHON_DJANGO = 'Python (Django)',
  NODE_EXPRESS = 'Node.js (Express)',
  RUST = 'Rust',
  FLUTTER = 'Flutter',
  GENERAL = 'General / Other'
}

export enum AiProvider {
  GEMINI = 'Google Gemini (3 Pro)',
  OPENAI = 'OpenAI (GPT-4o/5)',
  AZURE = 'Azure OpenAI',
  CLAUDE = 'Anthropic Claude',
  CODEX_CLI = 'OpenAI Codex Skill'
}

export enum OutputStyle {
  XML = 'Strict XML (Best for Skills/Agents)',
  MARKDOWN = 'Standard Markdown (Best for Copilot/GPT)',
  JSON = 'Strict JSON (Best for API/Schema)'
}

export interface AiConfiguration {
  provider: AiProvider;
  apiKey?: string;
  endpoint?: string; 
  deployment?: string; 
  apiVersion?: string; 
}

export interface GenerationRequest {
  ide: IdeType;
  template: TemplateType;
  context: string; 
  answers?: Record<string, string>;
  aiConfig: AiConfiguration;
  style: OutputStyle;
}

export interface AnalysisResponse {
  status: 'READY' | 'NEEDS_INFO';
  questions?: string[];
  summary?: string;
}

export interface GeneratedFile {
  fileName: string;
  content: string;
}