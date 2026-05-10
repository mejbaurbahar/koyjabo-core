import React from 'react';
import { Share2, Facebook, Twitter, Linkedin, MessageCircle } from 'lucide-react';

interface SocialShareProps {
    className?: string;
}

const SocialShare: React.FC<SocialShareProps> = ({ className = '' }) => {
    const shareUrl = 'https://koyjabo.com/';
    const shareTitle = 'কই যাবো - Dhaka Bus Route Finder | Bangladesh Transport';
    const shareText = 'Find all Dhaka bus routes instantly. 200+ buses, Metro Rail, intercity routes with AI. Free & offline!';

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: shareTitle,
                    text: shareText,
                    url: shareUrl,
                });
            } catch { /* share dismissed */ }
        }
    };

    const handleFacebookShare = () => {
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        window.open(facebookUrl, '_blank', 'width=600,height=400');
    };

    const handleTwitterShare = () => {
        const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
        window.open(twitterUrl, '_blank', 'width=600,height=400');
    };

    const handleLinkedInShare = () => {
        const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        window.open(linkedInUrl, '_blank', 'width=600,height=400');
    };

    const handleWhatsAppShare = () => {
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">Share:</span>

            {/* Native Share (Mobile) */}
            {navigator.share && (
                <button
                    onClick={handleShare}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    title="Share KoyJabo"
                    aria-label="Share KoyJabo"
                >
                    <Share2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
            )}

            {/* Facebook */}
            <button
                onClick={handleFacebookShare}
                className="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                title="Share on Facebook"
                aria-label="Share on Facebook"
            >
                <Facebook className="w-5 h-5 text-[#1877F2]" />
            </button>

            {/* Twitter */}
            <button
                onClick={handleTwitterShare}
                className="p-2 rounded-full hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-colors"
                title="Share on Twitter"
                aria-label="Share on Twitter"
            >
                <Twitter className="w-5 h-5 text-[#1DA1F2]" />
            </button>

            {/* LinkedIn */}
            <button
                onClick={handleLinkedInShare}
                className="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                title="Share on LinkedIn"
                aria-label="Share on LinkedIn"
            >
                <Linkedin className="w-5 h-5 text-[#0A66C2]" />
            </button>

            {/* WhatsApp */}
            <button
                onClick={handleWhatsAppShare}
                className="p-2 rounded-full hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                title="Share on WhatsApp"
                aria-label="Share on WhatsApp"
            >
                <MessageCircle className="w-5 h-5 text-[#25D366]" />
            </button>
        </div>
    );
};

export default SocialShare;
