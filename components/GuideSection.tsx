import React, { useState } from 'react';
import { BrainCircuit, Layers, LayoutTemplate, Bug, GitPullRequest, Shield, UserCircle, Code2, Terminal, BookOpen, Database, Zap, Cpu, Check, FileCode, Braces, Sparkles, FolderTree, MessageSquarePlus, Command, ArrowRight, FileText, FileJson, Copy, PenTool, ThumbsUp, ThumbsDown, Laptop } from 'lucide-react';

// --- Types ---
type AgentRole = 'productOwner' | 'architect' | 'developer' | 'qa' | 'security' | 'refactor' | 'devops' | 'techWriter' | 'database';
type GuideTab = 'why' | 'roles' | 'formats' | 'skills';

// --- Data ---
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
  
  // Using React Hook Form + shadcn/ui
  import { useForm } from 'react-hook-form';
  import { zodResolver } from '@hookform/resolvers/zod';
  import * as z from 'zod';
  
  const formSchema = z.object({
    email: z.string().email(),
  });
  
  // ... rest of component
</code_implementation>`
    },
    database: {
        title: "Database Interaction (MCP)",
        desc: "Manages all database schema, queries, and migrations. Uses Model Context Protocol (MCP) for tool interaction.",
        prompt: "@Database (postgres-mcp) Generate a migration to add a 'password_reset_token' to the 'users' table.",
        output: `<tool_call>
    <tool_name>postgres-mcp</tool_name>
    <parameters>
        <action>generate_migration</action>
        <migration_name>add_reset_token_to_users</migration_name>
        <sql>
            ALTER TABLE "users" ADD COLUMN "password_reset_token" TEXT;
            ALTER TABLE "users" ADD COLUMN "reset_token_expires_at" TIMESTAMPTZ;
        </sql>
    </parameters>
</tool_call>`
    },
    qa: {
        title: "Testing & Quality Assurance",
        desc: "Ensures correctness by generating unit tests, integration tests, and end-to-end tests based on the Product Owner's criteria.",
        prompt: "@QA Write a Playwright test for the password reset flow.",
        output: `<test_plan>
  <thinking>
    1. Need to mock the email service to capture the reset link.
    2. Test happy path and error states (expired token, invalid email).
  </thinking>
  
  // tests/e2e/password-reset.spec.ts
  test('should allow a user to reset their password', async ({ page }) => {
    await page.goto('/auth/reset-password');
    await page.fill('input[name="email"]', 'user@example.com');
    await page.click('button[type="submit"]');
    // ... Mock email service, get link, visit link, set new password
  });
</test_plan>`
    },
    security: {
        title: "Security Audits & Hardening",
        desc: "Proactively identifies and mitigates security vulnerabilities, such as OWASP Top 10 risks.",
        prompt: "@Security Audit the password reset feature for vulnerabilities.",
        output: `<security_audit>
  <vulnerability>
    <type>CWE-613: Insufficient Session Expiration</type>
    <finding>Reset token must be single-use. After a successful password change, the token must be invalidated immediately to prevent reuse.</finding>
    <recommendation>In the database logic, set the 'password_reset_token' to NULL after successful use.</recommendation>
  </vulnerability>
</security_audit>`
    },
    devops: {
        title: "CI/CD & Infrastructure",
        desc: "Automates the deployment pipeline, manages infrastructure as code, and sets up monitoring and alerts.",
        prompt: "@DevOps Add a GitHub Actions step to run the Playwright tests.",
        output: `<ci_cd_config>
  # .github/workflows/ci.yml
  - name: Run Playwright tests
    run: npx playwright test
  - uses: actions/upload-artifact@v4
    if: always()
    with:
      name: playwright-report
      path: playwright-report/
      retention-days: 15
</ci_cd_config>`
    },
    refactor: {
        title: "Code Quality & Cleanup",
        desc: "A specialized agent that analyzes code for smells, complexity, and violations of DRY principles, then suggests improvements.",
        prompt: "@Refactor Analyze the token generation logic in '/lib/auth/tokens.ts'.",
        output: `<refactor_suggestion>
  <analysis>
    The token generation uses 'Math.random()', which is not cryptographically secure for this purpose.
  </analysis>
  <recommendation>
    Replace 'Math.random()' with 'crypto.randomBytes()' from Node.js 'crypto' module to generate a secure, unpredictable token.
  </recommendation>
</refactor_suggestion>`
    },
    techWriter: {
        title: "Documentation",
        desc: "Generates user-facing guides and internal developer documentation based on the implemented code and features.",
        prompt: "@TechWriter Document the password reset API endpoint.",
        output: `<documentation>
  ### POST /api/auth/request-reset

  Initiates the password reset process for a user.

  **Body:**
  - \`email\` (string, required): The user's email address.

  **Returns:**
  - \`200 OK\`: If an account with that email exists.
  - \`404 Not Found\`: If no account is found.
</documentation>`
    },
};

// --- Sub-Components ---

