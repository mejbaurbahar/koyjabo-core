import React from 'react';

interface ChatMessageProps {
    text: string;
    role: 'user' | 'assistant';
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ text, role }) => {
    const cleanText = text.replace(/\*\*/g, '');
    const buttonMatch = cleanText.match(/\[LINKEDIN_BUTTON:(.*?)\]/);

    if (buttonMatch && role === 'assistant') {
        const rawUrl = buttonMatch[1];
        const url = /^https:\/\//i.test(rawUrl) ? rawUrl : '#';
        const textBeforeButton = cleanText.substring(0, buttonMatch.index);

        return (
            <div className="max-w-[85%] rounded-2xl rounded-bl-sm px-4 py-3 text-sm leading-relaxed bg-kj-panel border border-kj-line text-kj-text">
                <div className="whitespace-pre-wrap">{textBeforeButton}</div>
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-3 w-full text-center bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-95"
                >
                    📧 Contact on LinkedIn
                </a>
            </div>
        );
    }

    return (
        <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${role === 'user'
                ? 'bg-kj-primary text-kj-primary-ink rounded-br-sm'
                : 'bg-kj-panel border border-kj-line text-kj-text rounded-bl-sm'
            }`}>
            <div className="whitespace-pre-wrap">{cleanText}</div>
        </div>
    );
};
