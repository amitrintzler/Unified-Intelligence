import React from 'react';
import { Github, Star, ThumbsUp, ThumbsDown, ArrowUpRight, ShieldCheck, ExternalLink, GitPullRequest } from 'lucide-react';

const References: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-12 animate-fade-in">
       
       {/* Hero for Repo */}
       <div className="bg-surface/30 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="flex items-start justify-between flex-col md:flex-row gap-8 relative z-10">
             <div className="flex-1">
                <div className="flex items-center gap-3 mb-6">
                   <div className="p-3 bg-white/10 rounded-xl">
                      <Github className="w-8 h-8 text-white" />
                   </div>
                   <h2 className="text-3xl font-bold text-white">Awesome Cursor Rules</h2>
                </div>
                <p className="text-slate-300 text-lg mb-8 max-w-2xl leading-relaxed">
                   The industry-standard collection for community-driven `.cursorrules` files. 
                   Hosted by <strong>PatrickJS</strong>, this repository aggregates thousands of specific 
                   configuration files for every framework imaginable.
                </p>
                <div className="flex flex-wrap gap-4">
                    <a 
                      href="https://github.com/PatrickJS/awesome-cursorrules" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors shadow-lg shadow-white/10"
                    >
                      Open Repository <ArrowUpRight className="w-4 h-4" />
                    </a>
                    <a 
                      href="https://cursor.directory" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-slate-800 text-white px-6 py-3 rounded-xl font-bold border border-white/10 hover:bg-slate-700 transition-colors"
                    >
                      Cursor Directory <ExternalLink className="w-4 h-4" />
                    </a>
                </div>
             </div>
             
             <div className="bg-slate-900/80 backdrop-blur border border-white/10 p-6 rounded-2xl max-w-xs shadow-xl">
                <div className="flex items-center gap-2 text-yellow-400 mb-3 font-mono text-sm font-bold uppercase tracking-wider">
                   <Star className="w-4 h-4 fill-yellow-400" />
                   Community Gold Standard
                </div>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">
                   "This repo is the Wikipedia of AI Context. If you use a niche library, someone has likely written a rule for it here."
                </p>
                <div className="flex gap-2">
                    <span className="px-2 py-1 bg-white/5 rounded text-xs text-slate-500">4.5k+ Stars</span>
                    <span className="px-2 py-1 bg-white/5 rounded text-xs text-slate-500">Contributors</span>
                </div>
             </div>
          </div>
       </div>

       {/* Analysis Grid */}
       <div className="grid md:grid-cols-2 gap-8">
          
          {/* The Good */}
          <div className="bg-surface/20 border border-green-500/20 rounded-2xl p-8 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 blur-3xl rounded-full pointer-events-none" />
             <h3 className="text-xl font-bold text-green-400 flex items-center gap-2 mb-6">
                <ThumbsUp className="w-5 h-5" />
                What's Great
             </h3>
             <ul className="space-y-4">
                {[
                   "Massive variety of frameworks (Svelte, Vue, Django, Laravel, etc.)",
                   "Excellent for quick fixes (e.g., 'Always use arrow functions')",
                   "Crowdsourced knowledge fixes specific library hallucinations",
                   "Great starting point for basic syntax enforcement",
                   "Regularly updated by the community"
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

          {/* The Bad / Missing */}
          <div className="bg-surface/20 border border-red-500/20 rounded-2xl p-8 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-3xl rounded-full pointer-events-none" />
             <h3 className="text-xl font-bold text-red-400 flex items-center gap-2 mb-6">
                <ThumbsDown className="w-5 h-5" />
                What Can Be Improved
             </h3>
             <p className="text-xs text-slate-500 mb-4 italic">
               Most examples in the repo are "Flat Lists" of rules.
             </p>
             <ul className="space-y-4">
                {[
                   "Lacks 'Cognitive Architecture' (No thinking process enforcement)",
                   "Markdown lists are 'soft suggestions', not strict protocols",
                   "Missing the 'Multi-Agent' synergy (Role separation)",
                   "Often redundant or conflicting if multiple files are combined",
                   "Doesn't utilize XML-tagging for scope isolation (Role bleeding)"
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

       </div>

       {/* The Solution / Bridge */}
       <div className="bg-gradient-to-br from-blue-900/20 to-slate-900/50 border border-blue-500/20 rounded-2xl p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/20 text-blue-400 mb-6 ring-1 ring-blue-500/40 shadow-lg shadow-blue-500/20">
                <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">The UniGen Difference</h3>
            <p className="text-slate-300 max-w-3xl mx-auto leading-relaxed text-lg">
                Repositories like <em>awesome-cursorrules</em> are excellent dictionaries for <strong>Syntax</strong>. 
                <br className="hidden md:block" />
                We focus on <strong>Cognition</strong>. We take those syntax rules and wrap them in 
                Enterprise-grade XML architectures that force the AI to <em>Think</em>, <em>Plan</em>, and <em>Act</em> like a Senior Engineer.
            </p>
          </div>
       </div>

       {/* Contribution Section */}
       <div className="border-t border-slate-700/50 pt-12">
          <div className="bg-slate-900/50 rounded-2xl p-8 flex flex-col items-center text-center border border-white/5">
            <div className="p-3 bg-white/5 rounded-full mb-4 text-slate-400">
               <GitPullRequest className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Have a Reference to Add?</h3>
            <p className="text-slate-400 mb-6 max-w-lg">
               If you know of other high-quality configuration repositories or new AI tool references, 
               please submit a Pull Request to our project repository.
            </p>
            <a 
               href="https://github.com/amitrintzler/Unified-Intelligence" 
               target="_blank" 
               rel="noopener noreferrer"
               className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-bold transition-colors border border-white/10"
            >
               <Github className="w-4 h-4" />
               Contribute to Unified-Intelligence
            </a>
          </div>
       </div>

    </div>
  );
};

export default References;