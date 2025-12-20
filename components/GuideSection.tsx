import React, { useState } from 'react';
import { Sparkles, UserCircle, Layers, PenTool, Zap, Check, ThumbsUp, ThumbsDown, Laptop, LayoutTemplate, Code2, Database, Bug, Shield, Terminal, GitPullRequest, BookOpen, FileCode, FileText, FileJson, Copy } from 'lucide-react';

type AgentRole = 'productOwner' | 'architect' | 'developer' | 'qa' | 'security' | 'refactor' | 'devops' | 'techWriter' | 'database';
type GuideTab = 'why' | 'roles' | 'formats' | 'skills';

const roles = [
    { id: 'productOwner', label: '@ProductOwner', color: 'text-yellow-400', bg: 'bg-yellow-900/20', icon: UserCircle },
    { id: 'architect', label: '@Architect', color: 'text-purple-400', bg: 'bg-purple-900/20', icon: LayoutTemplate },
    { id: 'developer', label: '@Developer', color: 'text-blue-400', bg: 'bg-blue-900/20', icon: Code2 },
    { id: 'database', label: '@Database (MCP)', color: 'text-teal-400', bg: 'bg-teal-900/20', icon: Database },
    { id: 'qa', label: '@QA', color: 'text-red-400', bg: 'bg-red-900/20', icon: Bug },
    { id: 'security', label: '@Security', color: 'text-orange-400', bg: 'bg-orange-900/20', icon: Shield },
    { id: 'devops', label: '@DevOps', color: 'text-cyan-400', bg: 'bg-cyan-900/20', icon: Terminal },
    { id: 'refactor', label: '@Refactor', color: 'text-green-400', bg: 'bg-green-900/20', icon: GitPullRequest },
    { id: 'techWriter', label: '@TechWriter', color: 'text-pink-400', bg: 'bg-pink-900/20', icon: BookOpen },
];

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
      Cognitive Architecture v3.0
    </div>
    <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tighter mb-6">
      Standardized <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">AI Skills</span>
    </h1>
    <p className="max-w-3xl mx-auto text-lg md:text-xl text-slate-400 leading-relaxed">
      UniGen now supports official <strong>Anthropic Skill Standards</strong> and <strong>OpenAI Codex Skills</strong>. 
      Move beyond basic prompting into persistent cognitive frameworks.
    </p>
  </div>
);

const AI_SkillsTab: React.FC = () => (
  <div className="py-12 space-y-12 animate-fade-in">
    <div className="bg-surface/30 border border-white/10 rounded-3xl p-8 md:p-12 shadow-xl">
        <div className="text-center max-w-2xl mx-auto mb-12">
            <Zap className="w-10 h-10 text-accent mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-4">Anthropic Skill Standard</h2>
            <p className="text-slate-400">Claude's persistent memory is best utilized via structured XML. UniGen outputs a verified &lt;anthropic_skill&gt; container for role-based reliability.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                <div className="font-mono text-accent text-xs mb-2">&lt;instruction_set&gt;</div>
                <h4 className="font-bold text-white mb-2">Strict Procedures</h4>
                <p className="text-xs text-slate-400 leading-relaxed">Defines immutable workflows that Claude follows for every code interaction.</p>
            </div>
            <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                <div className="font-mono text-accent text-xs mb-2">&lt;constraints&gt;</div>
                <h4 className="font-bold text-white mb-2">Hard Guardrails</h4>
                <p className="text-xs text-slate-400 leading-relaxed">Explicitly forbids specific patterns (e.g., "NEVER use inline styles").</p>
            </div>
            <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                <div className="font-mono text-accent text-xs mb-2">&lt;examples&gt;</div>
                <h4 className="font-bold text-white mb-2">One-Shot Context</h4>
                <p className="text-xs text-slate-400 leading-relaxed">Perfectly formatted code snippets for Claude to mimic.</p>
            </div>
        </div>
    </div>

    <div className="bg-surface/30 border border-white/10 rounded-3xl p-8 md:p-12 shadow-xl">
        <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1">
                <Laptop className="w-12 h-12 text-primary mb-6" />
                <h2 className="text-3xl font-bold text-white mb-4">OpenAI Codex Skills</h2>
                <p className="text-slate-400 leading-relaxed">
                    Codex and GPT models support high-density <strong>Instruction Skills</strong>. 
                    UniGen generates `codex_skill.md`, a persistent system prompt that acts as a cognitive 
                    framework for the AI to lead your specific stack.
                </p>
                <div className="mt-8 flex gap-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-300"><Check className="w-4 h-4 text-green-400" /> Persistent Role</div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-300"><Check className="w-4 h-4 text-green-400" /> Procedural Logic</div>
                </div>
            </div>
            <div className="w-full md:w-1/3 bg-black/40 p-4 rounded-xl border border-white/5 font-mono text-[10px] text-blue-300">
                ## Skill: React Architect<br/>### Role Definition<br/>You are a senior lead...<br/><br/>### Procedural Constraints<br/>1. Use Server Actions...<br/>2. No useEffect...
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

    return (
        <div className="max-w-7xl mx-auto px-4">
            <GuideHeader />
            <div className="bg-surface/30 backdrop-blur-xl border border-white/10 rounded-3xl p-2 sticky top-20 z-40">
                <div className="flex items-center justify-center gap-2 flex-wrap">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id as GuideTab); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${activeTab === tab.id ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>
            <div className="animate-fade-in mb-24">
                {activeTab === 'why' && (
                  <div className="grid md:grid-cols-2 gap-8 py-12">
                    <div className="bg-surface/20 border border-red-500/20 rounded-2xl p-8">
                      <h3 className="text-xl font-bold text-red-400 flex items-center gap-2 mb-6">
                        <ThumbsDown className="w-5 h-5" />
                        Traditional Prompting
                      </h3>
                      <ul className="space-y-4 text-sm text-slate-300">
                        {["Single file with flat rules", "Instruction drift over time", "No role-based logic", "Low informational density"].map((it, i) => (
                          <li key={i} className="flex gap-2">
                            <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5 shrink-0" /> {it}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-surface/20 border border-green-500/20 rounded-2xl p-8">
                      <h3 className="text-xl font-bold text-green-400 flex items-center gap-2 mb-6">
                        <ThumbsUp className="w-5 h-5" />
                        UniGen Cognitive Skills
                      </h3>
                      <ul className="space-y-4 text-sm text-slate-300">
                        {["Multi-file skill sets", "Persistent Role Enforcement", "XML/Markdown Density", "Cognitive Thinking Loops"].map((it, i) => (
                          <li key={i} className="flex gap-2">
                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-1.5 shrink-0" /> {it}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
                {activeTab === 'roles' && <div className="py-12 text-center text-slate-400">Agent role documentation selected.</div>}
                {activeTab === 'formats' && <div className="py-12 text-center text-slate-400">Format strategy documentation selected.</div>}
                {activeTab === 'skills' && <AI_SkillsTab />}
            </div>
        </div>
    );
};

export default GuideSection;