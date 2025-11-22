import React, { useState, useRef, useEffect } from 'react';
import { IdeType, TemplateType, AnalysisResponse, GeneratedFile } from '../types';
import { generateRulesStream, analyzeContext } from '../services/geminiService';
import { Copy, Check, Wand2, Loader2, AlertCircle, MessageSquare, ArrowRight, Code, FileCode, Sparkles, Cpu, Terminal, FileText, Cloud, Database, Server, Globe, Layout, Box, Layers } from 'lucide-react';

const Generator: React.FC = () => {
  // State Machine
  const [step, setStep] = useState<'input' | 'analyzing' | 'questions' | 'generating' | 'done'>('input');
  
  const [ide, setIde] = useState<IdeType>(IdeType.UNIVERSAL);
  const [context, setContext] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
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
        answers
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
      setError("Generation failed.");
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
             <div className="flex flex-col h-full animate-fade-in">
                <div className="mb-6">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Target Environment</label>
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
                           <span className="text-[10px] text-slate-400 leading-tight opacity-80">{tpl.desc}</span>
                        </button>
                      ))}
                   </div>
                </div>

                <div className="flex-1 flex flex-col min-h-[150px] mb-6">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Project Context</label>
                  <div className="relative flex-1">
                    <textarea
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      placeholder="// Paste package.json or describe your stack...
{
  'name': 'my-app',
  'dependencies': {
    'next': '14.0.0',
    'react': '18.0.0'
  }
}"
                      className="w-full h-full bg-slate-900/50 border border-slate-700 text-slate-300 rounded-xl p-4 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none font-mono text-xs leading-relaxed scrollbar-thin"
                    />
                  </div>
                </div>

                <button
                  onClick={handleAnalyze}
                  disabled={step === 'analyzing'}
                  className="w-full bg-primary hover:bg-blue-600 disabled:bg-slate-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-900/20 flex justify-center items-center gap-2 group shrink-0"
                >
                  {step === 'analyzing' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 group-hover:text-yellow-300 transition-colors" />
                      Analyze Project
                    </>
                  )}
                </button>
             </div>
           ) : step === 'questions' ? (
             <div className="flex flex-col h-full animate-fade-in">
               <div className="mb-6 flex items-center gap-3">
                 <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-400">
                   <AlertCircle className="w-6 h-6" />
                 </div>
                 <div>
                    <h3 className="font-bold text-white">Missing Details</h3>
                    <p className="text-xs text-slate-400">Help us refine the agents.</p>
                 </div>
               </div>
               
               <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-6 scrollbar-thin">
                  {analysis?.questions?.map((q, idx) => (
                    <div key={idx} className="group">
                      <label className="block text-xs font-medium text-slate-300 mb-1.5 group-hover:text-primary transition-colors">{q}</label>
                      <input
                        type="text"
                        value={answers[q]}
                        onChange={(e) => setAnswers(prev => ({...prev, [q]: e.target.value}))}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-primary outline-none transition-all"
                        placeholder="Type answer..."
                      />
                    </div>
                  ))}
               </div>

               <div className="flex gap-3">
                 <button onClick={() => setStep('input')} className="px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 transition-colors text-sm font-medium">Back</button>
                 <button onClick={handleGenerateRules} className="flex-1 bg-primary hover:bg-blue-600 text-white font-bold rounded-xl py-3 shadow-lg shadow-primary/20 flex justify-center items-center gap-2">
                   Generate <ArrowRight className="w-4 h-4" />
                 </button>
               </div>
             </div>
           ) : (
             <div className="flex flex-col h-full items-center justify-center text-center animate-fade-in">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center text-green-400 mb-4 border border-green-500/20">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Ready!</h3>
                <p className="text-sm text-slate-400 mb-6">Your configuration has been generated successfully.</p>
                <button onClick={() => setStep('input')} className="text-primary hover:text-blue-400 text-sm font-medium flex items-center gap-1">
                   <Wand2 className="w-3 h-3" /> Start New Project
                </button>
             </div>
           )}

           {error && (
            <div className="absolute bottom-4 left-4 right-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL: Code Editor Look */}
      <div className="flex-1 bg-[#1e1e1e] border border-slate-700/50 rounded-3xl shadow-2xl flex flex-col overflow-hidden relative">
        {/* Mac-like Title Bar */}
        <div className="h-12 bg-[#252526] border-b border-[#333] flex items-center px-4 justify-between">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
          </div>
          <div className="flex gap-1 overflow-x-auto max-w-[60%] no-scrollbar">
             {parsedFiles.length > 0 ? parsedFiles.map((file, idx) => (
               <button
                 key={idx}
                 onClick={() => setActiveFileTab(idx)}
                 className={`px-3 py-1 text-xs rounded-md flex items-center gap-1.5 transition-all ${
                   activeFileTab === idx 
                     ? 'bg-[#37373d] text-white' 
                     : 'text-gray-500 hover:text-gray-300 hover:bg-[#2d2d2d]'
                 }`}
               >
                 {getFileIcon(file.fileName)}
                 <span className="truncate max-w-[100px]">{file.fileName}</span>
               </button>
             )) : (
               <div className="text-xs text-gray-500 font-mono flex items-center gap-2">
                 <Cpu className="w-3 h-3" /> awaiting_input...
               </div>
             )}
          </div>
          <div className="w-16 flex justify-end">
             {(parsedFiles.length > 0 || rawOutput) && step !== 'analyzing' && (
                <button 
                  onClick={copyToClipboard}
                  className={`p-1.5 rounded-md transition-all ${copied ? 'text-green-400 bg-green-400/10' : 'text-gray-400 hover:bg-white/10'}`}
                  title="Copy content"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
             )}
          </div>
        </div>

        {/* Editor Content */}
        <div className="flex-1 relative bg-[#1e1e1e] overflow-hidden">
           {!rawOutput && step !== 'generating' && (
             <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-700 pointer-events-none select-none">
                <Code className="w-24 h-24 opacity-10 mb-4" />
                <p className="text-lg font-medium opacity-50">Generate your agent configuration</p>
             </div>
           )}
           
           <div 
            ref={outputRef}
            className="absolute inset-0 overflow-auto p-6 font-mono text-sm text-[#d4d4d4] scrollbar-thin leading-relaxed"
           >
             {step === 'generating' && parsedFiles.length === 0 && (
                <div className="flex items-center gap-3 text-primary animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="font-mono">Generating configuration files...</span>
                </div>
             )}
             
             <pre className="outline-none min-w-full">
               {parsedFiles.length > 0 
                 ? parsedFiles[activeFileTab]?.content 
                 : rawOutput}
             </pre>
           </div>
        </div>

        {/* Footer Status Bar */}
        <div className="h-6 bg-[#007acc] text-white text-[10px] flex items-center px-3 gap-4 select-none">
           <div className="flex items-center gap-1"><Code className="w-3 h-3" /> TypeScript React</div>
           <div className="flex items-center gap-1"><Check className="w-3 h-3" /> Prettier</div>
           <div className="flex-1 text-right opacity-80">Ln 1, Col 1</div>
        </div>
      </div>
    </div>
  );
};

// Helper for icons
const getFileIcon = (name: string) => {
  if (name.includes('cursorrules')) return <FileCode className="w-3 h-3 text-blue-400" />;
  if (name.includes('agents')) return <Cpu className="w-3 h-3 text-purple-400" />;
  if (name.includes('copilot')) return <Sparkles className="w-3 h-3 text-orange-400" />;
  return <FileText className="w-3 h-3 text-gray-400" />;
}

export default Generator;