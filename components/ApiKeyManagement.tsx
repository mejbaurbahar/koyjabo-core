import React from 'react';
import { X, Bot, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface ApiKeyManagementProps {
    onClose: () => void;
}

const ApiKeyManagement: React.FC<ApiKeyManagementProps> = ({ onClose }) => {
    const { language } = useLanguage();
    const lbl = (en: string, bn: string) => language === 'bn' ? bn : en;
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-kj-panel rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto relative">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-kj-text-faint hover:text-kj-text-dim dark:hover:text-gray-200 transition-colors z-10"
                    aria-label="Close"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Content */}
                <div className="p-8">
                    {/* Icon */}
                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white mb-6 mx-auto shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30">
                        <Bot className="w-10 h-10" />
                    </div>

                    {/* Title */}
                    <h2 className="text-3xl font-bold text-center text-kj-text mb-3">
                        🤖 Koy Jabo AI Assistant
                    </h2>

                    <p className="text-center text-kj-text-dim mb-6">
                        Built-in Intelligence, Ready to Help
                    </p>

                    {/* Features */}
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-2xl p-6 mb-6 border border-kj-primary/30">
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-kj-primary shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-bold text-kj-text mb-1">{lbl('Always Available', 'সবসময় উপলব্ধ')}</h3>
                                    <p className="text-sm text-kj-text-dim">
                                        Our AI assistant is built into Koy Jabo and ready to help you 24/7
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-kj-primary shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-bold text-kj-text mb-1">{lbl('No Setup Required', 'কোনো সেটআপ লাগবে না')}</h3>
                                    <p className="text-sm text-kj-text-dim">
                                        No API keys, no configuration - just ask your questions naturally
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-kj-primary shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-bold text-kj-text mb-1">Bilingual Support</h3>
                                    <p className="text-sm text-kj-text-dim">
                                        Ask questions in English or Bengali - whatever feels natural to you
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-kj-primary shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-bold text-kj-text mb-1">{lbl('Completely Free', 'সম্পূর্ণ বিনামূল্যে')}</h3>
                                    <p className="text-sm text-kj-text-dim">
                                        Unlimited queries, no subscriptions, no hidden costs
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4 mb-6 border border-blue-100 dark:border-blue-800">
                        <p className="text-sm text-blue-900 text-kj-primary text-center">
                            <strong>Note:</strong> The Koy Jabo AI Assistant is our official intelligent route-finding system. No API key management needed!
                        </p>
                    </div>

                    {/* CTA Button */}
                    <button
                        onClick={onClose}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30 active:scale-95"
                    >
                        Got It!
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ApiKeyManagement;
