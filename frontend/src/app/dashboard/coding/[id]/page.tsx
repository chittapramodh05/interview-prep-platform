'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '../../../../services/api';
import Editor from '@monaco-editor/react';
import { 
  Play, 
  Send, 
  RotateCcw, 
  ArrowLeft, 
  Loader2,
  CheckCircle,
  XCircle,
  Terminal as ConsoleIcon,
  HelpCircle,
  ChevronRight
} from 'lucide-react';

export default function CodingWorkspacePage() {
  const router = useRouter();
  const { id } = useParams();

  // Question Info
  const [question, setQuestion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<'javascript' | 'python'>('javascript');
  const [code, setCode] = useState('');

  // Runner Outputs
  const [executing, setExecuting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Tab & Submissions history
  const [workspaceTab, setWorkspaceTab] = useState<'DESCRIPTION' | 'SUBMISSIONS'>('DESCRIPTION');
  const [submissions, setSubmissions] = useState<any[]>([]);

  useEffect(() => {
    fetchQuestionDetails();
    fetchSubmissions();
  }, [id]);

  const fetchSubmissions = async () => {
    try {
      const response = await api.get('/coding/submissions');
      const filtered = response.data.data.filter((s: any) => s.codingQuestionId === id);
      setSubmissions(filtered);
    } catch (err) {
      console.error('Error fetching submissions:', err);
    }
  };

  const fetchQuestionDetails = async () => {
    try {
      const response = await api.get(`/coding/questions/${id}`);
      const q = response.data.data;
      setQuestion(q);
      
      // Seed starter code
      const starter = q.starterCode;
      setCode(starter?.javascript || '');
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to retrieve question details.');
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value as 'javascript' | 'python';
    setLanguage(lang);
    if (question && question.starterCode) {
      setCode(question.starterCode[lang] || '');
    }
    setResults(null);
  };

  const resetBoilerplate = () => {
    if (question && question.starterCode) {
      setCode(question.starterCode[language] || '');
    }
    setResults(null);
  };

  const runCode = async () => {
    setExecuting(true);
    setResults(null);
    setErrorMsg(null);
    try {
      const response = await api.post('/coding/run', {
        questionId: id,
        code,
        language,
      });
      setResults(response.data.data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Error executing code runner.');
    } finally {
      setExecuting(false);
    }
  };

  const submitCode = async () => {
    setSubmitting(true);
    setResults(null);
    setErrorMsg(null);
    try {
      const response = await api.post('/coding/submit', {
        questionId: id,
        code,
        language,
      });
      setResults(response.data.data);
      fetchSubmissions(); // Refresh history
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Error processing code submission.');
    } finally {
      setSubmitting(false);
    }
  };

  const loadSubmission = (sub: any) => {
    setCode(sub.code);
    setLanguage(sub.language as 'javascript' | 'python');
    setWorkspaceTab('DESCRIPTION');
    setResults(null);
  };

  const getDifficultyStyles = (diff: string) => {
    if (diff === 'EASY') return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
    if (diff === 'MEDIUM') return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
    return 'bg-red-500/10 border-red-500/20 text-red-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#8b5cf6] animate-spin" />
      </div>
    );
  }

  if (!question) {
    return (
      <div className="glass-card text-center p-8 border border-white/5 bg-white/[0.01] max-w-md mx-auto mt-20">
        <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <span className="text-sm font-bold text-white block">Question Not Found</span>
        <button onClick={() => router.push('/dashboard/coding')} className="mt-4 px-4 py-2 bg-white/5 rounded-lg text-xs text-white">
          Back to Challenges
        </button>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col lg:flex-row gap-6">
      
      {/* 1. Left Side: Question description & details / Submissions */}
      <div className="flex-1 flex flex-col min-h-0 bg-[#090d16]/30 border border-white/5 rounded-2xl p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-4 shrink-0">
          <button 
            onClick={() => router.push('/dashboard/coding')}
            className="text-xs font-semibold text-gray-500 hover:text-white flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Challenges
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-white/5 space-x-6 text-xs font-semibold mb-6 shrink-0">
          <button 
            onClick={() => setWorkspaceTab('DESCRIPTION')}
            className={`pb-2.5 transition-colors cursor-pointer ${workspaceTab === 'DESCRIPTION' ? 'text-[#a78bfa] border-b-2 border-[#8b5cf6]' : 'text-gray-500 hover:text-white'}`}
          >
            Problem Description
          </button>
          <button 
            onClick={() => { setWorkspaceTab('SUBMISSIONS'); fetchSubmissions(); }}
            className={`pb-2.5 transition-colors cursor-pointer ${workspaceTab === 'SUBMISSIONS' ? 'text-[#a78bfa] border-b-2 border-[#8b5cf6]' : 'text-gray-500 hover:text-white'}`}
          >
            My Submissions ({submissions.length})
          </button>
        </div>

        {workspaceTab === 'DESCRIPTION' ? (
          <div className="space-y-6 flex-1">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="font-outfit text-xl font-bold text-white">{question.title}</h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getDifficultyStyles(question.difficulty)}`}>
                  {question.difficulty}
                </span>
              </div>
              <span className="text-xs text-gray-500 mt-1 block">Category: {question.category}</span>
            </div>

            <div className="prose prose-invert max-w-none text-sm text-gray-300 leading-relaxed border-t border-white/5 pt-4">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Description</span>
              <div className="whitespace-pre-wrap">{question.description}</div>
            </div>

            {question.constraints && (
              <div className="space-y-2 border-t border-white/5 pt-4">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Constraints</span>
                <pre className="text-xs font-mono text-gray-400 bg-black/45 p-3 rounded-lg border border-white/5 overflow-x-auto whitespace-pre-wrap">
                  {question.constraints}
                </pre>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4 flex-1">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-gray-400">Submission History</h3>
            {submissions.length === 0 ? (
              <p className="text-xs text-gray-500 italic py-4">You have not submitted any solutions for this question yet.</p>
            ) : (
              <div className="space-y-3.5">
                {submissions.map((sub: any) => (
                  <div key={sub.id} className="p-4 rounded-xl border border-white/5 bg-white/[0.01] flex justify-between items-center gap-4">
                    <div>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase tracking-wider ${
                        sub.status === 'ACCEPTED' 
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                          : 'bg-red-500/10 border-red-500/20 text-red-400'
                      }`}>
                        {sub.status}
                      </span>
                      <span className="text-xs text-gray-500 ml-3">{sub.language} | {new Date(sub.createdAt).toLocaleDateString()}</span>
                      <span className="text-xs text-gray-400 block mt-1">Score: {sub.score}%</span>
                    </div>
                    <button
                      onClick={() => loadSubmission(sub)}
                      className="px-3.5 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-semibold text-white transition-colors cursor-pointer"
                    >
                      Restore Code
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Right Side: Monaco IDE & Runner console */}
      <div className="flex-1 flex flex-col min-h-0 bg-[#090d16]/30 border border-white/5 rounded-2xl overflow-hidden">
        
        {/* Editor settings bar */}
        <div className="bg-[#090d16] border-b border-white/5 px-4 py-3 flex justify-between items-center z-10 shrink-0">
          <div className="flex items-center space-x-2">
            <select
              value={language}
              onChange={handleLanguageChange}
              className="bg-[#030712] border border-white/10 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none focus:border-[#8b5cf6] cursor-pointer"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
            </select>

            <button 
              onClick={resetBoilerplate}
              className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-colors cursor-pointer"
              title="Reset starter template"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={runCode}
              disabled={executing || submitting}
              className="px-4 py-2 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              {executing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
              <span>Run Tests</span>
            </button>

            <button
              onClick={submitCode}
              disabled={executing || submitting}
              className="px-4 py-2 rounded-lg bg-[#8b5cf6] hover:bg-[#7c3aed] text-white text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5 text-white" />}
              <span>Submit Solution</span>
            </button>
          </div>
        </div>

        {/* Monaco Editor Frame */}
        <div className="flex-1 min-h-0 relative">
          <Editor
            height="100%"
            language={language}
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              automaticLayout: true,
              scrollBeyondLastLine: false,
              tabSize: 2,
            }}
          />
        </div>

        {/* Runner output console */}
        <div className="h-64 border-t border-white/5 bg-[#030712] flex flex-col min-h-0 shrink-0">
          <div className="bg-[#090d16] px-4 py-2 border-b border-white/5 flex items-center space-x-2 shrink-0">
            <ConsoleIcon className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-gray-300">Console Log / Output</span>
          </div>

          <div className="flex-1 p-4 overflow-y-auto font-mono text-xs text-gray-400 space-y-3.5">
            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
                {errorMsg}
              </div>
            )}

            {/* Results output */}
            {results ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold uppercase text-gray-500">Status:</span>
                  <span className={`text-xs font-black px-2 py-0.5 rounded border ${
                    results.status === 'ACCEPTED' 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                      : 'bg-red-500/10 border-red-500/20 text-red-400'
                  }`}>
                    {results.status}
                  </span>
                  <span className="text-gray-500">
                    Passed {results.passedCount} / {results.totalCount} test cases
                  </span>
                </div>

                <div className="space-y-2 border-t border-white/5 pt-3">
                  {(results.details || results.results)?.map((tc: any, idx: number) => (
                    <div key={idx} className={`p-2.5 rounded-lg border text-xs ${tc.passed ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-red-500/5 border-red-500/10'}`}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-gray-400">Test Case {idx + 1}</span>
                        <span className={tc.passed ? 'text-emerald-400 font-semibold' : 'text-red-400 font-semibold'}>
                          {tc.passed ? 'Passed' : tc.error ? 'Runtime Error' : 'Wrong Answer'}
                        </span>
                      </div>
                      <div className="space-y-0.5 text-gray-500">
                        <div>Input: <span className="text-gray-300">{JSON.stringify(tc.input)}</span></div>
                        <div>Expected: <span className="text-gray-300">{JSON.stringify(tc.expected)}</span></div>
                        <div>Output: <span className="text-gray-300">{JSON.stringify(tc.actual)}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : !executing && !submitting ? (
              <p className="text-gray-600 text-xs italic">Write code and click Run or Submit to see outputs.</p>
            ) : (
              <div className="flex items-center space-x-2 py-4 text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin text-[#8b5cf6]" />
                <span>Running compiling checks...</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
