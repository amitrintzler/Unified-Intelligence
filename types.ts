export enum IdeType {
  UNIVERSAL = 'Universal (All Platforms)',
  CURSOR = 'Cursor (.cursorrules)',
  COPILOT = 'GitHub Copilot (copilot-instructions.md)',
  AGENTS = 'Autonomous Agents (agents.md)',
  CLAUDE = 'Claude (Anthropic Skills)',
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
  GEMINI = 'Google Gemini (3 Pro Preview)',
  OPENAI = 'OpenAI (GPT-5.1)',
  AZURE = 'Azure OpenAI (GPT-5.1)',
  CLAUDE = 'Anthropic Claude (4.5 Sonnet)',
  CODEX_CLI = 'Codex CLI (Bleeding Edge)'
}

export enum OutputStyle {
  XML = 'Strict XML (Best for Agents/Claude)',
  MARKDOWN = 'Standard Markdown (Best for Copilot/GPT)',
  JSON = 'Strict JSON (Best for API/Schema)'
}

export interface AiConfiguration {
  provider: AiProvider;
  apiKey?: string;
  endpoint?: string; // For Azure/Custom
  deployment?: string; // For Azure
  apiVersion?: string; // For Azure
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