import React from 'react';
import { Bot, Sparkles, BookOpen, Github } from 'lucide-react';

interface HeaderProps {
  activeTab: 'guide' | 'generator' | 'references';
  setActiveTab: (tab: 'guide' | 'generator' | 'references') => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  return (
    <header className="sticky top-4 z-50 max-w-5xl mx-auto w-full px-4">
      <div className="bg-surface/70 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/20 p-2 flex items-center justify-between pl-6 transition-all hover:border-white/20">
        
        <div className="flex items-center gap-2.5 cursor-default select-none">
          <div className="relative group">
            <div className="absolute inset-0 bg-primary blur-md opacity-40 rounded-full group-hover:opacity-60 transition-opacity"></div>
            <Bot className="w-6 h-6 text-white relative z-10" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            AgentRules<span className="text-primary">.ai</span>
          </span>
        </div>

        <div className="flex gap-1 bg-slate-800/50 p-1 rounded-xl border border-white/5 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap ${
              activeTab === 'guide'
                ? 'bg-white/10 text-white shadow-inner shadow-white/5'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Guide
          </button>
          <button
            onClick={() => setActiveTab('generator')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap ${
              activeTab === 'generator'
                ? 'bg-primary text-white shadow-lg shadow-primary/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Generator
          </button>
          <button
            onClick={() => setActiveTab('references')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap ${
              activeTab === 'references'
                ? 'bg-purple-500/20 text-purple-200 border border-purple-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Github className="w-4 h-4" />
            References
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;