const CodeBlock: React.FC<{ content: string }> = ({ content }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <div className="bg-[#0f1117] rounded-xl border border-white/10 relative group">
            <button
                onClick={handleCopy}
                className="absolute top-2 right-2 p-1.5 bg-slate-800/50 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-all opacity-0 group-hover:opacity-100"
            >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <pre className="p-4 text-sm font-mono text-slate-300 overflow-x-auto scrollbar-thin">
                <code>{content}</code>
            </pre>
        </div>
    );
};

const GuideHeader: React.FC = () => (
  <div className="text-center pt-24 pb-16">
    <div className="inline-block bg-primary/10 text-primary font-bold text-sm px-4 py-2 rounded-full mb-4">
      Official "AI Skill" Standards
    </div>
    <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tighter mb-6">
      From <span className="text-slate-400">Prompts</span> to <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Instruction Skills</span>
    </h1>
    <p className="max-w-3xl mx-auto text-lg md:text-xl text-slate-400 leading-relaxed">
      UniGen now supports the official **Anthropic Skill Standard** and persistent **OpenAI Codex Skills**. Transform temporary context into permanent, reusable AI capabilities.
    </p>
  </div>
);

// --- Main Tabs ---

const WhyUniGenTab: React.FC = () => (
  <div className="grid md:grid-cols-2 gap-8 py-12">
    <div className="bg-surface/20 border border-red-500/20 rounded-2xl p-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-3xl rounded-full pointer-events-none" />
      <h3 className="text-xl font-bold text-red-400 flex items-center gap-2 mb-6">
        <ThumbsDown className="w-5 h-5" />
        The Old Way: Basic Context
      </h3>
      <ul className="space-y-4">
        {[
          "Single file with a flat list of rules",
          "AI often ignores or misinterprets instructions",
          "No separation of concerns; architectural and style rules are mixed",
          "Lacks a 'thinking' process, leading to shallow, literal code generation",
          "Not easily maintainable for large, complex projects"
        ].map((item, i) => (
          <li key={i} className="flex gap-3 text-slate-300 text-sm leading-relaxed">
            <div className="w-5 h-5 rounded-full bg-red-500/10 flex items-center justify-center shrink-0 mt-0.5">
              <div className="w-1.5 h-1.5 bg-red-400 rounded-full" />
            </div>
            {item}
          </li>
        ))}
      </ul>
    </div>
    <div className="bg-surface/20 border border-green-500/20 rounded-2xl p-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 blur-3xl rounded-full pointer-events-none" />
      <h3 className="text-xl font-bold text-green-400 flex items-center gap-2 mb-6">
        <ThumbsUp className="w-5 h-5" />
        The UniGen Way: Cognitive Architecture
      </h3>
      <ul className="space-y-4">
        {[
          "Multi-file output for different platforms (Cursor, Copilot, Agents)",
          "Defines distinct Agent Roles (@Architect, @QA) for specialized tasks",
          "Enforces a 'Chain of Thought' or '<thinking>' block before action",
          "Uses strict formats (XML/JSON) for robust, machine-readable instructions",
          "Generates a maintainable, structured system that scales with your project"
        ].map((item, i) => (
          <li key={i} className="flex gap-3 text-slate-300 text-sm leading-relaxed">
            <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center shrink-0 mt-0.5">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
            </div>
            {item}
          </li>
        ))}
      </ul>
    </div>
  </div>
);

