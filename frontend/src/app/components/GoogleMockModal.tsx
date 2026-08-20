'use client';

import React, { useState } from 'react';
import { X, ChevronLeft, User, Mail, Loader2, ArrowRight } from 'lucide-react';

interface GoogleMockModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (email: string, name: string) => void;
    isLoading: boolean;
}

export function GoogleMockModal({ isOpen, onClose, onSelect, isLoading }: GoogleMockModalProps) {
    const [step, setStep] = useState<'select' | 'custom'>('select');
    const [customEmail, setCustomEmail] = useState('');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    if (!isOpen) return null;

    const defaultAccounts = [
        { email: 'guest.developer@gmail.com', name: 'Guest Developer', initial: 'G', bgColor: 'bg-gradient-to-br from-indigo-500 to-purple-600' },
        { email: 'demo.candidate@gmail.com', name: 'Demo Candidate', initial: 'D', bgColor: 'bg-gradient-to-br from-emerald-500 to-teal-600' },
        { email: 'chitta.pramodh@gmail.com', name: 'Chitta Pramodh', initial: 'C', bgColor: 'bg-gradient-to-br from-cyan-500 to-blue-600' }
    ];

    const handleAccountClick = (email: string, name: string) => {
        onSelect(email, name);
    };

    const handleCustomSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);

        if (!customEmail) {
            setErrorMsg('Email address is required.');
            return;
        }

        if (!customEmail.includes('@') || !customEmail.includes('.')) {
            setErrorMsg('Please enter a valid Google Account email.');
            return;
        }

        // Generate formatted name from email prefix
        const prefix = customEmail.split('@')[0];
        const parts = prefix.split(/[\._-]/);
        const formattedName = parts
            .map(part => part.charAt(0).toUpperCase() + part.slice(1))
            .join(' ');

        onSelect(customEmail, formattedName || 'Google User');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm transition-all duration-300 animate-in fade-in">
            <div className="w-full max-w-[420px] bg-[#f8f9fa] text-gray-800 rounded-lg shadow-2xl overflow-hidden border border-gray-200 font-sans mx-4 scale-in duration-200">

                {/* Header/Close */}
                <div className="flex justify-end p-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="p-1.5 hover:bg-gray-200 rounded-full text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Google Logo */}
                <div className="flex flex-col items-center px-8 pb-3">
                    <div className="flex justify-center items-center mb-4 text-2xl font-bold tracking-tight select-none">
                        <span className="text-[#4285F4]">G</span>
                        <span className="text-[#EA4335]">o</span>
                        <span className="text-[#FBBC05]">o</span>
                        <span className="text-[#4285F4]">g</span>
                        <span className="text-[#34A853]">l</span>
                        <span className="text-[#EA4335]">e</span>
                    </div>

                    {isLoading ? (
                        <div className="flex flex-col items-center py-10">
                            <Loader2 className="w-10 h-10 animate-spin text-[#4285F4]" />
                            <p className="mt-4 text-sm font-medium text-gray-500 select-none">Connecting to Google Accounts...</p>
                        </div>
                    ) : (
                        <>
                            {step === 'select' ? (
                                <>
                                    <h3 className="text-xl font-medium text-[#202124] select-none text-center">Choose an account</h3>
                                    <p className="text-sm text-[#5f6368] mt-1 mb-6 select-none text-center">to continue to MockMaster</p>

                                    {/* Accounts List */}
                                    <div className="w-full border-t border-b border-gray-200 divide-y divide-gray-150 max-h-[220px] overflow-y-auto">
                                        {defaultAccounts.map((account) => (
                                            <button
                                                key={account.email}
                                                type="button"
                                                onClick={() => handleAccountClick(account.email, account.name)}
                                                className="w-full flex items-center px-4 py-3 hover:bg-gray-100/80 transition-colors text-left font-sans cursor-pointer group"
                                            >
                                                <div className={`w-8 h-8 rounded-full ${account.bgColor} flex items-center justify-center text-white text-xs font-bold mr-3 shadow-sm`}>
                                                    {account.initial}
                                                </div>
                                                <div className="flex-1 overflow-hidden">
                                                    <p className="text-sm font-semibold text-gray-700 truncate group-hover:text-[#1a73e8] transition-colors">{account.name}</p>
                                                    <p className="text-xs text-gray-500 truncate">{account.email}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>

                                    {/* Use another account option */}
                                    <button
                                        type="button"
                                        onClick={() => setStep('custom')}
                                        className="w-full flex items-center px-4 py-3.5 hover:bg-gray-100/80 transition-colors text-left text-sm text-[#1a73e8] hover:text-[#174ea6] font-medium cursor-pointer"
                                    >
                                        <div className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center mr-3 bg-white text-gray-500 group-hover:bg-[#1a73e8]/5">
                                            <User className="w-4 h-4" />
                                        </div>
                                        <span>Use another Google Account</span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="w-full flex items-center mb-4">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setStep('select');
                                                setErrorMsg(null);
                                            }}
                                            className="flex items-center text-xs font-semibold text-[#1a73e8] hover:text-[#174ea6] transition-colors gap-1 cursor-pointer"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                            <span>Back to list</span>
                                        </button>
                                    </div>

                                    <h3 className="text-xl font-medium text-[#202124] select-none text-left w-full">Sign in</h3>
                                    <p className="text-sm text-[#5f6368] mt-1 mb-6 select-none text-left w-full">with your Google Account</p>

                                    <form onSubmit={handleCustomSubmit} className="w-full space-y-4">
                                        {errorMsg && (
                                            <div className="p-2.5 rounded bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
                                                {errorMsg}
                                            </div>
                                        )}

                                        <div className="relative">
                                            <Mail className="absolute top-1/2 left-3 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="email"
                                                placeholder="Google Email (e.g. name@gmail.com)"
                                                value={customEmail}
                                                onChange={(e) => setCustomEmail(e.target.value)}
                                                className="w-full bg-white border border-gray-300 hover:border-gray-400 focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] rounded py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition-all"
                                                autoFocus
                                            />
                                        </div>

                                        <div className="flex justify-end pt-2 pb-4">
                                            <button
                                                type="submit"
                                                className="px-6 py-2 bg-[#1a73e8] hover:bg-[#1557b0] active:bg-[#174ea6] text-white rounded text-sm font-semibold flex items-center gap-1.5 shadow transition-all cursor-pointer"
                                            >
                                                <span>Next</span>
                                                <ArrowRight className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </form>
                                </>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-gray-100/60 px-6 py-4 flex items-center justify-between text-xs text-[#5f6368] select-none border-t border-gray-200">
                    <span>Google Mock Server</span>
                    <div className="flex gap-3">
                        <span className="hover:underline cursor-pointer">Help</span>
                        <span className="hover:underline cursor-pointer">Privacy</span>
                        <span className="hover:underline cursor-pointer">Terms</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
