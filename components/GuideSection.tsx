import React, { useState } from 'react';
import { BrainCircuit, Layers, LayoutTemplate, Bug, GitPullRequest, Shield, UserCircle, Code2, Terminal, BookOpen, Database, Zap, Laptop, Cpu, Check, FileCode, Braces, Sparkles, FolderTree, MessageSquarePlus, Command, ArrowRight, FileText, FileJson } from 'lucide-react';

type AgentRole = 'productOwner' | 'architect' | 'developer' | 'qa' | 'security' | 'refactor' | 'devops' | 'techWriter' | 'database';

const GuideSection: React.FC = () => {
  const [activeExample, setActiveExample] = useState<AgentRole>('productOwner');

  const roles = [
    { id: 'productOwner', label: '@ProductOwner', color: 'text-yellow-400', bg: 'bg-yellow-900/20', glow: 'bg-yellow-500', icon: UserCircle },
    { id: 'architect', label: '@Architect', color: 'text-purple-400', bg: 'bg-purple-900/20', glow: 'bg-purple-500', icon: LayoutTemplate },
    { id: 'developer', label: '@Developer', color: 'text-blue-400', bg: 'bg-blue-900/20', glow: 'bg-blue-500', icon: Code2 },
    { id: 'database', label: '@Database (MCP)', color: 'text-teal-400', bg: 'bg-teal-900/20', glow: 'bg-teal-500', icon: Database },
    { id: 'qa', label: '@QA', color: 'text-red-400', bg: 'bg-red-900/20', glow: 'bg-red-500', icon: Bug },
    { id: 'security', label: '@Security', color: 'text-orange-400', bg: 'bg-orange-900/20', glow: 'bg-orange-500', icon: Shield },
    { id: 'devops', label: '@DevOps', color: 'text-cyan-400', bg: 'bg-cyan-900/20', glow: 'bg-cyan-500', icon: Terminal },
    { id: 'refactor', label: '@Refactor', color: 'text-green-400', bg: 'bg-green-900/20', glow: 'bg-green-500', icon: GitPullRequest },
    { id: 'techWriter', label: '@TechWriter', color: 'text-pink-400', bg: 'bg-pink-900/20', glow: 'bg-pink-500', icon: BookOpen },
  ];

  const roleContent: Record<AgentRole, { title: string; desc: string; prompt: string; output: string }> = {
    productOwner: {
      title: "Requirements & Stories",
      desc: "Focuses on the 'Why' and 'What'. Generates user stories, acceptance criteria, and business logic definitions using Gherkin.",
      prompt: "@ProductOwner I need a feature for users to reset their password via email.",
      output: `<feature_definition>
  ### User Story: Password Reset
  **As a** registered user
  **I want to** reset my password via an email link
  **So that** I can recover access to my account.

  <acceptance_criteria>
    - GIVEN a user exists with email "user@example.com"
    - WHEN they request a password reset
    - THEN an email with a unique, time-limited token is sent
    - AND the token expires in 15 minutes
  </acceptance_criteria>
</feature_definition>`
    },
    architect: {
      title: "System Design & Structure",
      desc: "Focuses on the 'How'. Defines folder structure, interfaces, state management patterns, and library choices.",
      prompt: "@Architect Plan the folder structure for the Password Reset feature in Next.js.",
      output: `<architecture_plan>
  <thinking>
    1. Analyze stack: Next.js 14 (App Router).
    2. Determine separation of concerns: Server Actions for logic, Client Components for forms.
  </thinking>
  <structure>
    - /app/auth/reset-password/page.tsx (UI)
    - /components/auth/ResetPasswordForm.tsx (Client Component)
    - /lib/auth/tokens.ts (Token generation logic)
    - /services/email.ts (Email provider abstraction)
    - /types/auth.ts (Interface: ResetTokenPayload)
  </structure>
</architecture_plan>`
    },
    developer: {
      title: "Implementation & Code",
      desc: "The builder. Takes the Architect's plan and writes clean, functional code following the project's style guide.",
      prompt: "@Developer Implement the 'ResetPasswordForm.tsx' component using shadcn/ui.",
      output: `<code_implementation>
  <thinking>
    1. Import Zod for validation.
    2. Use 'react-hook-form' for state.
    3. Implement 'onSubmit' handler calling Server Action.
  </thinking>
  
  // Using React Hook Form + Zod as per project rules
  import { useForm } from "react-hook-form";
  import { zodResolver } from "@hookform/resolvers/zod";
  import { z } from "zod";

  const formSchema = z.object({
    email: z.string().email(),
  });

  export function ResetPasswordForm() { ... }
</code_implementation>`
    },
    database: {
      title: "MCP & Data Tools",
      desc: "Uses Model Context Protocol (MCP) to interact with real data. Bridges the gap between chat and your database.",
      prompt: "@Database Check the 'users' table schema and generate a migration for the 'last_login' column.",
      output: `<mcp_execution>
  <tool_call tool="postgres-mcp" action="query">
    SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users';
  </tool_call>
  
  <result>
    // Based on the current schema, here is the safe migration:
    ALTER TABLE users 
    ADD COLUMN last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  </result>
</mcp_execution>`
    },
    qa: {
      title: "Testing & Validation",
      desc: "Ensures quality. Writes unit tests, integration tests, and end-to-end scenarios based on Acceptance Criteria.",
      prompt: "@QA Write a Jest test for the token expiration logic.",
      output: `<test_suite>
  describe('Token Validation', () => {
    it('should reject a token that is older than 15 minutes', () => {
      const expiredToken = generateToken({ createdAt: Date.now() - (20 * 60 * 1000) });
      expect(validateToken(expiredToken)).toBe(false);
    });
  });
</test_suite>`
    },
    security: {
      title: "Audit & Vulnerabilities",
      desc: "Focuses on safety. Checks for XSS, SQL Injection, CSRF, and proper authentication flows.",
      prompt: "@Security Review the password reset implementation for vulnerabilities.",
      output: `<security_audit>
  <vulnerabilities>
    1. [High] Rate Limiting: Ensure the API endpoint is rate-limited to prevent email flooding.
    2. [Medium] Token Leakage: Ensure the token is not logged in server logs.
    3. [Critical] Account Enumeration: The API response should be generic ("If the email exists, we sent a link") to avoid revealing registered emails.
  </vulnerabilities>
</security_audit>`
    },
    devops: {
      title: "Deployment & CI/CD",
      desc: "Handles infrastructure. Writes Dockerfiles, GitHub Actions workflows, and Kubernetes configurations.",
      prompt: "@DevOps Create a GitHub Action to run tests before deployment.",
      output: `name: CI Pipeline
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: setup-node@v3
      - run: npm ci
      - run: npm test`
    },
    refactor: {
      title: "Optimization & Cleanup",
      desc: "Context-aware expertise. Acts as a Senior Expert for the specific language detected (e.g., React Specialist vs Python Guru). Uses file triggers to determine scope.",
      prompt: "@Refactor Simplify this nested if-else logic in the auth handler.",
      output: `// Before: Deeply nested if statements
// After: Guard clauses pattern

if (!user) return error("User not found");
if (!token) return error("Token missing");
if (isExpired(token)) return error("Token expired");

// Proceed with password reset...`
    },
    techWriter: {
      title: "Documentation",
      desc: "Ensures maintainability. Writes API docs, README updates, and usage guides.",
      prompt: "@TechWriter Generate a Swagger/OpenAPI definition for the reset endpoint.",
      output: `/auth/reset-password:
  post:
    summary: Request password reset
    requestBody:
      content:
        application/json:
          schema:
            type: object
            properties:
              email: { type: string }`
    }
  };

  const activeRoleData = roleContent[activeExample];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-24">
      
      {/* Hero Section with Developer Workstation Visuals */}
      <div className="relative w-full rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl bg-slate-900 mb-24 group">
        {/* Background Image */}
        <div className="absolute inset-0">
            <img 
                src="https://images.unsplash.com/photo-1555099962-4199c345e5dd?q=80&w=2000&auto=format&fit=crop" 
                alt="Developer workstation with multiple monitors" 
                className="w-full h-full object-cover opacity-50 group-hover:opacity-40 transition-opacity duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] via-[#0B1120]/80 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0B1120]"></div>
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col items-center justify-center py-32 px-4 text-center">
            
            {/* Visual "Monitors" representing the Unified Intelligence */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-10">
                 {/* Monitor 1: Cursor */}
                 <div className="flex flex-col items-center gap-2 animate-fade-in-up" style={{ animationDelay: '0ms' }}>
                    <div className="w-16 h-12 md:w-24 md:h-16 bg-slate-900/90 backdrop-blur border border-blue-500/30 rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.3)] flex items-center justify-center hover:scale-110 transition-transform duration-300">
                       <Code2 className="w-6 h-6 md:w-8 md:h-8 text-blue-400" />
                    </div>
                    <span className="text-[10px] md:text-xs font-bold text-blue-200 tracking-wider bg-black/40 px-2 py-0.5 rounded-full border border-white/5">CURSOR</span>
                 </div>

                 {/* Monitor 2: Agents */}
                 <div className="flex flex-col items-center gap-2 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                    <div className="w-16 h-12 md:w-24 md:h-16 bg-slate-900/90 backdrop-blur border border-purple-500/30 rounded-lg shadow-[0_0_15px_rgba(168,85,247,0.3)] flex items-center justify-center hover:scale-110 transition-transform duration-300">
                       <BrainCircuit className="w-6 h-6 md:w-8 md:h-8 text-purple-400" />
                    </div>
                    <span className="text-[10px] md:text-xs font-bold text-purple-200 tracking-wider bg-black/40 px-2 py-0.5 rounded-full border border-white/5">AGENTS</span>
                 </div>

                 {/* Monitor 3: Copilot */}
                 <div className="flex flex-col items-center gap-2 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                    <div className="w-16 h-12 md:w-24 md:h-16 bg-slate-900/90 backdrop-blur border border-orange-500/30 rounded-lg shadow-[0_0_15px_rgba(249,115,22,0.3)] flex items-center justify-center hover:scale-110 transition-transform duration-300">
                       <Zap className="w-6 h-6 md:w-8 md:h-8 text-orange-400" />
                    </div>
                    <span className="text-[10px] md:text-xs font-bold text-orange-200 tracking-wider bg-black/40 px-2 py-0.5 rounded-full border border-white/5">COPILOT</span>
                 </div>
                 
                 {/* Monitor 4: Claude */}
                 <div className="flex flex-col items-center gap-2 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                    <div className="w-16 h-12 md:w-24 md:h-16 bg-slate-900/90 backdrop-blur border border-green-500/30 rounded-lg shadow-[0_0_15px_rgba(34,197,94,0.3)] flex items-center justify-center hover:scale-110 transition-transform duration-300">
                       <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-green-400" />
                    </div>
                    <span className="text-[10px] md:text-xs font-bold text-green-200 tracking-wider bg-black/40 px-2 py-0.5 rounded-full border border-white/5">CLAUDE</span>
                 </div>

                 {/* Monitor 5: Codex */}
                 <div className="flex flex-col items-center gap-2 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                    <div className="w-16 h-12 md:w-24 md:h-16 bg-slate-900/90 backdrop-blur border border-cyan-500/30 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center justify-center hover:scale-110 transition-transform duration-300">
                       <Terminal className="w-6 h-6 md:w-8 md:h-8 text-cyan-400" />
                    </div>
                    <span className="text-[10px] md:text-xs font-bold text-cyan-200 tracking-wider bg-black/40 px-2 py-0.5 rounded-full border border-white/5">CODEX</span>
                 </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6 drop-shadow-2xl">
                Unified Agile Intelligence
            </h1>
            
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl font-light leading-relaxed">
                Turn your multi-monitor chaos into a coordinated AI workforce.
                <br className="hidden md:block" />
                One context to rule them all.
            </p>

        </div>
      </div>

      {/* Advanced Cognitive Architecture Explanation */}
      <div className="bg-surface/30 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden group hover:border-indigo-500/30 transition-all duration-500">
        <div className="absolute top-0 right-0 p-24 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
          <Cpu className="w-96 h-96 text-indigo-500" />
        </div>
        
        <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium">
              <Cpu className="w-4 h-4" />
              <span>The Core Engine</span>
            </div>
            <h3 className="text-3xl font-bold text-white">Advanced Cognitive Architecture</h3>
            <p className="text-slate-300 leading-relaxed text-lg">
              We don't just generate text; we generate <strong>behavior protocols</strong>. 
              By enforcing constraints and explicit "Thinking Processes," 
              we prevent hallucinations and ensure your AI acts like a Senior Engineer.
            </p>
            
            <div className="grid gap-4">
               {['Defined Roles', 'Mandatory Chain of Thought', 'Strict Protocol Enforcement'].map((item, i) => (
                 <div key={i} className="flex items-center gap-3 text-slate-300">
                   <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center">
                     <Check className="w-3 h-3 text-green-400" />
                   </div>
                   <span>{item}</span>
                 </div>
               ))}
            </div>

            {/* Strategy Comparison Block */}
            <div className="bg-blue-950/30 border border-blue-500/20 rounded-2xl p-6 mt-6 relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent pointer-events-none" />
               <h4 className="text-blue-200 font-bold flex items-center gap-2 mb-4 relative z-10">
                  <Braces className="w-5 h-5 text-blue-400" />
                  Format Strategy: XML vs. Markdown vs. JSON
               </h4>
               <div className="space-y-4 text-sm text-slate-300 relative z-10">
                  <div className="flex gap-4 items-start">
                    <div className="w-1 h-12 bg-green-500/40 rounded-full shrink-0 mt-1" />
                    <div>
                       <strong className="text-green-300 block mb-1">Use Strict XML (Agents / Claude)</strong>
                       <p className="text-xs text-slate-400">Best for complex, multi-role agent systems. Tags like <code className="text-green-400">&lt;role&gt;</code> create hard cognitive boundaries, preventing "role bleeding".</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                     <div className="w-1 h-12 bg-blue-500/50 rounded-full shrink-0 mt-1" />
                     <div>
                        <strong className="text-blue-300 block mb-1">Use Markdown (Copilot / GPT)</strong>
                        <p className="text-xs text-slate-400">Best for general assistants and Cursor. It's more token-efficient and readable for humans, but boundaries are "softer".</p>
                     </div>
                  </div>
                  <div className="flex gap-4 items-start">
                     <div className="w-1 h-12 bg-yellow-500/50 rounded-full shrink-0 mt-1" />
                     <div>
                        <strong className="text-yellow-300 block mb-1">Use JSON (API / Automation)</strong>
                        <p className="text-xs text-slate-400">Best for programmatic ingestion or strict schema enforcement. Useful when rules need to be parsed by other tools.</p>
                     </div>
                  </div>
               </div>
            </div>

          </div>

          <div className="bg-[#0f1117] border border-slate-700/50 rounded-xl p-6 font-mono text-xs text-slate-400 shadow-inner overflow-hidden relative">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
             <div className="flex gap-1.5 mb-4 opacity-50">
               <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />
               <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />
               <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />
             </div>
             
             {/* XML PREVIEW */}
             <div className="mb-6">
                <div className="text-[10px] text-green-500 font-bold mb-1 opacity-70">OPTION A: STRICT XML</div>
                <div className="space-y-1 pl-2 border-l border-green-500/20">
                    <div className="text-purple-400">&lt;role name="@Architect"&gt;</div>
                    <div className="pl-4 text-blue-400">&lt;trigger&gt;<span className="text-slate-300">folder_structure</span>&lt;/trigger&gt;</div>
                    <div className="pl-4 text-yellow-400">&lt;workflow&gt;</div>
                    <div className="pl-8 text-slate-300">1. Analyze root...</div>
                    <div className="pl-4 text-yellow-400">&lt;/workflow&gt;</div>
                    <div className="text-purple-400">&lt;/role&gt;</div>
                </div>
             </div>

             {/* MD PREVIEW */}
             <div className="mb-6">
                <div className="text-[10px] text-blue-500 font-bold mb-1 opacity-70">OPTION B: CLEAN MARKDOWN</div>
                <div className="space-y-1 pl-2 border-l border-blue-500/20">
                    <div className="text-blue-300 font-bold">## Role: @Architect</div>
                    <div className="text-slate-400 italic">Trigger: folder_structure</div>
                    <div className="text-slate-300 font-bold mt-1">Workflow:</div>
                    <div className="pl-2 text-slate-400">- 1. Analyze root...</div>
                </div>
             </div>

             {/* JSON PREVIEW */}
             <div>
                <div className="text-[10px] text-yellow-500 font-bold mb-1 opacity-70">OPTION C: STRICT JSON</div>
                <div className="space-y-1 pl-2 border-l border-yellow-500/20">
                    <div className="text-yellow-300">{`{`}</div>
                    <div className="pl-4 text-blue-300">"role": "Architect",</div>
                    <div className="pl-4 text-blue-300">"trigger": "folder_structure",</div>
                    <div className="pl-4 text-blue-300">"workflow": [</div>
                    <div className="pl-8 text-slate-300">"Analyze root..."</div>
                    <div className="pl-4 text-blue-300">]</div>
                    <div className="text-yellow-300">{`}`}</div>
                </div>
             </div>

          </div>
        </div>
      </div>

      {/* Deployment & Execution Protocol Guide (Replaces old Strategy Grid) */}
      <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-[#0B1120]">
        {/* Background Image (Simulating Nano Banana / Abstract AI) */}
        <div className="absolute inset-0">
            <img 
                src="https://images.unsplash.com/photo-1676299000036-96f63163370b?q=80&w=2000&auto=format&fit=crop" 
                alt="Abstract Generative AI Background" 
                className="w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B1120] via-[#0B1120]/90 to-transparent" />
        </div>

        <div className="relative z-10 p-8 md:p-12">
            <h3 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <Command className="w-8 h-8 text-primary" />
              The UniGen Workflow: From Generation to Execution
            </h3>
            <p className="text-slate-300 text-lg mb-12 max-w-3xl leading-relaxed">
              Generating the files is just step one. Here is how to <strong>orchestrate</strong> your new AI team. 
              Follow this protocol to ensure your IDEs utilize the full cognitive depth of the configuration.
            </p>

            <div className="grid gap-12">
                
                {/* Step 1: Context Injection */}
                <div className="relative pl-8 border-l-2 border-slate-700">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                    <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                       <FolderTree className="w-5 h-5 text-blue-400" />
                       Step 1: Injection (Where to put files)
                    </h4>
                    <div className="grid md:grid-cols-3 gap-4">
                       <div className="bg-slate-900/80 border border-white/10 p-4 rounded-xl">
                          <div className="text-xs font-bold text-slate-500 uppercase mb-1">Project Root</div>
                          <div className="text-white font-mono text-sm mb-2 flex items-center gap-2"><FileCode className="w-4 h-4 text-blue-400"/> .cursorrules</div>
                          <p className="text-xs text-slate-400">Directs Cursor's Autopilot. Place this in the main folder of your repo.</p>
                       </div>
                       <div className="bg-slate-900/80 border border-white/10 p-4 rounded-xl">
                          <div className="text-xs font-bold text-slate-500 uppercase mb-1">Project Root</div>
                          <div className="text-white font-mono text-sm mb-2 flex items-center gap-2"><Cpu className="w-4 h-4 text-purple-400"/> agents.md</div>
                          <p className="text-xs text-slate-400">The Brain. Place in root. Indexed by Composer/Windsurf for deep reasoning.</p>
                       </div>
                       <div className="bg-slate-900/80 border border-white/10 p-4 rounded-xl">
                          <div className="text-xs font-bold text-slate-500 uppercase mb-1">.github/ Folder</div>
                          <div className="text-white font-mono text-sm mb-2 flex items-center gap-2"><Sparkles className="w-4 h-4 text-orange-400"/> copilot-instructions.md</div>
                          <p className="text-xs text-slate-400">Directs GitHub Copilot. Create a .github folder if missing.</p>
                       </div>
                    </div>
                </div>

                {/* Step 2: Activation Loop */}
                <div className="relative pl-8 border-l-2 border-slate-700">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                    <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                       <MessageSquarePlus className="w-5 h-5 text-green-400" />
                       Step 2: The Active Loop (How to Interact)
                    </h4>
                    <p className="text-slate-300 text-sm mb-6">
                       Don't just "chat". Use the <strong>Roles</strong> you generated to trigger specific behaviors.
                    </p>
                    
                    <div className="space-y-4">
                       {/* Interaction Example 1 */}
                       <div className="bg-slate-900/80 border border-white/10 rounded-xl p-4 flex flex-col md:flex-row gap-6 items-start md:items-center group hover:border-green-500/30 transition-colors">
                          <div className="shrink-0">
                             <div className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-xs font-bold border border-purple-500/30">PLANNING PHASE</div>
                          </div>
                          <div className="flex-1">
                             <p className="text-sm text-slate-300 mb-2">When starting a new feature, don't code yet. Summon the Architect.</p>
                             <div className="bg-black/40 rounded-lg p-2 font-mono text-xs text-green-400 flex items-center gap-2">
                                <span className="text-slate-500">$</span> @Architect Analyze the current auth flow and propose a schema for 2FA.
                             </div>
                          </div>
                          <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-green-400 transition-colors hidden md:block" />
                       </div>

                       {/* Interaction Example 2 */}
                       <div className="bg-slate-900/80 border border-white/10 rounded-xl p-4 flex flex-col md:flex-row gap-6 items-start md:items-center group hover:border-blue-500/30 transition-colors">
                          <div className="shrink-0">
                             <div className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-bold border border-blue-500/30">CODING PHASE</div>
                          </div>
                          <div className="flex-1">
                             <p className="text-sm text-slate-300 mb-2">Now build it. The <code className="text-white">.cursorrules</code> file ensures no lint errors occur.</p>
                             <div className="bg-black/40 rounded-lg p-2 font-mono text-xs text-blue-400 flex items-center gap-2">
                                <span className="text-slate-500">$</span> @Developer Implement the 2FA schema proposed by the Architect.
                             </div>
                          </div>
                          <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-blue-400 transition-colors hidden md:block" />
                       </div>

                       {/* Interaction Example 3 */}
                       <div className="bg-slate-900/80 border border-white/10 rounded-xl p-4 flex flex-col md:flex-row gap-6 items-start md:items-center group hover:border-red-500/30 transition-colors">
                          <div className="shrink-0">
                             <div className="bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-xs font-bold border border-red-500/30">QUALITY PHASE</div>
                          </div>
                          <div className="flex-1">
                             <p className="text-sm text-slate-300 mb-2">Before committing, ensure strict TDD compliance.</p>
                             <div className="bg-black/40 rounded-lg p-2 font-mono text-xs text-red-400 flex items-center gap-2">
                                <span className="text-slate-500">$</span> @QA Generate Jest tests for the new 2FA service.
                             </div>
                          </div>
                          <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-red-400 transition-colors hidden md:block" />
                       </div>
                    </div>
                </div>

            </div>
        </div>
      </div>

      {/* Interactive Role Explorer */}
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Menu */}
        <div className="lg:col-span-4">
          <div className="bg-surface/20 backdrop-blur-md border border-white/5 rounded-2xl p-4 sticky top-24">
             <h3 className="text-lg font-bold text-white mb-4 px-2 flex items-center gap-2">
               <UserCircle className="w-5 h-5 text-primary" />
               Select Role
             </h3>
             <div className="space-y-1">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setActiveExample(role.id as AgentRole)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left text-sm font-medium ${
                    activeExample === role.id
                      ? `${role.bg} ${role.color} ring-1 ring-inset ring-${role.color.split('-')[1]}-500/30`
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <role.icon className="w-4 h-4" />
                  {role.label}
                </button>
              ))}
             </div>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-8">
          <div className="bg-surface/30 backdrop-blur-xl border border-white/10 rounded-3xl p-8 min-h-[500px] flex flex-col relative overflow-hidden">
             {/* Decorative background based on active role */}
             <div className={`absolute top-0 right-0 w-96 h-96 blur-[150px] opacity-20 pointer-events-none rounded-full transition-colors duration-700 ${roles.find(r => r.id === activeExample)?.glow}`} />

             <div className="relative z-10 space-y-8">
                <div>
                  <h3 className={`text-4xl font-bold mb-3 ${roles.find(r => r.id === activeExample)?.color}`}>
                    {activeRoleData.title}
                  </h3>
                  <p className="text-lg text-slate-300">{activeRoleData.desc}</p>
                </div>

                <div className="space-y-6">
                   <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Input Prompt</label>
                     <div className="bg-black/20 border border-white/10 rounded-xl p-4 text-green-400 font-mono text-sm shadow-inner">
                       {activeRoleData.prompt}
                     </div>
                   </div>

                   <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">AI Response</label>
                     <div className="bg-[#0f1117] border border-slate-700/50 rounded-xl p-4 text-slate-300 font-mono text-xs whitespace-pre-wrap shadow-2xl leading-relaxed">
                       {activeRoleData.output}
                     </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default GuideSection;