const AgentRolesTab: React.FC = () => {
    const [activeRole, setActiveRole] = useState<AgentRole>('productOwner');
    const activeContent = roleContent[activeRole];

    return (
        <div className="py-12">
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left: Role Selector */}
                <div className="lg:w-1/3 space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Select a Role</p>
                    {roles.map(role => {
                        const Icon = role.icon;
                        return (
                            <button
                                key={role.id}
                                onClick={() => setActiveRole(role.id as AgentRole)}
                                className={`w-full text-left flex items-center gap-4 p-3 rounded-lg border transition-all duration-200 ${activeRole === role.id ? `bg-white/5 border-primary shadow-lg shadow-primary/10` : 'border-white/10 hover:bg-white/5'}`}
                            >
                                <div className={`p-2 rounded-md ${role.bg}`}>
                                    <Icon className={`w-5 h-5 ${role.color}`} />
                                </div>
                                <div>
                                    <span className="font-bold text-white">{role.label}</span>
                                    <p className="text-xs text-slate-400">{roleContent[role.id as AgentRole].title}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
                {/* Right: Content Display */}
                <div className="lg:w-2/3 bg-surface/30 border border-white/10 rounded-2xl p-6 relative overflow-hidden animate-fade-in">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-accent/10 rounded-full blur-3xl -z-10" />
                    <h3 className="text-2xl font-bold text-white mb-2">{activeContent.title}</h3>
                    <p className="text-slate-400 mb-6">{activeContent.desc}</p>
                    <div className="space-y-4">
                        <div>
                            <h4 className="text-sm font-bold text-slate-300 mb-2">Example Prompt:</h4>
                            <CodeBlock content={activeContent.prompt} />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-slate-300 mb-2">Expected AI Output:</h4>
                            <CodeBlock content={activeContent.output} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FormatStrategyTab: React.FC = () => (
    <div className="py-12 grid md:grid-cols-3 gap-8">
        <div className="bg-surface/20 border border-white/10 p-6 rounded-2xl">
            <FileCode className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Strict XML</h3>
            <p className="text-sm text-slate-400 mb-4">Best for Anthropic Claude. XML tags like `<anthropic_skill>` create hard logical boundaries that prevent instruction drift.</p>
        </div>
        <div className="bg-surface/20 border border-white/10 p-6 rounded-2xl">
            <FileText className="w-8 h-8 text-blue-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Instruction Markdown</h3>
            <p className="text-sm text-slate-400 mb-4">Best for OpenAI Codex. High-density headers and procedural lists allow OpenAI models to maintain long-term state.</p>
        </div>
        <div className="bg-surface/20 border border-white/10 p-6 rounded-2xl">
            <FileJson className="w-8 h-8 text-green-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Strict JSON</h3>
            <p className="text-sm text-slate-400 mb-4">Best for programmatic rules that are shared between different AI Agents and CLI tools.</p>
        </div>
    </div>
);

const AI_SkillsTab: React.FC = () => (
  <div className="py-12 space-y-12">
    <div className="bg-surface/30 border border-white/10 rounded-3xl p-8 md:p-12">
        <div className="text-center max-w-2xl mx-auto mb-12">
            <Zap className="w-10 h-10 text-accent mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-4">Anthropic Skill Standard</h2>
            <p className="text-slate-400">Claude's official "Skills" feature requires structured XML. UniGen produces a compliant `<anthropic_skill>` block that ensures Claude never breaks persona.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                <div className="font-mono text-accent text-xs mb-2">&lt;anthropic_skill&gt;</div>
                <h4 className="font-bold text-white mb-2">Root Container</h4>
                <p className="text-xs text-slate-400 leading-relaxed">Wraps the entire instruction set to prevent the AI from confusing instructions with conversation history.</p>
            </div>
            <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                <div className="font-mono text-accent text-xs mb-2">&lt;instruction_set&gt;</div>
                <h4 className="font-bold text-white mb-2">Procedural Logic</h4>
                <p className="text-xs text-slate-400 leading-relaxed">Contains step-by-step workflows for how Claude should handle your specific code or architecture.</p>
            </div>
            <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                <div className="font-mono text-accent text-xs mb-2">&lt;constraints&gt;</div>
                <h4 className="font-bold text-white mb-2">Guardrails</h4>
                <p className="text-xs text-slate-400 leading-relaxed">Explicitly defines forbidden patterns (e.g., "NEVER use external libraries unless specified").</p>
            </div>
        </div>
    </div>

    <div className="bg-surface/30 border border-white/10 rounded-3xl p-8 md:p-12">
        <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1">
                <Laptop className="w-12 h-12 text-primary mb-6" />
                <h2 className="text-3xl font-bold text-white mb-4">Codex Instruction Skills</h2>
                <p className="text-slate-400 leading-relaxed">
                    OpenAI models (including Codex and GPT-5.1) now support highly complex "Instruction Skills." 
                    UniGen generates a persistent Markdown-based skill-set (`codex_skill.md`) that acts as a cognitive 
                    framework for the AI, allowing it to act as a senior lead on your specific stack.
                </p>
                <div className="mt-8 flex gap-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                        <Check className="w-4 h-4 text-green-400" /> Persistent Role
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                        <Check className="w-4 h-4 text-green-400" /> Stack Specifics
                    </div>
                </div>
            </div>
            <div className="w-full md:w-1/3 bg-black/40 p-4 rounded-xl border border-white/5 font-mono text-[10px] text-blue-300 leading-tight">
                ## Codex Skill: React Architect<br/>
                ### Role Definition<br/>
                You are a senior Lead Developer specialized in high-performance React systems...<br/><br/>
                ### Implementation Rules<br/>
                1. Always use functional components.<br/>
                2. Memoize all expensive calculations...<br/>
                3. Use strict atomic folder structure...
            </div>
        </div>
    </div>
  </div>
);


const GuideSection: React.FC = () => {
    const [activeTab, setActiveTab] = useState<GuideTab>('why');

    const tabs = [
        { id: 'why', label: 'Why UniGen?', icon: Sparkles },
        { id: 'roles', label: 'Agent Roles', icon: UserCircle },
        { id: 'formats', label: 'Format Strategy', icon: Layers },
        { id: 'skills', label: 'AI Skills (New)', icon: PenTool }
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'why': return <WhyUniGenTab />;
            case 'roles': return <AgentRolesTab />;
            case 'formats': return <FormatStrategyTab />;
            case 'skills': return <AI_SkillsTab />;
            default: return null;
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4">
            <GuideHeader />

            <div className="bg-surface/30 backdrop-blur-xl border border-white/10 rounded-3xl p-2 shadow-2xl sticky top-20 z-40">
                <div className="flex items-center justify-center gap-2 flex-wrap">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as GuideTab)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                                    activeTab === tab.id
                                        ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>
            
            <div className="animate-fade-in">
                {renderContent()}
            </div>
        </div>
    );
};

export default GuideSection;
