export enum IdeType {
  UNIVERSAL = 'Universal (All Platforms)',
  CURSOR = 'Cursor (.cursorrules)',
  COPILOT = 'GitHub Copilot (copilot-instructions.md)',
  AGENTS = 'Autonomous Agents (agents.md)',
  CLAUDE = 'Claude Projects (project context)',
  CODEX = 'OpenAI Codex (System Prompt)'
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

export interface GenerationRequest {
  ide: IdeType;
  template: TemplateType;
  context: string; // Renamed from customInstructions for clarity
  answers?: Record<string, string>;
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