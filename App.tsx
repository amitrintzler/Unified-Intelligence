import React, { useState } from 'react';
import Header from './components/Header';
import GuideSection from './components/GuideSection';
import Generator from './components/Generator';
import References from './components/References';
import { Linkedin } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'guide' | 'generator' | 'references'>('guide');

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-200 font-sans selection:bg-primary/30 flex flex-col relative overflow-x-hidden">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px]" />
      </div>

      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-grow relative z-10">
        {activeTab === 'guide' && (
          <div className="animate-fade-in">
            <GuideSection />
            {/* CTA */}
            <div className="text-center pb-24 pt-12">
              <button 
                onClick={() => setActiveTab('generator')}
                className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-md bg-primary px-8 font-medium text-white transition-all duration-300 hover:bg-blue-600 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-slate-900 shadow-lg shadow-blue-500/25"
              >
                <span className="mr-2 relative z-10">Start Generating Rules</span>
                <div className="absolute inset-0 -z-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              </button>
            </div>
          </div>
        )}
        
        {activeTab === 'generator' && (
          <div className="animate-fade-in py-8">
            <Generator />
          </div>
        )}

        {activeTab === 'references' && (
          <div className="animate-fade-in">
             <References />
          </div>
        )}
      </main>

      <footer className="border-t border-slate-800/50 bg-[#0B1120]/80 backdrop-blur-xl py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <p className="font-bold text-lg text-white tracking-tight">UniGen</p>
            <p className="text-slate-500 text-sm mt-1">Master the AI IDE workflow.</p>
          </div>
          
          <div className="flex items-center gap-6">
            <a 
              href="https://www.linkedin.com/in/amit-rintzler-94444535" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
            >
              <Linkedin className="w-5 h-5 group-hover:text-[#0A66C2] transition-colors" />
              <span className="text-sm font-medium">Created by Amit Rintzler</span>
            </a>
          </div>

          <div className="text-slate-600 text-xs">
             © {new Date().getFullYear()} All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;