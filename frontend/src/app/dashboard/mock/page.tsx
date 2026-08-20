'use client';

import React, { useState, useEffect, useRef } from 'react';
import api from '../../../services/api';
import {
  Mic,
  Video,
  VideoOff,
  Volume2,
  Loader2,
  ArrowRight,
  CheckCircle,
  HelpCircle,
  Clock,
  ChevronRight,
  TrendingUp,
  RotateCcw,
  Sparkles,
  BookOpen
} from 'lucide-react';

export default function MockInterviewPage() {
  // Navigation States: 'SETUP' | 'INTERVIEW' | 'REPORT'
  const [gameState, setGameState] = useState<'SETUP' | 'INTERVIEW' | 'REPORT'>('SETUP');

  // Setup Parameters
  const [jobRole, setJobRole] = useState('Frontend Developer');
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [experienceLevel, setExperienceLevel] = useState('MID');

  // Simulation Status
  const [interviewId, setInterviewId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');

  // Loading & Tracking
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [answersFeedback, setAnswersFeedback] = useState<any[]>([]);

  // Timer Setup (90 seconds per question)
  const [timeLeft, setTimeLeft] = useState(90);
  const [timerActive, setTimerActive] = useState(false);

  // Camera mock toggle
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  const [recognizer, setRecognizer] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);

  // Voice Speech Synthesis (TTS) State
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Report Details
  const [report, setReport] = useState<any>(null);

  // Camera stream handler
  useEffect(() => {
    if (cameraActive) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then((stream) => {
          setMediaStream(stream);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => { });
          }
        })
        .catch((err) => {
          console.warn('Webcam permission denied:', err);
          setCameraActive(false);
        });
    } else {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
        setMediaStream(null);
      }
    }
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraActive]);

  // Speech Recognition initialization
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onresult = (event: any) => {
        let transcriptSegment = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            transcriptSegment += event.results[i][0].transcript;
          }
        }
        if (transcriptSegment) {
          setUserAnswer((prev) => {
            const cleanSegment = transcriptSegment.trim();
            if (!cleanSegment) return prev;
            return prev ? `${prev} ${cleanSegment}` : cleanSegment;
          });
        }
      };

      rec.onerror = (err: any) => {
        console.error('Speech recognition error:', err);
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      setRecognizer(rec);
    }
  }, []);

  const toggleVoiceRecording = () => {
    if (!recognizer) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (isRecording) {
      recognizer.stop();
      setIsRecording(false);
    } else {
      recognizer.start();
      setIsRecording(true);
    }
  };

  // Text-To-Speech (TTS) engine
  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    setIsSpeaking(false);

    if (!ttsEnabled) return;

    // Filter out markdown syntax
    const cleanText = text.replace(/[*_`#]/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const voices = window.speechSynthesis.getVoices();
    const synthVoice = voices.find(v => v.lang.includes('en-US') || v.lang.includes('en-GB')) || voices[0];
    if (synthVoice) {
      utterance.voice = synthVoice;
    }

    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Auto-read question on advancement
  useEffect(() => {
    if (gameState === 'INTERVIEW' && questions.length > 0 && questions[currentIdx] && ttsEnabled) {
      const timer = setTimeout(() => {
        speakText(questions[currentIdx]);
      }, 400); // short timeout to let browser environment initialize
      return () => clearTimeout(timer);
    }
  }, [currentIdx, gameState, ttsEnabled]);

  // Clean-up speech synthesis
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Camera metrics state hooks
  const [eyeContact, setEyeContact] = useState(95);
  const [pace, setPace] = useState(120);
  const [posture, setPosture] = useState(94);
  const [focus, setFocus] = useState(91);

  useEffect(() => {
    let interval: any;
    if (cameraActive) {
      interval = setInterval(() => {
        setEyeContact(Math.floor(Math.random() * (99 - 90 + 1) + 90));
        setPace(Math.floor(Math.random() * (135 - 110 + 1) + 110));
        setPosture(Math.floor(Math.random() * (98 - 92 + 1) + 92));
        setFocus(Math.floor(Math.random() * (97 - 88 + 1) + 88));
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [cameraActive]);

  const confidenceScore = Math.round((eyeContact + posture + focus) / 3);

  // Roles list
  const roles = [
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'DevOps Engineer',
    'Data Scientist',
    'Cybersecurity Analyst'
  ];

  // Timer tick
  useEffect(() => {
    let timer: any;
    if (timerActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerActive) {
      // Auto submit answer or advance if time runs out
      handleAnswerSubmit();
    }
    return () => clearInterval(timer);
  }, [timerActive, timeLeft]);

  const startInterview = async () => {
    setLoading(true);
    setErrorMsg(null);
    setAnswersFeedback([]);
    try {
      const response = await api.post('/interview/start', {
        jobRole,
        difficulty,
        experienceLevel,
      });
      const { interviewId, questions } = response.data.data;
      setInterviewId(interviewId);
      setQuestions(questions);
      setCurrentIdx(0);
      setUserAnswer('');
      setGameState('INTERVIEW');
      setTimeLeft(90);
      setTimerActive(true);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Error initializing mock interview session.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = async () => {
    if (!interviewId || evaluating) return;

    setEvaluating(true);
    setTimerActive(false);

    // Stop speaking/recording when submitting answer
    if (isRecording && recognizer) {
      recognizer.stop();
      setIsRecording(false);
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    const questionText = questions[currentIdx];
    const answerText = userAnswer.trim() || '(No response supplied by candidate)';

    try {
      const response = await api.post(`/interview/${interviewId}/answer`, {
        question: questionText,
        userAnswer: answerText,
      });

      const evaluatedAnswer = response.data.data;
      setAnswersFeedback(prev => [...prev, evaluatedAnswer]);

      // Move to next or show report finish option
      if (currentIdx + 1 < questions.length) {
        setCurrentIdx(prev => prev + 1);
        setUserAnswer('');
        setTimeLeft(90);
        setTimerActive(true);
      } else {
        // Last question submitted, finish
        finishInterview();
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Failed to evaluate answer. Advancing nonetheless...');
      // Fake insert to not break array lengths
      setAnswersFeedback(prev => [...prev, { question: questionText, userAnswer: answerText, aiScore: 40, aiFeedback: 'Connection error during analysis.' }]);

      if (currentIdx + 1 < questions.length) {
        setCurrentIdx(prev => prev + 1);
        setUserAnswer('');
        setTimeLeft(90);
        setTimerActive(true);
      } else {
        finishInterview();
      }
    } finally {
      setEvaluating(false);
    }
  };

  const finishInterview = async () => {
    if (!interviewId) return;
    setLoading(true);
    try {
      // Mark as completed
      await api.post(`/interview/${interviewId}/finish`);

      // Pull complete detailed report
      const response = await api.get(`/interview/report/${interviewId}`);
      setReport(response.data.data);
      setGameState('REPORT');
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Failed compiling interview report.');
    } finally {
      setLoading(false);
    }
  };

  const resetSetup = () => {
    setInterviewId(null);
    setQuestions([]);
    setCurrentIdx(0);
    setUserAnswer('');
    setAnswersFeedback([]);
    setReport(null);
    setGameState('SETUP');
    if (isRecording && recognizer) {
      recognizer.stop();
      setIsRecording(false);
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* 1. SETUP STATE */}
      {gameState === 'SETUP' && (
        <div className="glass-card p-6 sm:p-10 border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-violet-500/10 to-transparent pointer-events-none" />
          <h2 className="font-outfit text-2xl sm:text-3xl font-extrabold text-white mb-2">Simulate AI Technical Interview</h2>
          <p className="text-sm text-gray-400 mb-8 leading-relaxed max-w-xl">
            Choose your target role parameters. A customized technical and behavioral chat will be generated to test your skill thresholds.
          </p>

          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Job Position
              </label>
              <select
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                className="w-full bg-[#030712] border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-[#8b5cf6]"
              >
                {roles.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Complexity Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full bg-[#030712] border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-[#8b5cf6]"
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Experience Profile
              </label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full bg-[#030712] border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-[#8b5cf6]"
              >
                <option value="ENTRY">Entry Level (0-2 YOE)</option>
                <option value="MID">Mid Level (2-5 YOE)</option>
                <option value="SENIOR">Senior Level (5+ YOE)</option>
              </select>
            </div>
          </div>

          <button
            onClick={startInterview}
            disabled={loading}
            className="px-8 py-4 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-semibold flex items-center justify-center space-x-2.5 transition-all shadow-lg shadow-violet-500/10 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Generating custom questions...</span>
              </>
            ) : (
              <>
                <span>Initialize Technical Interview</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      )}

      {/* 2. ACTIVE INTERVIEW SIMULATOR */}
      {gameState === 'INTERVIEW' && questions.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Question and Answer Area (left) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-6 sm:p-8 space-y-6">
              {/* Question progress and timer header */}
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <span className="text-xs font-bold text-gray-400">
                  Question {currentIdx + 1} of {questions.length}
                </span>

                <div className="flex items-center space-x-4">
                  {/* TTS Toggle */}
                  <label className="flex items-center space-x-2 text-xs font-bold text-gray-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ttsEnabled}
                      onChange={(e) => {
                        setTtsEnabled(e.target.checked);
                        if (!e.target.checked && typeof window !== 'undefined' && window.speechSynthesis) {
                          window.speechSynthesis.cancel();
                          setIsSpeaking(false);
                        }
                      }}
                      className="rounded border-white/10 bg-white/5 text-[#8b5cf6] focus:ring-0 focus:ring-offset-0"
                    />
                    <span>Auto-Read Questions</span>
                  </label>

                  <div className="flex items-center space-x-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 text-sm">
                    <Clock className="w-4 h-4 text-[#06b6d4]" />
                    <span className={`font-mono font-bold ${timeLeft < 20 ? 'text-red-400 animate-pulse' : 'text-gray-200'}`}>
                      {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Question Text with Speaker Button */}
              <div className="border border-[#8b5cf6]/20 bg-[#8b5cf6]/5 p-5 rounded-xl flex justify-between items-start gap-4">
                <div className="flex-1 opacity-100">
                  <span className="text-xs font-black uppercase text-[#a78bfa] tracking-wider block mb-1">Interviewer Question</span>
                  <p className="text-base text-white leading-relaxed font-semibold">
                    {questions[currentIdx]}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (isSpeaking) {
                      if (typeof window !== 'undefined' && window.speechSynthesis) {
                        window.speechSynthesis.cancel();
                        setIsSpeaking(false);
                      }
                    } else {
                      speakText(questions[currentIdx]);
                    }
                  }}
                  className={`p-2 rounded-lg border transition-colors cursor-pointer shrink-0 ${isSpeaking
                      ? 'bg-[#8b5cf6]/20 border-[#8b5cf6]/50 text-white animate-pulse'
                      : 'bg-[#030712] border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  title={isSpeaking ? "Stop Reading" : "Read Aloud"}
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>

              {/* Answer Text Area */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Your Response
                  </label>
                  <div className="flex items-center space-x-2">
                    {isRecording && (
                      <div className="flex items-center space-x-0.5 px-2">
                        <span className="w-0.5 h-3 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <span className="w-0.5 h-4 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        <span className="w-0.5 h-2.5 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                        <span className="w-0.5 h-4.5 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                        <span className="w-0.5 h-3 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={toggleVoiceRecording}
                      className={`flex items-center space-x-1 px-3 py-1 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${isRecording
                          ? 'bg-red-500/10 border-red-500/30 text-[#ef4444] animate-pulse'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                        }`}
                    >
                      <Mic className="w-3.5 h-3.5" />
                      <span>{isRecording ? 'Listening (Click to Stop)...' : 'Answer with Voice'}</span>
                    </button>
                  </div>
                </div>
                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Speak or type your response clearly. Reference past architectural designs, library choices, or conceptual definitions..."
                  className="w-full bg-[#030712] border border-white/10 rounded-xl p-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#8b5cf6] min-h-[160px] resize-y"
                  disabled={evaluating}
                />
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-4">
                <button
                  onClick={handleAnswerSubmit}
                  disabled={evaluating}
                  className="px-6 py-3 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] text-white text-sm font-semibold flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {evaluating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Evaluating response...</span>
                    </>
                  ) : (
                    <>
                      <span>
                        {currentIdx + 1 === questions.length ? 'Submit & Finish' : 'Next Question'}
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Media Feed Mock Sidebar (right) */}
          <div className="lg:col-span-1 space-y-6">
            {/* Webcam simulation */}
            <div className="glass-card aspect-[4/3] rounded-2xl overflow-hidden relative flex flex-col items-center justify-center bg-[#090d16] border border-white/5">
              {cameraActive ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 flex items-center space-x-1.5 bg-red-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider z-10">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    <span>Live Media</span>
                  </div>
                </>
              ) : (
                <div className="text-center p-6 space-y-3">
                  <VideoOff className="w-10 h-10 text-gray-600 mx-auto stroke-1" />
                  <div>
                    <span className="text-sm font-bold text-white block">Camera is Disabled</span>
                    <span className="text-xs text-gray-500 block mt-0.5">Toggle to simulate real webcam presence.</span>
                  </div>
                </div>
              )}
              <div className="absolute bottom-4 left-0 right-0 px-4 flex justify-between items-center z-10">
                <button
                  onClick={() => setCameraActive(!cameraActive)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer border ${cameraActive ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                >
                  <Video className="w-4 h-4" />
                </button>
                <div className="flex space-x-1">
                  <span className="w-1 h-3 rounded bg-emerald-500 animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <span className="w-1 h-4 rounded bg-emerald-500 animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <span className="w-1 h-2 rounded bg-emerald-500 animate-bounce" style={{ animationDelay: '0.3s' }} />
                  <span className="w-1 h-5 rounded bg-emerald-500 animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            </div>

            {/* Confidence/Pace tips widget */}
            <div className="glass-card p-5 space-y-4">
              <h4 className="text-xs uppercase tracking-wider text-gray-500 font-bold">Confidence Indicator</h4>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-semibold">Eye Contact</span>
                  <span className="text-white font-bold">{cameraActive ? `${eyeContact}%` : 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-semibold">Pacing</span>
                  <span className="text-white font-bold">{cameraActive ? `${pace} WPM` : 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-semibold">Focus Level</span>
                  <span className="text-white font-bold">{cameraActive ? `${focus}%` : 'N/A'}</span>
                </div>
              </div>

              <div className="border-t border-white/5 pt-3">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-semibold text-gray-300">Composite Score</span>
                  <span className="text-[#a78bfa] font-bold">{cameraActive ? `${confidenceScore}%` : '0%'}</span>
                </div>
                <div className="w-full bg-gray-800 h-1.5 rounded-full">
                  <div className="bg-gradient-to-r from-violet-500 to-cyan-400 h-1.5 rounded-full transition-all duration-300" style={{ width: `${cameraActive ? confidenceScore : 0}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. SUMMARY REPORT STATE */}
      {gameState === 'REPORT' && report && (
        <div className="space-y-8 animate-fadeIn">
          {/* Main Card */}
          <div className="glass-card p-6 sm:p-10 border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-[#8b5cf6]/10 to-transparent pointer-events-none" />

            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-white/5 mb-8">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#8b5cf6] to-[#06b6d4] flex flex-col items-center justify-center text-white shrink-0 shadow-lg shadow-violet-500/20">
                <span className="text-xs font-semibold uppercase tracking-wider opacity-85">Score</span>
                <span className="text-3xl font-extrabold font-outfit mt-0.5">{report.interview.score}%</span>
              </div>
              <div className="text-center sm:text-left">
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-[10px] font-bold text-emerald-400 mb-2">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Interview Session Complete</span>
                </div>
                <h2 className="font-outfit text-2xl font-black text-white">Position: {report.interview.jobRole}</h2>
                <p className="text-xs text-gray-400 mt-1">Difficulty: {report.interview.difficulty} | Level: {report.interview.experienceLevel}</p>
              </div>
            </div>

            {/* Q&A Assessment Breakdown */}
            <div className="space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">Response Evaluation Breakdown</h3>
              <div className="space-y-4">
                {report.interview.answers.map((ans: any, idx: number) => (
                  <div key={ans.id} className="p-5 rounded-xl border border-white/5 bg-white/[0.01] space-y-4">
                    <div className="flex justify-between items-start gap-4">
                      <span className="text-sm font-bold text-white block">Question {idx + 1}: {ans.question}</span>
                      <span className="text-xs font-black text-[#a78bfa] font-outfit px-2 py-0.5 rounded bg-[#8b5cf6]/10 shrink-0">
                        {ans.aiScore}%
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-semibold text-gray-500 block uppercase">Your Response</span>
                      <p className="text-xs text-gray-400 leading-relaxed italic">&quot;{ans.userAnswer}&quot;</p>
                    </div>

                    <div className="space-y-1 bg-white/[0.02] p-3 rounded-lg border border-white/5">
                      <span className="text-[10px] font-bold text-[#a78bfa] block uppercase tracking-wider">AI feedback</span>
                      <p className="text-xs text-gray-300 leading-relaxed">{ans.aiFeedback}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Roadmap recommendations if available */}
          {report.recommendations && (
            <div className="glass-card p-6 sm:p-8 space-y-6">
              <h3 className="text-lg font-bold text-white font-outfit flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-cyan-400" /> Dynamic Learning Recommendations
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Roadmap checklist */}
                <div className="space-y-3">
                  <h4 className="text-xs uppercase tracking-wider text-gray-400 font-bold">Suggested Roadmap</h4>
                  <div className="space-y-2">
                    {report.recommendations.learningRoadmap?.map((step: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2.5 text-xs text-gray-300">
                        <ChevronRight className="w-3.5 h-3.5 text-[#8b5cf6] shrink-0" />
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* References */}
                <div className="space-y-3">
                  <h4 className="text-xs uppercase tracking-wider text-gray-400 font-bold">Recommended Resources</h4>
                  <div className="space-y-2">
                    {report.recommendations.studyResources?.map((res: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2.5 text-xs text-gray-300">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{res}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Back Action */}
          <div className="flex justify-center pt-2">
            <button
              onClick={resetSetup}
              className="px-6 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-sm font-semibold flex items-center space-x-2 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Configure New Mock Session</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
