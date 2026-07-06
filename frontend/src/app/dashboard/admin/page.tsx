'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../../store/useAuthStore';
import api from '../../../services/api';
import { useForm } from 'react-hook-form';
import { 
  Shield, 
  Users, 
  FileText, 
  Mic, 
  PlusCircle, 
  History, 
  Loader2, 
  CheckCircle,
  XCircle,
  AlertTriangle,
  Database
} from 'lucide-react';

export default function AdminPanelPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  // Navigation tabs: 'METRICS' | 'USERS' | 'CREATE_QUESTION'
  const [activeTab, setActiveTab] = useState<'METRICS' | 'USERS' | 'CREATE_QUESTION'>('METRICS');

  // Admin Telemetry & Data
  const [stats, setStats] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // React Hook Form for new coding question
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      title: '',
      category: '',
      difficulty: 'EASY',
      description: '',
      constraints: '',
      starterJs: 'function solution() {\n  // Write code\n}',
      starterPy: 'def solution():\n    pass',
      testCasesJson: '[\n  {"input": [1, 2], "output": 3}\n]'
    }
  });

  useEffect(() => {
    // Safety check
    if (user?.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }
    fetchAdminData();
  }, [user, router]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // 1. Fetch system counters & admin logs
      const statsResponse = await api.get('/admin/stats');
      setStats(statsResponse.data.data);

      // 2. Fetch users list
      const usersResponse = await api.get('/admin/users');
      setUsersList(usersResponse.data.data);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to compile administrative telemetry.');
    } finally {
      setLoading(false);
    }
  };

  const onCreateQuestionSubmit = async (data: any) => {
    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // Parse starterCode object
      const starterCode = {
        javascript: data.starterJs,
        python: data.starterPy
      };

      // Parse testCases JSON
      let testCases;
      try {
        testCases = JSON.parse(data.testCasesJson);
        if (!Array.isArray(testCases)) {
          throw new Error('Test cases must be a JSON array of input/output objects.');
        }
      } catch (jsonErr: any) {
        setErrorMsg(`JSON Parsing Error in Test Cases: ${jsonErr.message}`);
        setSubmitting(false);
        return;
      }

      await api.post('/admin/questions', {
        title: data.title,
        category: data.category,
        difficulty: data.difficulty,
        description: data.description,
        constraints: data.constraints,
        starterCode,
        testCases
      });

      setSuccessMsg('New coding question injected successfully!');
      reset(); // Reset form
      fetchAdminData(); // Refresh logs
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Error creating coding question.');
    } finally {
      setSubmitting(false);
    }
  };

  if (user?.role !== 'ADMIN') {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-cyan-600/10 via-cyan-500/5 to-transparent p-6 rounded-2xl border border-cyan-500/10">
        <div>
          <h2 className="font-outfit text-2xl font-bold text-white flex items-center gap-2">
            AURA System Console <Shield className="w-5 h-5 text-cyan-400" />
          </h2>
          <p className="text-sm text-gray-400 mt-1">Platform management console. Monitor usage logs, audit users, and create coding challenges.</p>
        </div>
      </div>

      {/* Stats Counter Panels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider text-gray-500 font-bold block">Total Users</span>
            <span className="text-3xl font-extrabold text-white block font-outfit">{stats?.totalUsers || 0}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-6 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider text-gray-500 font-bold block">Resumes Processed</span>
            <span className="text-3xl font-extrabold text-white block font-outfit">{stats?.totalResumes || 0}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center text-[#a78bfa]">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-6 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider text-gray-500 font-bold block">Mock Sessions</span>
            <span className="text-3xl font-extrabold text-white block font-outfit">{stats?.totalInterviews || 0}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-[#fbbf24]">
            <Mic className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-6 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider text-gray-500 font-bold block">Code Submissions</span>
            <span className="text-3xl font-extrabold text-white block font-outfit">{stats?.totalSubmissions || 0}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <Database className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-white/5 space-x-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('METRICS')}
          className={`pb-3 transition-colors cursor-pointer ${activeTab === 'METRICS' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-white'}`}
        >
          Activity Monitor
        </button>
        <button
          onClick={() => setActiveTab('USERS')}
          className={`pb-3 transition-colors cursor-pointer ${activeTab === 'USERS' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-white'}`}
        >
          User Registry ({usersList.length})
        </button>
        <button
          onClick={() => setActiveTab('CREATE_QUESTION')}
          className={`pb-3 transition-colors cursor-pointer ${activeTab === 'CREATE_QUESTION' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-white'}`}
        >
          Inject Coding Challenge
        </button>
      </div>

      {/* TAB CONTENTS */}
      <div className="space-y-6">
        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> {successMsg}
          </div>
        )}

        {/* 1. METRICS & LOGS */}
        {activeTab === 'METRICS' && (
          <div className="glass-card p-6">
            <h3 className="text-base font-bold text-white mb-4 font-outfit flex items-center gap-2">
              <History className="w-4 h-4 text-cyan-400" /> Administrative Audit Trail
            </h3>
            <div className="space-y-3.5">
              {stats?.adminLogs?.length === 0 ? (
                <p className="text-xs text-gray-500 italic py-2">No administrative logs recorded yet.</p>
              ) : (
                stats?.adminLogs?.map((log: any) => (
                  <div key={log.id} className="p-3.5 rounded-lg border border-white/5 bg-white/[0.01] flex flex-col sm:flex-row justify-between gap-3 text-xs leading-relaxed">
                    <div>
                      <span className="font-bold text-white uppercase text-[10px] tracking-wider bg-cyan-900/40 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/10 mr-2.5">
                        {log.action}
                      </span>
                      <span className="text-gray-300">{log.details}</span>
                    </div>
                    <div className="text-[10px] text-gray-500 shrink-0 self-end sm:self-center">
                      Admin: <span className="text-gray-400 font-semibold">{log.user?.name}</span> | {new Date(log.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 2. USER REGISTRY GRID */}
        {activeTab === 'USERS' && (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/5 text-gray-400 uppercase tracking-wider font-bold">
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Account Role</th>
                    <th className="px-6 py-4">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {usersList.map((usr) => (
                    <tr key={usr.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="px-6 py-4 font-bold text-white">{usr.name}</td>
                      <td className="px-6 py-4 text-gray-300">{usr.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-wider ${
                          usr.role === 'ADMIN' ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' : 'bg-gray-800 border-white/5 text-gray-400'
                        }`}>
                          {usr.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{new Date(usr.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. INJECT CODING CHALLENGE FORM */}
        {activeTab === 'CREATE_QUESTION' && (
          <div className="glass-card p-6 sm:p-8">
            <h3 className="text-base font-bold text-white mb-6 font-outfit flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-cyan-400" /> Create Coding Challenge
            </h3>

            <form onSubmit={handleSubmit(onCreateQuestionSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                    Problem Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. FizzBuzz"
                    className="w-full bg-[#030712] border border-white/10 rounded-xl py-3 px-4 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#8b5cf6]"
                    {...register('title', { required: 'Title is required' })}
                  />
                  {errors.title && <span className="text-red-400 text-xs mt-1 block">{errors.title.message}</span>}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                    Topic Category
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Basic Math / Array"
                    className="w-full bg-[#030712] border border-white/10 rounded-xl py-3 px-4 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#8b5cf6]"
                    {...register('category', { required: 'Category is required' })}
                  />
                  {errors.category && <span className="text-red-400 text-xs mt-1 block">{errors.category.message}</span>}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                    Difficulty
                  </label>
                  <select
                    className="w-full bg-[#030712] border border-white/10 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-[#8b5cf6] cursor-pointer"
                    {...register('difficulty')}
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                  Question Description (Markdown supported)
                </label>
                <textarea
                  placeholder="Explain the requirements, inputs and expected outputs clearly..."
                  className="w-full bg-[#030712] border border-white/10 rounded-xl p-4 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#8b5cf6] min-h-[120px] resize-y"
                  {...register('description', { required: 'Description is required' })}
                />
                {errors.description && <span className="text-red-400 text-xs mt-1 block">{errors.description.message}</span>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                  Constraints
                </label>
                <textarea
                  placeholder="e.g. 1 <= nums.length <= 10^3"
                  className="w-full bg-[#030712] border border-white/10 rounded-xl p-4 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#8b5cf6] min-h-[60px] resize-y"
                  {...register('constraints')}
                />
              </div>

              {/* Starter Codes Boilerplate */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 font-mono">
                    JavaScript Boilerplate
                  </label>
                  <textarea
                    className="w-full bg-[#030712] border border-white/10 rounded-xl p-4 text-xs font-mono text-gray-300 focus:outline-none focus:border-[#8b5cf6] min-h-[100px] resize-y"
                    {...register('starterJs', { required: 'JS code boilerplate required' })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 font-mono">
                    Python Boilerplate
                  </label>
                  <textarea
                    className="w-full bg-[#030712] border border-white/10 rounded-xl p-4 text-xs font-mono text-gray-300 focus:outline-none focus:border-[#8b5cf6] min-h-[100px] resize-y"
                    {...register('starterPy', { required: 'Python code boilerplate required' })}
                  />
                </div>
              </div>

              {/* Test Cases JSON */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                  Test Cases Array (JSON format)
                </label>
                <textarea
                  className="w-full bg-[#030712] border border-white/10 rounded-xl p-4 text-xs font-mono text-gray-300 focus:outline-none focus:border-[#8b5cf6] min-h-[100px] resize-y"
                  {...register('testCasesJson', { required: 'Test cases required' })}
                />
                <span className="text-[10px] text-gray-500 mt-1 block">Must be an array of test case structures containing input array and output value.</span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Adding to question list...</span>
                  </>
                ) : (
                  <>
                    <span>Inject Coding Challenge</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>

    </div>
  );
}
