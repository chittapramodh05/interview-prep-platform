'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '../../store/useAuthStore';
import api from '../../services/api';
import { 
  Sparkles, 
  Award, 
  FileText, 
  Mic, 
  Terminal, 
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  Loader2
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const [mockGoal, setMockGoal] = useState(2);
  const [codingGoal, setCodingGoal] = useState(3);

  useEffect(() => {
    setMounted(true);
    fetchDashboardStats();
    if (typeof window !== 'undefined') {
      const storedMock = localStorage.getItem('weekly_mock_goal');
      const storedCoding = localStorage.getItem('weekly_coding_goal');
      if (storedMock) setMockGoal(Number(storedMock));
      if (storedCoding) setCodingGoal(Number(storedCoding));
    }
  }, []);

  const saveMockGoal = (val: number) => {
    setMockGoal(val);
    localStorage.setItem('weekly_mock_goal', String(val));
  };

  const saveCodingGoal = (val: number) => {
    setCodingGoal(val);
    localStorage.setItem('weekly_coding_goal', String(val));
  };

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/analytics/dashboard');
      setStats(response.data.data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-60 bg-white/5 rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-white/5 rounded-xl border border-white/5" />
          ))}
        </div>
        <div className="h-80 bg-white/5 rounded-xl border border-white/5" />
      </div>
    );
  }

  // Fallback defaults if API fails
  const data = stats?.weeklyProgress || [
    { day: 'Sun', ATS: 60, Interview: 50, Coding: 70 },
    { day: 'Mon', ATS: 65, Interview: 60, Coding: 75 },
    { day: 'Tue', ATS: 70, Interview: 62, Coding: 78 },
    { day: 'Wed', ATS: 72, Interview: 65, Coding: 80 },
    { day: 'Thu', ATS: 75, Interview: 68, Coding: 85 },
    { day: 'Fri', ATS: 75, Interview: 72, Coding: 85 },
    { day: 'Sat', ATS: 78, Interview: 75, Coding: 90 },
  ];

  return (
    <div className="space-y-8">
      {/* Greeting Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-violet-600/10 via-violet-500/5 to-transparent p-6 rounded-2xl border border-violet-500/10">
        <div>
          <h2 className="font-outfit text-2xl font-bold text-white flex items-center gap-2">
            Welcome back, {user?.name || 'Developer'}! <Sparkles className="w-5 h-5 text-amber-400" />
          </h2>
          <p className="text-sm text-gray-400 mt-1">Accelerate your readiness. Here is your preparation summary for this week.</p>
        </div>
        <Link 
          href="/dashboard/mock" 
          className="px-5 py-2.5 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] text-white text-sm font-semibold flex items-center space-x-2 transition-all shadow-lg shadow-violet-500/10 cursor-pointer"
        >
          <span>Practice Mock Interview</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Grid Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Readiness Score Card */}
        <div className="glass-card p-6 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider text-gray-500 font-bold block">Readiness Score</span>
            <span className="text-3xl font-extrabold text-white block font-outfit">
              {stats?.readinessScore || 0}%
            </span>
            <span className="text-xs text-[#a78bfa] flex items-center gap-1 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" /> High Potential
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center text-[#a78bfa]">
            <BrainCircuit className="w-6 h-6" />
          </div>
        </div>

        {/* ATS score Card */}
        <div className="glass-card p-6 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider text-gray-500 font-bold block">Avg ATS Match</span>
            <span className="text-3xl font-extrabold text-white block font-outfit">
              {stats?.avgAts || 0}%
            </span>
            <span className="text-xs text-gray-400 block">Based on uploads</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-[#06b6d4]">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        {/* Mock Interviews completed */}
        <div className="glass-card p-6 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider text-gray-500 font-bold block">Mock Sessions</span>
            <span className="text-3xl font-extrabold text-white block font-outfit">
              {stats?.completedInterviews || 0}
            </span>
            <span className="text-xs text-emerald-400 block font-semibold">
              Avg score: {stats?.avgInterview || 0}%
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-[#fbbf24]">
            <Mic className="w-6 h-6" />
          </div>
        </div>

        {/* Coding Problems Completed */}
        <div className="glass-card p-6 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider text-gray-500 font-bold block">Coding Solved</span>
            <span className="text-3xl font-extrabold text-white block font-outfit">
              {stats?.completedCoding || 0}
            </span>
            <span className="text-xs text-gray-400 block">Challenges resolved</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <Terminal className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Progress Chart Area */}
      <div className="glass-card p-6 sm:p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-white font-outfit">Performance Analysis</h3>
            <p className="text-xs text-gray-500">Weekly progress score indicators</p>
          </div>
          <div className="flex space-x-4 text-xs">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded bg-[#8b5cf6]" />
              <span className="text-gray-400 font-semibold">Coding</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded bg-[#06b6d4]" />
              <span className="text-gray-400 font-semibold">Interview</span>
            </div>
          </div>
        </div>

        <div className="h-72 w-full">
          {mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCoding" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorInterview" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="day" stroke="#4b5563" fontSize={11} tickLine={false} />
                <YAxis stroke="#4b5563" fontSize={11} tickLine={false} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#090d16', 
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#f3f4f6',
                    fontSize: '12px'
                  }}
                />
                <Area type="monotone" dataKey="Coding" stroke="#8b5cf6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCoding)" />
                <Area type="monotone" dataKey="Interview" stroke="#06b6d4" strokeWidth={2.5} fillOpacity={1} fill="url(#colorInterview)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recommended Topics / Tasks */}
      <div className="glass-card p-6 sm:p-8">
        <h3 className="text-lg font-bold text-white mb-4 font-outfit">Recommended Actions</h3>
        <div className="space-y-3.5">
          {stats?.recommendations?.map((item: any, i: number) => (
            <div key={i} className="flex justify-between items-center p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors gap-4">
              <div>
                <span className="text-sm font-bold text-white block">{item.topic}</span>
                <span className="text-xs text-gray-500 mt-0.5 block leading-relaxed">{item.reason}</span>
              </div>
              <Link 
                href={item.actionLink}
                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-white flex items-center space-x-1.5 transition-colors cursor-pointer shrink-0"
              >
                <span>Practice</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Gamification & Leaderboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Unlocked Badges & Weekly Goals (left) */}
        <div className="lg:col-span-1 space-y-6">
          {/* Goals Card */}
          <div className="glass-card p-6 sm:p-8 space-y-4">
            <h3 className="text-lg font-bold text-white font-outfit">Weekly Goals</h3>
            <div className="space-y-4">
              {/* Mock Goal */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-semibold text-gray-300">Mock Interviews ({stats?.completedInterviews || 0}/{mockGoal})</span>
                  <span className="text-[#a78bfa] font-bold">{Math.round(Math.min(((stats?.completedInterviews || 0)/mockGoal)*100, 100))}%</span>
                </div>
                <div className="w-full bg-gray-800 h-2 rounded-full mb-2">
                  <div className="bg-violet-500 h-2 rounded-full transition-all duration-300" style={{ width: `${Math.min(((stats?.completedInterviews || 0)/mockGoal)*100, 100)}%` }} />
                </div>
                <input 
                  type="range" min="1" max="10" 
                  value={mockGoal} 
                  onChange={(e) => saveMockGoal(Number(e.target.value))} 
                  className="w-full accent-violet-500 cursor-pointer h-1"
                />
              </div>
              
              {/* Coding Goal */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-semibold text-gray-300">Coding Problems ({stats?.completedCoding || 0}/{codingGoal})</span>
                  <span className="text-cyan-400 font-bold">{Math.round(Math.min(((stats?.completedCoding || 0)/codingGoal)*100, 100))}%</span>
                </div>
                <div className="w-full bg-gray-800 h-2 rounded-full mb-2">
                  <div className="bg-[#06b6d4] h-2 rounded-full transition-all duration-300" style={{ width: `${Math.min(((stats?.completedCoding || 0)/codingGoal)*100, 100)}%` }} />
                </div>
                <input 
                  type="range" min="1" max="10" 
                  value={codingGoal} 
                  onChange={(e) => saveCodingGoal(Number(e.target.value))} 
                  className="w-full accent-cyan-500 cursor-pointer h-1"
                />
              </div>
            </div>
          </div>

          {/* Unlocked Badges */}
          <div className="glass-card p-6 sm:p-8 space-y-6">
            <h3 className="text-lg font-bold text-white font-outfit flex items-center gap-2">
              <Award className="w-5 h-5 text-violet-400" /> Unlocked Achievements
            </h3>

            <div className="space-y-4">
              {/* ATS Prodigy */}
              <div className={`p-4 rounded-xl border flex items-center gap-4 transition-all duration-300 ${
                (stats?.avgAts || 0) >= 70 
                  ? 'bg-gradient-to-r from-violet-500/10 to-transparent border-violet-500/20' 
                  : 'bg-transparent border-white/5 opacity-40'
              }`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shrink-0 ${
                  (stats?.avgAts || 0) >= 70 ? 'bg-violet-500' : 'bg-gray-800'
                }`}>
                  CV
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">ATS Prodigy</span>
                  <span className="text-[10px] text-gray-500 block mt-0.5">Average resume score &ge; 70%</span>
                </div>
              </div>

              {/* Code Warrior */}
              <div className={`p-4 rounded-xl border flex items-center gap-4 transition-all duration-300 ${
                (stats?.completedCoding || 0) >= 1 
                  ? 'bg-gradient-to-r from-cyan-500/10 to-transparent border-cyan-500/20' 
                  : 'bg-transparent border-white/5 opacity-40'
              }`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shrink-0 ${
                  (stats?.completedCoding || 0) >= 1 ? 'bg-cyan-500' : 'bg-gray-800'
                }`}>
                  JS
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Code Warrior</span>
                  <span className="text-[10px] text-gray-500 block mt-0.5">Solve at least 1 coding challenge</span>
                </div>
              </div>

              {/* Interview Master */}
              <div className={`p-4 rounded-xl border flex items-center gap-4 transition-all duration-300 ${
                (stats?.completedInterviews || 0) >= 1 
                  ? 'bg-gradient-to-r from-amber-500/10 to-transparent border-amber-500/20' 
                  : 'bg-transparent border-white/5 opacity-40'
              }`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shrink-0 ${
                  (stats?.completedInterviews || 0) >= 1 ? 'bg-amber-500' : 'bg-gray-800'
                }`}>
                  AI
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Elite Interviewer</span>
                  <span className="text-[10px] text-gray-500 block mt-0.5">Complete a technical mock session</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Global Leaderboard (right) */}
        <div className="lg:col-span-2 glass-card p-6 sm:p-8 space-y-6">
          <h3 className="text-lg font-bold text-white font-outfit flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" /> Prep Leaderboard (Weekly XP Rankings)
          </h3>

          <div className="space-y-3">
            {[
              { rank: 1, name: 'Alex Rivera', xp: 1450, tag: 'Senior Engineer' },
              { rank: 2, name: 'Emma Watson', xp: 1100, tag: 'Full Stack Dev' },
              { rank: 3, name: 'Siddharth Nair', xp: 850, tag: 'Frontend Dev' },
              { 
                rank: 4, 
                name: user?.name ? `${user.name} (You)` : 'You', 
                xp: ((stats?.completedInterviews || 0) * 150) + ((stats?.completedCoding || 0) * 100) + (Math.round((stats?.avgAts || 0) * 5)), 
                tag: 'Candidate',
                isUser: true 
              }
            ].sort((a, b) => b.xp - a.xp).map((candidate, idx) => (
              <div 
                key={idx} 
                className={`p-3.5 rounded-xl border flex justify-between items-center transition-colors ${
                  candidate.isUser 
                    ? 'bg-gradient-to-r from-violet-600/10 to-transparent border-violet-500/30' 
                    : 'bg-white/[0.01] border-white/5'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs font-outfit shrink-0 ${
                    idx === 0 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20' : 
                    idx === 1 ? 'bg-gray-400/20 text-gray-300 border border-gray-400/20' : 
                    idx === 2 ? 'bg-amber-800/20 text-amber-700 border border-amber-800/20' : 
                    'bg-white/5 text-gray-500'
                  }`}>
                    {idx + 1}
                  </span>
                  <div>
                    <span className={`text-xs font-bold block ${candidate.isUser ? 'text-violet-400' : 'text-white'}`}>{candidate.name}</span>
                    <span className="text-[10px] text-gray-500 block mt-0.5">{candidate.tag}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-white block font-mono">{candidate.xp} XP</span>
                  <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold block">Points</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
