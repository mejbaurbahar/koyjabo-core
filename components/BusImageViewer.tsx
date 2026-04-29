import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ImageIcon, X, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { getBusImagePath } from '../utils/busImageMapper';
import { useLanguage } from '../contexts/LanguageContext';
import { getBusPhotos, BusPhoto } from '../services/communityDataService';

interface BusImageViewerProps {
    busId: string;
    busName: string;
    busBnName?: string;
    isCompact?: boolean;
}

export const BusImageViewer: React.FC<BusImageViewerProps> = ({ busId, busName, busBnName, isCompact = false }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [communityImages, setCommunityImages] = useState<BusPhoto[]>([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const { t } = useLanguage();

    const imagePath = getBusImagePath(busName, busBnName);
    const currentCommunityImage = communityImages[currentImageIndex]?.dataUrl ?? null;
    const displayImage = currentCommunityImage || imagePath || '/default-bus.svg';

    // Reset image error when modal closes or bus changes
    useEffect(() => {
        if (!isModalOpen) {
            setImageError(false);
        }
    }, [isModalOpen]);

    useEffect(() => {
        setImageError(false);
    }, [busName, busBnName]);

    useEffect(() => {
        const loadCommunityImage = async () => {
            try {
                const photos = await getBusPhotos(busId);
                setCommunityImages(photos);
                setCurrentImageIndex(0);
            } catch {
                setCommunityImages([]);
            }
        };
        void loadCommunityImage();
    }, [busId, isModalOpen]);

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setImageError(false); // Reset error state when closing
    };

    return (
        <>
            {/* Image Icon Button */}
            <button
                onClick={() => setIsModalOpen(true)}
                className={`flex items-center justify-center gap-2 ${isCompact ? 'p-2.5 rounded-xl' : 'px-3 py-2 rounded-lg'} bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200 text-sm font-medium active:scale-95`}
                title={t('busDetails.viewBusImage')}
            >
                {isCompact && displayImage !== '/default-bus.svg' ? (
                    <img src={displayImage} alt="thumbnail" className="w-6 h-6 rounded-md object-cover ring-1 ring-white/50 bg-white/20" />
                ) : (
                    <ImageIcon className={isCompact ? 'w-5 h-5' : 'w-4 h-4'} />
                )}
                {!isCompact && (
                    <>
                        <span className="hidden sm:inline">{t('busDetails.viewBusImage')}</span>
                        <span className="sm:hidden">{t('busDetails.viewBusImageShort')}</span>
                    </>
                )}
            </button>

            {/* Modal - Rendered via Portal */}
            {isModalOpen && createPortal(
                <div
                    className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={handleCloseModal}
                >
                    <div
                        className="relative max-w-4xl w-full bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-500 to-blue-600">
                            <div>
                                <h3 className="text-xl font-bold text-white">{busName}</h3>
                                {busBnName && (
                                    <p className="text-sm text-blue-100">{busBnName}</p>
                                )}
                            </div>
                            <button
                                onClick={handleCloseModal}
                                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                                aria-label="Close"
                            >
                                <X className="w-6 h-6 text-white" />
                            </button>
                        </div>

                        {/* Image Container */}
                        <div className="p-6 bg-gray-50 dark:bg-slate-900">
                            <div className="relative w-full group flex items-center justify-center">
                                {communityImages.length > 1 && currentImageIndex > 0 && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => prev - 1); }}
                                        className="absolute left-2 z-10 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <ChevronLeft className="w-6 h-6" />
                                    </button>
                                )}
                                <img
                                    src={imageError ? '/default-bus.svg' : displayImage}
                                    alt={`${busName} - ${busBnName || ''}`}
                                    className="w-full h-auto max-h-[70vh] object-contain rounded-lg shadow-lg select-none"
                                    onError={() => setImageError(true)}
                                    loading="lazy"
                                />
                                {communityImages.length > 1 && currentImageIndex < communityImages.length - 1 && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => prev + 1); }}
                                        className="absolute right-2 z-10 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <ChevronRight className="w-6 h-6" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-gray-100 dark:bg-slate-800 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                                {imageError
                                    ? t('busDetails.imageNotFound')
                                    : communityImages.length > 0
                                        ? `${t('busDetails.realBusImage')} · Community (${currentImageIndex + 1}/${communityImages.length})`
                                        : t('busDetails.realBusImage')}
                            </p>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};

export default BusImageViewer;
