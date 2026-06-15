import React, { useState } from 'react';
import { ArrowLeft, MessageSquare, Mail, Phone, Github, Send } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import SponsoredAdSlot from './SponsoredAdSlot';
import { AppView } from '../types';

interface ContactUsProps {
    view: AppView;
    setView: (view: AppView) => void;
}

const ContactUs: React.FC<ContactUsProps> = ({ view, setView }) => {
    const { language } = useLanguage();
    const lbl = (en: string, bn: string) => language === 'bn' ? bn : en;
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

    const contactMethods = [
        {
            icon: '💬',
            title: lbl('Live Chat', 'লাইভ চ্যাট'),
            detail: lbl('9am – 6pm, Sun – Thu', 'সকাল ৯টা – সন্ধ্যা ৬টা, রবি – বৃহস্পতি'),
            pill: lbl('Online', 'অনলাইন'),
            pillColor: '#10b981',
        },
        {
            icon: '✉️',
            title: lbl('Email', 'ইমেইল'),
            detail: 'koyjabo.bd@gmail.com',
            pill: null,
            pillColor: '',
        },
        {
            icon: '📞',
            title: lbl('Hotline', 'হটলাইন'),
            detail: '+880 1700-000000',
            pill: null,
            pillColor: '',
        },
        {
            icon: '🐙',
            title: lbl('GitHub Issues', 'গিটহাব ইস্যু'),
            detail: 'github.com/fagun18/Dhaka-Commute',
            pill: null,
            pillColor: '',
        },
    ];

    return (
        <div
            className="flex flex-col flex-1 min-h-0 bg-transparent overflow-y-auto overscroll-y-contain touch-pan-y w-full relative"
            style={{ WebkitOverflowScrolling: 'touch' }}
        >
            {/* Sticky back bar */}
            <div className="sticky top-0 z-20 flex items-center gap-3 px-4 py-3 bg-kj-panel/80 backdrop-blur-md border-b border-kj-line shadow-sm">
                <button
                    onClick={() => setView('home' as AppView)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center bg-kj-chip-bg hover:bg-kj-primary-soft text-kj-text-dim hover:text-kj-primary transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <span className="font-black text-kj-text text-sm tracking-tight">
                    {lbl('Contact us', 'যোগাযোগ')}
                </span>
            </div>

            <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-32 w-full space-y-8">

                {/* Hero */}
                <div className="text-center pt-2">
                    <h1 className="text-2xl sm:text-3xl font-black text-kj-text mb-2 leading-tight">
                        {lbl("We’d love to hear from you", 'আমরা আপনার কথা শুনতে চাই')}
                    </h1>
                    <p className="text-sm text-kj-text-dim max-w-md mx-auto">
                        {lbl(
                            'Bug reports, feature ideas, or partnership — reach us any way you like.',
                            'বাগ রিপোর্ট, ফিচার আইডিয়া বা পার্টনারশিপের জন্য যেকোনো উপায়ে যোগাযোগ করুন।'
                        )}
                    </p>
                </div>

                {/* Contact method cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {contactMethods.map((m, i) => (
                        <div key={i} className="dc-card p-5 rounded-2xl border border-kj-line flex items-start gap-4 hover:-translate-y-0.5 transition-transform">
                            <span className="text-2xl leading-none mt-0.5">{m.icon}</span>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-sm text-kj-text">{m.title}</span>
                                    {m.pill && (
                                        <span
                                            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
                                            style={{ background: m.pillColor + '22', color: m.pillColor }}
                                        >
                                            <span
                                                className="w-1.5 h-1.5 rounded-full animate-pulse"
                                                style={{ background: m.pillColor }}
                                            />
                                            {m.pill}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-kj-text-dim break-all">{m.detail}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <SponsoredAdSlot language={language as 'en' | 'bn'} size="728x90" compact />

                {/* Send a message */}
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-kj-text-faint mb-3">
                        {lbl('Send a message', 'একটি বার্তা পাঠান')}
                    </p>
                    <div className="dc-card p-5 sm:p-6 rounded-2xl border border-kj-line space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-kj-text-faint mb-1.5">
                                    {lbl('Name', 'নাম')}
                                </label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    className="w-full rounded-xl px-3 py-2.5 text-sm text-kj-text border border-kj-line focus:outline-none focus:ring-2 focus:ring-kj-primary/40"
                                    style={{ background: 'var(--kj-input-bg, var(--kj-chip-bg))' }}
                                    placeholder={lbl('Your name', 'আপনার নাম')}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-kj-text-faint mb-1.5">
                                    {lbl('Email', 'ইমেইল')}
                                </label>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                    className="w-full rounded-xl px-3 py-2.5 text-sm text-kj-text border border-kj-line focus:outline-none focus:ring-2 focus:ring-kj-primary/40"
                                    style={{ background: 'var(--kj-input-bg, var(--kj-chip-bg))' }}
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-kj-text-faint mb-1.5">
                                {lbl('Subject', 'বিষয়')}
                            </label>
                            <input
                                type="text"
                                value={form.subject}
                                onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                                className="w-full rounded-xl px-3 py-2.5 text-sm text-kj-text border border-kj-line focus:outline-none focus:ring-2 focus:ring-kj-primary/40"
                                style={{ background: 'var(--kj-input-bg, var(--kj-chip-bg))' }}
                                placeholder={lbl('What\'s this about?', 'কী বিষয়ে?')}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-kj-text-faint mb-1.5">
                                {lbl('Message', 'বার্তা')}
                            </label>
                            <textarea
                                value={form.message}
                                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                                rows={4}
                                style={{ minHeight: 80, background: 'var(--kj-input-bg, var(--kj-chip-bg))' }}
                                className="w-full rounded-xl px-3 py-2.5 text-sm text-kj-text border border-kj-line focus:outline-none focus:ring-2 focus:ring-kj-primary/40 resize-none"
                                placeholder={lbl('Write your message…', 'আপনার বার্তা লিখুন…')}
                            />
                        </div>
                        <button
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm text-white shadow-lg hover:opacity-90 transition-opacity"
                            style={{ background: 'linear-gradient(135deg, var(--kj-primary) 0%, var(--kj-neon-violet, #7c3aed) 100%)' }}
                            onClick={() => {
                                window.location.href = `mailto:koyjabo.bd@gmail.com?subject=${encodeURIComponent(form.subject)}&body=${encodeURIComponent(`From: ${form.name} <${form.email}>\n\n${form.message}`)}`;
                            }}
                        >
                            <Send className="w-4 h-4" />
                            {lbl('Send message', 'বার্তা পাঠান')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactUs;
