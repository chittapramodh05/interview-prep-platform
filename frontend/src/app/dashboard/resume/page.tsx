'use client';

import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  Loader2, 
  ArrowRight,
  RefreshCw,
  Award
} from 'lucide-react';

export default function ResumePage() {
  const [targetRole, setTargetRole] = useState('Frontend Developer');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Results
  const [report, setReport] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  const roles = [
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'DevOps Engineer',
    'Data Scientist',
    'Cybersecurity Analyst'
  ];

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await api.get('/resume/history');
      setHistory(response.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf') {
        setErrorMsg('Only PDF files are supported.');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setErrorMsg(null);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMsg('Please select a PDF resume first.');
      return;
    }

    setUploading(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('targetRole', targetRole);

    try {
      const response = await api.post('/resume/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setReport(response.data.data.report);
      fetchHistory(); // Refresh history list
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Error parsing and scoring resume.');
    } finally {
      setUploading(false);
    }
  };

  const selectHistoricReport = (historicItem: any) => {
    if (historicItem.atsReport) {
      setReport(historicItem.atsReport);
    } else {
      setErrorMsg('This uploaded resume has no report.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Upload Column */}
      <div className="lg:col-span-1 space-y-6">
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-white mb-4 font-outfit">Upload Resume</h3>
          
          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleUploadSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                Target Role
              </label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full bg-[#030712] border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-[#8b5cf6]"
              >
                {roles.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                Resume PDF
              </label>
              <div className="relative border-2 border-dashed border-white/10 hover:border-[#8b5cf6]/50 rounded-xl p-6 text-center cursor-pointer transition-colors bg-white/[0.01]">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="space-y-2">
                  <Upload className="w-8 h-8 mx-auto text-gray-500" />
                  <p className="text-xs text-gray-400">
                    {file ? (
                      <span className="text-[#a78bfa] font-semibold">{file.name}</span>
                    ) : (
                      'Drag and drop or click to browse'
                    )}
                  </p>
                  <p className="text-[10px] text-gray-600">Supports PDF format up to 5MB</p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full py-3 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] text-white text-sm font-semibold flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>AI Scanning...</span>
                </>
              ) : (
                <>
                  <span>Scan Resume Compatibility</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Scan History list */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wider text-gray-400 font-outfit">Upload History</h3>
          {history.length === 0 ? (
            <p className="text-xs text-gray-600">No resumes analyzed yet.</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => selectHistoricReport(item)}
                  className="p-3 rounded-lg border border-white/5 bg-white/[0.01] hover:bg-white/5 transition-all cursor-pointer flex justify-between items-center"
                >
                  <div className="flex items-center space-x-2 overflow-hidden">
                    <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div className="overflow-hidden">
                      <span className="text-xs font-bold text-white block truncate">{item.fileName}</span>
                      <span className="text-[10px] text-gray-500 block truncate">{item.atsReport?.targetRole || 'Analyzed'}</span>
                    </div>
                  </div>
                  {item.atsReport && (
                    <span className="text-xs font-black text-[#a78bfa] font-outfit px-2 py-0.5 rounded bg-[#8b5cf6]/10 border border-[#8b5cf6]/10">
                      {item.atsReport.score}%
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Analysis Output Results Column */}
      <div className="lg:col-span-2">
        {report ? (
          <div className="glass-card p-6 sm:p-8 space-y-8 animate-fadeIn">
            {/* Score dial header */}
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-white/5">
              <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="56" cy="56" r="48" className="stroke-gray-800" strokeWidth="6" fill="transparent" />
                  <circle 
                    cx="56" 
                    cy="56" 
                    r="48" 
                    className="stroke-[#8b5cf6]" 
                    strokeWidth="6" 
                    fill="transparent" 
                    strokeDasharray="301" 
                    strokeDashoffset={301 - (301 * report.score) / 100} 
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="font-outfit text-3xl font-extrabold text-white">{report.score}%</span>
                </div>
              </div>

              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-[#8b5cf6]/30 bg-[#8b5cf6]/5 text-[10px] font-bold text-[#a78bfa] mb-2">
                  <Award className="w-3.5 h-3.5" />
                  <span>ATS Report Available</span>
                </div>
                <h2 className="font-outfit text-xl font-bold text-white">Target Role: {report.targetRole}</h2>
                <p className="text-xs text-gray-500 mt-1">Processed: {new Date(report.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Raw Summary */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">Analysis Summary</h3>
              <p className="text-sm text-gray-300 leading-relaxed bg-white/[0.01] p-4 rounded-xl border border-white/5">{report.rawFeedback}</p>
            </div>

            {/* Extracted vs Missing keywords grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Extracted */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Detected Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(report.skillsExtracted as string[])?.map((skill, idx) => (
                    <span key={idx} className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Missing keywords */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-400" /> Missing Keywords
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(report.missingKeywords as string[])?.map((kw, idx) => (
                    <span key={idx} className="text-xs px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 font-semibold">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Improvement Tips */}
            <div className="space-y-3 pt-4 border-t border-white/5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">Improvement Checklist</h3>
              <div className="space-y-2">
                {(report.improvementTips as string[])?.map((tip, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-sm text-gray-300 leading-relaxed">
                    <span className="inline-flex shrink-0 w-5 h-5 rounded-full bg-[#8b5cf6]/10 text-[#a78bfa] items-center justify-center font-bold text-xs mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-card h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 border border-white/5 bg-white/[0.01]">
            <FileText className="w-16 h-16 text-gray-600 mb-4 stroke-1" />
            <h3 className="text-lg font-bold text-white font-outfit">No Analysis Loaded</h3>
            <p className="text-sm text-gray-500 max-w-sm mt-1 leading-relaxed">
              Upload your resume in PDF format in the side panel or select a previously analyzed resume to view details.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
