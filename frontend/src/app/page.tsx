'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  FileText, 
  Terminal, 
  Cpu, 
  TrendingUp, 
  ArrowRight, 
  Users, 
  Award, 
  BookOpen, 
  Layers 
} from 'lucide-react';

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#030712] overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] radial-glow pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] radial-glow pointer-events-none" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29371a_1px,transparent_1px),linear-gradient(to_bottom,#1f29371a_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Navigation Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#030712]/80 backdrop-blur-md border-b border-white/5 py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#8b5cf6] to-[#06b6d4] flex items-center justify-center font-bold text-white text-lg tracking-wider">
              A
            </div>
            <span className="font-outfit text-xl font-extrabold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              AURA
            </span>
          </Link>

          <nav className="hidden md:flex space-x-8 text-sm font-medium text-gray-300">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#statistics" className="hover:text-white transition-colors">Stats</a>
            <a href="#coding" className="hover:text-white transition-colors">Coding Arena</a>
          </nav>

          <div className="flex items-center space-x-4">
            <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link href="/register" className="relative group px-4 py-2 rounded-lg bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4] text-sm font-semibold text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 transition-all duration-200">
              <span className="relative z-10">Get Started</span>
              <div className="absolute inset-0 rounded-lg bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/5 text-xs font-semibold text-[#a78bfa] mb-8"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Generation Career Coaching Platform</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-outfit text-4xl sm:text-6xl md:text-7xl font-black leading-tight tracking-tight mb-8"
        >
          Supercharge Your <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#a78bfa] via-[#8b5cf6] to-[#06b6d4]">
            Interview Preparation
          </span>{' '}
          with AI
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl text-base sm:text-lg text-gray-400 leading-relaxed mb-12"
        >
          The complete SaaS prep suite. Scan resumes for ATS compatibility, practice full-length role-based behavioral and technical mock interviews with instant AI assessment, and write clean solutions inside our compiler workspace.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-16"
        >
          <Link href="/register" className="px-8 py-4 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-semibold flex items-center justify-center space-x-2 neon-glow transition-all duration-200">
            <span>Start Preparing Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/login" className="px-8 py-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-semibold transition-colors duration-200">
            Explore Dashboard
          </Link>
        </motion.div>

        {/* Dashboard Mockup Representation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full max-w-5xl rounded-2xl glass-card overflow-hidden border border-white/10 shadow-2xl relative"
        >
          <div className="bg-[#111827] border-b border-white/5 px-4 py-3 flex items-center space-x-2">
            <div className="w-3.5 h-3.5 rounded-full bg-red-500/80" />
            <div className="w-3.5 h-3.5 rounded-full bg-yellow-500/80" />
            <div className="w-3.5 h-3.5 rounded-full bg-green-500/80" />
            <div className="h-4 w-40 bg-white/5 rounded mx-auto" />
          </div>
          <div className="p-4 sm:p-8 bg-[#090d16] flex flex-col md:flex-row gap-6 items-center">
            {/* Visual ATS score dial mock */}
            <div className="w-full md:w-1/3 flex flex-col items-center p-6 border border-white/5 rounded-xl bg-white/5">
              <span className="text-xs uppercase tracking-wider text-gray-500 mb-4 font-bold">ATS Alignment</span>
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="54" className="stroke-gray-800" strokeWidth="8" fill="transparent" />
                  <circle cx="64" cy="64" r="54" className="stroke-[#06b6d4]" strokeWidth="8" fill="transparent" strokeDasharray="339" strokeDashoffset="85" />
                </svg>
                <div className="absolute text-center">
                  <span className="font-outfit text-3xl font-extrabold text-white">75%</span>
                </div>
              </div>
              <span className="text-sm font-semibold text-emerald-400 mt-4 flex items-center">
                +14% vs Last CV
              </span>
            </div>

            {/* Visual Chat Mock */}
            <div className="w-full md:w-2/3 flex flex-col space-y-4 text-left">
              <div className="border border-[#8b5cf6]/30 bg-[#8b5cf6]/5 p-4 rounded-xl">
                <span className="text-xs font-bold text-[#a78bfa] block mb-1">AI Interviewer</span>
                <p className="text-sm text-gray-300">How would you manage application state scale inside a massive enterprise React project? Explain the core differences between Context API and dedicated state frameworks.</p>
              </div>
              <div className="border border-white/5 bg-white/5 p-4 rounded-xl self-end max-w-[85%]">
                <span className="text-xs font-bold text-gray-400 block mb-1">You</span>
                <p className="text-sm text-gray-300">I prefer Zustand or Redux for heavy state scopes because they provide decoupled storage, selectors to restrict re-renders, and built-in middleware for asynchronous actions...</p>
              </div>
              <div className="flex items-center space-x-3 text-xs text-gray-500 pt-2">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Gemini Evaluator: Score 85/100. Excellent details on selector optimization.</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 border-t border-white/5 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-outfit text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Everything You Need to Land the Offer
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            A comprehensive toolset powered by cutting-edge Gemini models to automate your preparation cycle.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card p-8 hover:translate-y-[-4px] transition-all duration-300 relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-violet-500/10 to-transparent pointer-events-none" />
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center text-[#a78bfa] mb-6">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-outfit text-xl font-bold mb-3 text-white">ATS Resume Suite</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Upload your resume in PDF format. Extract key technical credentials, receive direct recommendations, and uncover missing keywords specific to your target job role.
            </p>
          </div>

          <div className="glass-card p-8 hover:translate-y-[-4px] transition-all duration-300 relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-cyan-500/10 to-transparent pointer-events-none" />
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-[#22d3ee] mb-6">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="font-outfit text-xl font-bold mb-3 text-white">AI Mock Simulator</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Simulate full interviews with a timer. Answer technical or behavioral questions generated for your experience, get follow-ups, and receive comprehensive grading feedback.
            </p>
          </div>

          <div className="glass-card p-8 hover:translate-y-[-4px] transition-all duration-300 relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/10 to-transparent pointer-events-none" />
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-[#fbbf24] mb-6">
              <Terminal className="w-6 h-6" />
            </div>
            <h3 className="font-outfit text-xl font-bold mb-3 text-white">Coding Arena</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Solve LeetCode-style algorithmic challenges in Javascript or Python. Run test suites, compile inputs, check constraints, and log submission histories.
            </p>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section id="statistics" className="py-20 border-t border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center p-6 glass-card">
            <div className="inline-flex w-10 h-10 rounded-full bg-violet-500/10 items-center justify-center text-violet-400 mb-4">
              <Users className="w-5 h-5" />
            </div>
            <div className="text-3xl font-extrabold text-white mb-1 font-outfit">10,000+</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider font-bold">Active Candidates</div>
          </div>

          <div className="text-center p-6 glass-card">
            <div className="inline-flex w-10 h-10 rounded-full bg-cyan-500/10 items-center justify-center text-cyan-400 mb-4">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="text-3xl font-extrabold text-white mb-1 font-outfit">94.2%</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider font-bold">ATS Score Improvement</div>
          </div>

          <div className="text-center p-6 glass-card">
            <div className="inline-flex w-10 h-10 rounded-full bg-amber-500/10 items-center justify-center text-amber-400 mb-4">
              <Award className="w-5 h-5" />
            </div>
            <div className="text-3xl font-extrabold text-white mb-1 font-outfit">150,000+</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider font-bold">Mock Answers Scored</div>
          </div>

          <div className="text-center p-6 glass-card">
            <div className="inline-flex w-10 h-10 rounded-full bg-emerald-500/10 items-center justify-center text-emerald-400 mb-4">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="text-3xl font-extrabold text-white mb-1 font-outfit">25+</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider font-bold">Engineering Roles Supported</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 border-t border-white/5 text-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-900/10 to-cyan-900/10 pointer-events-none" />
        <div className="max-w-3xl mx-auto relative z-10">
          <h2 className="font-outfit text-3xl sm:text-5xl font-extrabold text-white mb-6">
            Ready to Ace Your Next Interview?
          </h2>
          <p className="text-gray-400 mb-10 leading-relaxed max-w-xl mx-auto">
            Get instant AI analysis on your resume, practice actual mock chats, and optimize your logic algorithms in one dashboard.
          </p>
          <Link href="/register" className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4] text-white font-semibold inline-flex items-center space-x-2 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 transition-all duration-200">
            <span>Create Free Account</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6 text-center text-sm text-gray-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 sm:mb-0">
            <div className="w-6 h-6 rounded bg-gradient-to-tr from-[#8b5cf6] to-[#06b6d4] flex items-center justify-center font-bold text-white text-xs">
              A
            </div>
            <span className="font-outfit font-extrabold text-gray-400">AURA CO.</span>
          </div>
          <p>&copy; {new Date().getFullYear()} AURA Career Assistant. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
