'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '../../../services/api';
import { 
  Terminal, 
  Search, 
  HelpCircle, 
  ArrowRight, 
  Loader2,
  FileCode,
  Tag,
  Sparkles
} from 'lucide-react';

export default function CodingQuestionsPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('ALL');
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await api.get('/coding/questions');
      setQuestions(response.data.data);
    } catch (err) {
      console.error('Error fetching coding questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAIGenerate = async () => {
    setGenerating(true);
    setMessage(null);
    try {
      const topics = ['Arrays', 'Strings', 'Stacks', 'Recursion', 'Hash Maps'];
      const randomTopic = topics[Math.floor(Math.random() * topics.length)];
      const difficulties = ['EASY', 'MEDIUM'];
      const randomDifficulty = difficulties[Math.floor(Math.random() * difficulties.length)];

      const response = await api.post('/coding/generate', {
        difficulty: randomDifficulty,
        topic: randomTopic
      });

      const newQuestion = response.data.data;
      setMessage(`AI generated a new challenge: "${newQuestion.title}" (${newQuestion.difficulty}) in "${newQuestion.category}"!`);
      fetchQuestions();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Error triggering AI challenge generator.');
    } finally {
      setGenerating(false);
    }
  };

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = q.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          q.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = selectedDifficulty === 'ALL' || q.difficulty === selectedDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  const getDifficultyStyles = (diff: string) => {
    if (diff === 'EASY') return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
    if (diff === 'MEDIUM') return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
    return 'bg-red-500/10 border-red-500/20 text-red-400';
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-60 bg-white/5 rounded-lg" />
        <div className="h-14 bg-white/5 rounded-xl border border-white/5" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 bg-white/5 rounded-xl border border-white/5" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h2 className="font-outfit text-2xl font-bold text-white">Coding Interview Challenges</h2>
        <p className="text-sm text-gray-400 mt-1">Resolve algorithmic problems in JavaScript or Python to build logic memory.</p>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold flex items-center justify-between animate-fadeIn">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            {message}
          </span>
          <button onClick={() => setMessage(null)} className="text-gray-400 hover:text-white font-bold ml-4">✕</button>
        </div>
      )}

      {/* Filter panel */}
      <div className="flex flex-col md:flex-row gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.01] items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto flex-1">
          {/* Search bar */}
          <div className="flex-1 relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search problems by name or tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#030712] border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#8b5cf6]"
            />
          </div>

          {/* Difficulty dropdown */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="bg-[#030712] border border-white/10 rounded-lg py-2.5 px-4 text-xs text-white focus:outline-none focus:border-[#8b5cf6] cursor-pointer"
          >
            <option value="ALL">All Difficulties</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>

        {/* AI Generate Button */}
        <button
          onClick={handleAIGenerate}
          disabled={generating}
          className="w-full md:w-auto px-4 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 text-xs font-semibold text-white flex items-center justify-center space-x-2 shrink-0 cursor-pointer shadow-md shadow-violet-500/10"
        >
          {generating ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>AI Generating...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI-Generate Challenge</span>
            </>
          )}
        </button>
      </div>

      {/* Questions list */}
      <div className="space-y-3">
        {filteredQuestions.length === 0 ? (
          <div className="glass-card text-center p-8 border border-white/5 bg-white/[0.01]">
            <FileCode className="w-12 h-12 text-gray-600 mx-auto mb-3 stroke-1" />
            <span className="text-sm font-bold text-white block">No challenges found</span>
            <p className="text-xs text-gray-500 mt-1">Try relaxing your search terms or filters.</p>
          </div>
        ) : (
          filteredQuestions.map((q) => (
            <div
              key={q.id}
              className="p-5 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-white text-sm hover:text-[#a78bfa] transition-colors">
                    {q.title}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getDifficultyStyles(q.difficulty)}`}>
                    {q.difficulty}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Tag className="w-3.5 h-3.5 text-gray-600" />
                  <span>{q.category}</span>
                </div>
              </div>

              <Link
                href={`/dashboard/coding/${q.id}`}
                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-[#8b5cf6] hover:shadow-lg hover:shadow-violet-500/10 text-xs font-semibold text-white flex items-center space-x-1 transition-all cursor-pointer"
              >
                <span>Code Challenge</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
