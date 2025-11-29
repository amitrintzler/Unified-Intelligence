import React, { useState, useRef, useEffect } from 'react';
import { IdeType, TemplateType, AnalysisResponse, GeneratedFile, AiProvider, AiConfiguration, OutputStyle } from '../types';
import { generateRulesStream, analyzeContext } from '../services/geminiService';
import { Copy, Check, Wand2, Loader2, AlertCircle, MessageSquare, ArrowRight, Code, FileCode, Sparkles, Cpu, Terminal, FileText, Cloud, Database, Server, Globe, Layers, Box, Settings2, FileType } from 'lucide-react';

const Generator: React.FC = () => {
  // State Machine
  const [step, setStep] = useState<'input' | 'analyzing' | 'questions' | 'generating' | 'done'>('input');
  
  const [ide, setIde] = useState<IdeType>(IdeType.UNIVERSAL);
  const [outputStyle, setOutputStyle] = useState<OutputStyle>(OutputStyle.XML); // Default to XML
  const [context, setContext] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  // AI Configuration State
  const [aiConfig, setAiConfig] = useState<AiConfiguration>({
    provider: AiProvider.GEMINI,
  });
  const [showAiSettings, setShowAiSettings] = useState(false);
  
  const [rawOutput, setRawOutput] = useState('');
  const [parsedFiles, setParsedFiles] = useState<GeneratedFile[]>([]);
  const [activeFileTab, setActiveFileTab] = useState<number>(0);
  
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);

  const starterTemplates = [
    {
      id: 'fullstack',
      label: 'Modern Web (Next.js)',
      desc: 'React, TS, Tailwind, Prisma',
      icon: Globe,
      color: 'text-indigo-400',
      bg: 'bg-indigo-400/10',
      value: `// Project: Enterprise SaaS Platform
// Stack: Full Stack Web
{
  "framework": "Next.js 14 (App Router)",
  "language": "TypeScript",
  "styling": "Tailwind CSS + shadcn/ui",
  "state": "Zustand + React Query",
  "backend": "Server Actions + Prisma ORM",
  "database": "PostgreSQL (Supabase)",
  "auth": "Clerk / NextAuth",
  "testing": "Jest (Unit), Playwright (E2E)",
  "deployment": "Vercel",
  "monorepo": "Turborepo"
}`
    },
    {
      id: 'python-backend',
      label: 'Python Microservices',
      desc: 'FastAPI, Docker, Postgres',
      icon: Layers,
      color: 'text-yellow-400',
      bg: 'bg-yellow-400/10',
      value: `// Project: High-Performance API Backend
// Stack: Python Microservices
{
  "framework": "FastAPI (Async)",
  "language": "Python 3.11",
  "database": "PostgreSQL + SQLAlchemy (Async) + Alembic",
  "caching": "Redis",
  "task_queue": "Celery + RabbitMQ",
  "containerization": "Docker Compose",
  "testing": "pytest + httpx + factory_boy",
  "docs": "OpenAPI (Swagger) Auto-gen",
  "linting": "Ruff + Black + MyPy"
}`
    },
    {
      id: 'aws-data',
      label: 'AWS Data Platform',
      desc: 'EMR, Spark, Airflow, S3',
      icon: Cloud,
      color: 'text-orange-400',
      bg: 'bg-orange-400/10',
      value: `// Project: TB-Scale Data Lake & ETL
// Stack: AWS Data Engineering
{
  "cloud": "AWS",
  "orchestration": "Apache Airflow (MWAA)",
  "compute": "EMR (Apache Spark 3.4) + Glue",
  "storage": "S3 (Delta Lake format)",
  "streaming": "Kinesis Data Streams",
  "infrastructure": "Terraform (IaC)",
  "language": "Python 3.10 (PySpark) + Scala",
  "testing": "pytest + Great Expectations (Data Quality)",
  "cicd": "GitHub Actions -> AWS CodeDeploy"
}`
    },
    {
      id: 'gcp-analytics',
      label: 'GCP Big Data',
      desc: 'BigQuery, Databricks, GKE',
      icon: Database,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
      value: `// Project: Real-time Analytics Warehouse
// Stack: Google Cloud Platform
{
  "warehouse": "BigQuery",
  "compute": "Databricks (Standard Cluster)",
  "container_orchestration": "GKE (Google Kubernetes Engine)",
  "ingestion": "Pub/Sub + Dataflow",
  "language": "Python (Pandas/PySpark) + SQL",
  "ml_ops": "Vertex AI",
  "tooling": "dbt (Data Build Tool) for transformations",
  "monitoring": "Cloud Monitoring + Prometheus"
}`
    },
    {
      id: 'azure-ent',
      label: 'Azure Streaming',
      desc: 'Kafka, Snowflake, AKS',
      icon: Server,
      color: 'text-cyan-400',
      bg: 'bg-cyan-400/10',
      value: `// Project: Financial Transaction Processing
// Stack: Azure Enterprise
{
  "streaming": "Apache Kafka (Confluent Cloud)",
  "database": "Snowflake (Data Cloud)",
  "compute": "AKS (Azure Kubernetes Service)",
  "functions": "Azure Functions (Serverless)",
  "language": "Java 17 (Spring Boot) + Python",
  "devops": "Azure DevOps Pipelines",
  "testing": "JUnit 5 + Testcontainers + k6 (Load Testing)",
  "security": "Azure Active Directory (Entra ID)"
}`
    },
    {
      id: 'k8s-ops',
      label: 'DevOps & Infra',
      desc: 'K8s, Terraform, ArgoCD',
      icon: Box,
      color: 'text-pink-400',
      bg: 'bg-pink-400/10',
      value: `// Project: Cloud-Native Infrastructure
// Stack: DevOps & SRE
{
  "platform": "Kubernetes (K8s)",
  "iac": "Terraform + Terragrunt",
  "gitops": "ArgoCD",
  "observability": "Grafana + Prometheus + ELK Stack",
  "service_mesh": "Istio",
  "secrets": "HashiCorp Vault",
  "ci": "Jenkins / GitLab CI",
  "scripting": "Bash + Go + Python",
  "compliance": "Checkov + OPA (Open Policy Agent)"
}`
    }
  ];

  const handleAnalyze = async () => {
    if (!context.trim()) {
      setError("Please provide some context about your project first.");
      return;
    }
    setStep('analyzing');
    setError(null);
    
    try {
      const result = await analyzeContext(context);
      setAnalysis(result);
      
      if (result.status === 'NEEDS_INFO' && result.questions && result.questions.length > 0) {
        setStep('questions');
        const initialAnswers: Record<string, string> = {};
        result.questions.forEach(q => initialAnswers[q] = '');
        setAnswers(initialAnswers);
      } else {
        handleGenerateRules(); 
      }
    } catch (err) {
      setError("Analysis failed. Please try again.");
      setStep('input');
    }
  };

  const handleGenerateRules = async () => {
    setStep('generating');
    setRawOutput('');
    setParsedFiles([]);
    setActiveFileTab(0);
    
    try {
      let accumulated = "";
      await generateRulesStream({
        ide,
        template: TemplateType.DETECT_AUTO,
        context,
        answers,
        aiConfig,
        style: outputStyle
      }, (chunk) => {
        accumulated += chunk;
        setRawOutput(accumulated);
        parseFilesFromStream(accumulated);
        
        if (outputRef.current) {
          outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
      });
      setStep('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed.");
      setStep('input');
    }
  };

  const parseFilesFromStream = (text: string) => {
    const fileRegex = /--- START OF FILE: (.*?) ---\n([\s\S]*?)(?=--- START OF FILE:|$)/g;
    const matches = [...text.matchAll(fileRegex)];
    
    if (matches.length > 0) {
      const files = matches.map(m => ({
        fileName: m[1].trim(),
        content: m[2].trim()
      }));
      setParsedFiles(files);
    } else {
      setParsedFiles([{ fileName: 'Output', content: text }]);
    }
  };

  const copyToClipboard = () => {
    const content = parsedFiles[activeFileTab]?.content || rawOutput;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Steps Indicator
  const steps = [
    { id: 'input', label: 'Context' },
    { id: 'questions', label: 'Refine' },
    { id: 'generating', label: 'Generate' }
  ];

  const currentStepIndex = steps.findIndex(s => s.id === (step === 'analyzing' ? 'input' : step === 'done' ? 'generating' : step));

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 h-[calc(100vh-140px)] min-h-[600px] flex flex-col lg:flex-row gap-6">
      
      {/* LEFT PANEL: Controls */}
      <div className="w-full lg:w-[400px] flex flex-col gap-4 shrink-0">
        
        {/* Progress Bar */}
        <div className="bg-surface/50 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex items-center justify-between px-8">
          {steps.map((s, idx) => (
            <div key={s.id} className="flex flex-col items-center gap-1 relative z-10">
              <div className={`w-3 h-3 rounded-full transition-all duration-500 border-2 ${idx <= currentStepIndex ? 'bg-primary border-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-slate-800 border-slate-600'}`} />
              <span className={`text-[10px] uppercase tracking-wider font-bold ${idx <= currentStepIndex ? 'text-white' : 'text-slate-600'}`}>{s.label}</span>
            </div>
          ))}
          {/* Connector Line */}
          <div className="absolute top-[22px] left-12 right-12 h-[2px] bg-slate-800 -z-0">
             <div 
               className="h-full bg-primary transition-all duration-500" 
               style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
             />
          </div>
        </div>

        <div className="flex-1 bg-surface/50 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col relative overflow-hidden">
           {/* Background decoration */}
           <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

           {step === 'input' || step === 'analyzing' ? (
             <div className="flex flex-col h-full animate-fade-in scrollbar-thin overflow-y-auto pr-2">
                
                {/* AI Provider Settings Toggle */}
                <div className="mb-6 bg-black/20 rounded-xl p-3 border border-white/5">
                   <button 
                     onClick={() => setShowAiSettings(!showAiSettings)}
                     className="flex items-center justify-between w-full text-xs font-bold text-slate-400 uppercase tracking-wider hover:text-white transition-colors"
                   >
                      <span className="flex items-center gap-2"><Settings2 className="w-4 h-4" /> Generation Engine</span>
                      <span className={`transition-transform duration-300 ${showAiSettings ? 'rotate-180' : ''}`}>▼</span>
                   </button>
                   
                   {showAiSettings && (
                     <div className="mt-3 space-y-3 animate-fade-in">
                        <div>
                          <label className="text-[10px] text-slate-500 block mb-1">Model Provider</label>
                          <select 
                            value={aiConfig.provider}
                            onChange={(e) => setAiConfig({...aiConfig, provider: e.target.value as AiProvider})}
                            className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-lg p-2 outline-none focus:border-primary"
                          >
                            {Object.values(AiProvider).map(p => <option key={p} value={p}>{p}</option>)}
                          </select>
                        </div>

                        {aiConfig.provider !== AiProvider.GEMINI && (
                          <div>
                             <label className="text-[10px] text-slate-500 block mb-1">API Key (Stored Locally)</label>
                             <input 
                               type="password"
                               placeholder={`Enter ${aiConfig.provider.split(' ')[0]} Key`}
                               value={aiConfig.apiKey || ''}
                               onChange={(e) => setAiConfig({...aiConfig, apiKey: e.target.value})}
                               className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-lg p-2 outline-none focus:border-primary"
                             />
                             <p className="text-[9px] text-slate-500 mt-1">
                               Using {aiConfig.provider}. Key is never stored on our servers.
                             </p>
                          </div>
                        )}

                        {aiConfig.provider === AiProvider.AZURE && (
                          <>
                            <input 
                              type="text"
                              placeholder="Endpoint (https://...)"
                              value={aiConfig.endpoint || ''}
                              onChange={(e) => setAiConfig({...aiConfig, endpoint: e.target.value})}
                              className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-lg p-2 outline-none focus:border-primary"
                            />
                            <div className="flex gap-2">
                              <input 
                                type="text"
                                placeholder="Deployment"
                                value={aiConfig.deployment || ''}
                                onChange={(e) => setAiConfig({...aiConfig, deployment: e.target.value})}
                                className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-lg p-2 outline-none focus:border-primary"
                              />
                              <input 
                                type="text"
                                placeholder="Version (2024-02-15-preview)"
                                value={aiConfig.apiVersion || ''}
                                onChange={(e) => setAiConfig({...aiConfig, apiVersion: e.target.value})}
                                className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-lg p-2 outline-none focus:border-primary"
                              />
                            </div>
                          </>
                        )}
                     </div>
                   )}
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Target Platform</label>
                    <div className="relative">
                      <select 
                        value={ide}
                        onChange={(e) => setIde(e.target.value as IdeType)}
                        className="w-full appearance-none bg-slate-900/50 border border-slate-700 text-white rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium"
                      >
                        {Object.values(IdeType).map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-3.5 pointer-events-none text-slate-400">
                        <Terminal className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Output Format</label>
                    <div className="relative">
                      <select 
                        value={outputStyle}
                        onChange={(e) => setOutputStyle(e.target.value as OutputStyle)}
                        className="w-full appearance-none bg-slate-900/50 border border-slate-700 text-white rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium"
                      >
                        {Object.values(OutputStyle).map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-3.5 pointer-events-none text-slate-400">
                        <FileType className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Start Templates */}
                <div className="mb-4 flex-1 overflow-y-auto scrollbar-thin pr-1">
                   <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Industry Standard Templates</label>
                   <div className="grid grid-cols-2 gap-2">
                      {starterTemplates.map((tpl) => (
                        <button
                          key={tpl.id}
                          onClick={() => setContext(tpl.value)}
                          className={`flex flex-col items-start justify-start p-3 rounded-xl border border-slate-700/50 transition-all hover:scale-[1.02] ${tpl.bg} hover:bg-opacity-20 hover:border-opacity-50 text-left h-full`}
                        >
                           <div className="flex items-center gap-2 mb-1">
                             <tpl.icon className={`w-4 h-4 ${tpl.color}`} />
                             <span className="text-[11px] font-bold text-slate-200 leading-tight">{tpl.label}</span>
                           </div>
                           <span className="text-[10px] text-slate-500 leading-tight line-clamp-2">{tpl.desc}</span>
                        </button>
                      ))}
                   </div>
                </div>
             </div>
           ) : null}

           {/* Steps Logic for Left Panel (Info/Status) */}
            {step === 'questions' && (
              <div className="flex flex-col h-full animate-fade-in">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                   <MessageSquare className="w-5 h-5 text-yellow-400" />
                   Clarifications Needed
                </h3>
                <p className="text-sm text-slate-400 mb-6">
                   The AI needs a bit more detail to generate the perfect configuration for your stack.
                </p>
                <div className="space-y-4 flex-1 overflow-y-auto pr-2 scrollbar-thin">
                   {analysis?.questions?.map((q, idx) => (
                     <div key={idx} className="space-y-2">
                        <label className="text-xs font-bold text-slate-300 block">{q}</label>
                        <input 
                          type="text"
                          value={answers[q] || ''}
                          onChange={(e) => setAnswers({...answers, [q]: e.target.value})}
                          className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-primary outline-none"
                          placeholder="Type your answer..."
                        />
                     </div>
                   ))}
                </div>
                <button 
                   onClick={handleGenerateRules}
                   className="mt-4 w-full bg-primary hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
                >
                   <Wand2 className="w-4 h-4" />
                   Generate Configuration
                </button>
              </div>
            )}

            {(step === 'generating' || step === 'done') && (
              <div className="flex flex-col h-full animate-fade-in justify-center items-center text-center p-4">
                 {step === 'generating' ? (
                   <>
                     <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                     <h3 className="text-xl font-bold text-white mb-2">Generating...</h3>
                     <p className="text-slate-400 text-sm">Crafting your {ide} configuration files based on best practices.</p>
                   </>
                 ) : (
                   <>
                     <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-6 border border-green-500/20">
                        <Check className="w-8 h-8 text-green-400" />
                     </div>
                     <h3 className="text-xl font-bold text-white mb-2">Generation Complete</h3>
                     <p className="text-slate-400 text-sm mb-6">Your configuration files are ready to be added to your project.</p>
                     <button 
                       onClick={() => setStep('input')}
                       className="px-6 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium transition-colors border border-white/5"
                     >
                        Start New Project
                     </button>
                   </>
                 )}
              </div>
            )}

        </div>
      </div>

      {/* RIGHT PANEL: Input / Output Area */}
      <div className="flex-1 bg-surface/30 backdrop-blur-xl border border-white/10 rounded-3xl p-1 overflow-hidden flex flex-col relative shadow-2xl">
         {/* Header / Tabs */}
         <div className="bg-black/20 border-b border-white/5 p-2 flex items-center justify-between">
            <div className="flex gap-1 overflow-x-auto scrollbar-hide">
               {step === 'done' && parsedFiles.length > 0 ? (
                  parsedFiles.map((file, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveFileTab(idx)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                        activeFileTab === idx 
                          ? 'bg-white/10 text-white shadow-inner' 
                          : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      <FileCode className="w-3 h-3" />
                      {file.fileName}
                    </button>
                  ))
               ) : (
                 <div className="px-3 py-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <Code className="w-4 h-4" />
                    {step === 'input' ? 'Context Input' : 'Generator Output'}
                 </div>
               )}
            </div>

            {(step === 'done' || step === 'generating') && (
              <button 
                onClick={copyToClipboard}
                className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                title="Copy to Clipboard"
              >
                 {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            )}
         </div>

         {/* Content Area */}
         <div className="flex-1 relative bg-[#0f1117]">
            {step === 'input' || step === 'analyzing' || step === 'questions' ? (
               <div className="absolute inset-0 flex flex-col">
                  <textarea
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder={`Paste your package.json, file structure, or describe your stack...
Example:
"Next.js project with Tailwind and Supabase. I need a cursor rules file for writing clean React components."`}
                    className="flex-1 w-full bg-transparent p-6 text-sm font-mono text-slate-300 resize-none outline-none placeholder:text-slate-700"
                    disabled={step === 'analyzing'}
                  />
                  <div className="p-4 border-t border-white/5 bg-black/20 flex justify-end">
                     <button 
                       onClick={handleAnalyze}
                       disabled={!context.trim() || step === 'analyzing'}
                       className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                         !context.trim() || step === 'analyzing'
                           ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                           : 'bg-primary hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                       }`}
                     >
                        {step === 'analyzing' ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            Analyze & Generate
                          </>
                        )}
                     </button>
                  </div>
               </div>
            ) : (
               // Output View
               <div className="absolute inset-0 overflow-auto custom-scrollbar" ref={outputRef}>
                  <pre className="p-6 text-sm font-mono text-blue-100 leading-relaxed whitespace-pre-wrap">
                    {step === 'done' && parsedFiles.length > 0 
                      ? parsedFiles[activeFileTab]?.content 
                      : rawOutput
                    }
                  </pre>
               </div>
            )}

            {/* Error Overlay */}
            {error && (
              <div className="absolute bottom-4 left-4 right-4 bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-xl flex items-start gap-3 backdrop-blur-xl animate-fade-in-up">
                 <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                 <div className="flex-1 text-sm">{error}</div>
                 <button onClick={() => setError(null)} className="hover:text-white">×</button>
              </div>
            )}
         </div>
      </div>

    </div>
  );
};

export default Generator;