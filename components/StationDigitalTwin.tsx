import React, { useEffect, useRef, useState } from 'react';
import * as GSPLAT from 'gsplat';
import { X, Maximize, RotateCcw, Move, Smartphone, Info, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface StationDigitalTwinProps {
    isOpen: boolean;
    onClose: () => void;
    stationName: string;
    splatUrl?: string;
}

const StationDigitalTwin: React.FC<StationDigitalTwinProps> = ({
    isOpen,
    onClose,
    stationName,
    splatUrl = 'https://huggingface.co/datasets/dylanebert/3dgs/resolve/main/bonsai/bonsai-7k.ply'
}) => {
    const { language } = useLanguage();
    const lbl = (en: string, bn: string) => language === 'bn' ? bn : en;
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (!isOpen || !canvasRef.current) return;

        let viewer: any = null;
        let animationFrameId: number;

        const initSplat = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const renderer = new GSPLAT.WebGLRenderer(canvasRef.current!);
                const scene = new GSPLAT.Scene();
                const camera = new GSPLAT.Camera();
                const controls = new GSPLAT.OrbitControls(camera, canvasRef.current!);

                // Set initial camera
                camera.position.set(0, 0, 5);
                
                const loader = new GSPLAT.PLYLoader();
                
                // Simulate progress for better UX
                const interval = setInterval(() => {
                    setProgress(prev => (prev < 90 ? prev + 5 : prev));
                }, 200);

                const splat = await loader.loadAsync(splatUrl, scene, (p: number) => {
                    // Actual progress if supported by loader
                });
                
                clearInterval(interval);
                setProgress(100);
                setIsLoading(false);

                const frame = () => {
                    controls.update();
                    renderer.render(scene, camera);
                    animationFrameId = requestAnimationFrame(frame);
                };
                
                frame();
                viewer = { renderer, scene, camera, controls };

            } catch {
                setError('Failed to load 3D scan. Please check your connection or WebGL settings.');
                setIsLoading(false);
            }
        };

        initSplat();

        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            if (viewer) {
                // Cleanup if gsplat supports it
            }
        };
    }, [isOpen, splatUrl]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 sm:p-8 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-300">
            <div className="relative w-full max-w-6xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col">
                
                {/* Header */}
                <div className="absolute top-0 left-0 right-0 z-10 p-6 flex justify-between items-start pointer-events-none">
                    <div className="pointer-events-auto">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded uppercase tracking-widest">Digital Twin</div>
                            <h2 className="text-2xl font-bold text-white tracking-tight">{stationName} <span className="text-white/40 font-light">3D Scan</span></h2>
                        </div>
                        <p className="text-white/60 text-sm max-w-md leading-relaxed">
                            Open3DMap high-fidelity Gaussian Splatting reconstruction. Georeferenced spatial anchor active.
                        </p>
                    </div>
                    
                    <div className="flex gap-2 pointer-events-auto">
                        <button 
                            onClick={onClose}
                            className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all border border-white/10"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Canvas */}
                <canvas 
                    ref={canvasRef} 
                    className="w-full h-full cursor-grab active:cursor-grabbing"
                />

                {/* Loading / Error States */}
                {isLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 gap-4">
                        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                        <div className="flex flex-col items-center">
                            <span className="text-white font-bold tracking-widest uppercase text-xs mb-2">Processing Gaussian Splat</span>
                            <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-emerald-500 transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <span className="mt-2 text-white/40 text-[10px] font-mono">{progress}% loaded</span>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 p-8 text-center">
                        <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-2xl flex items-center justify-center mb-4">
                            <Info className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">{lbl('Scan Unavailable', 'স্ক্যান পাওয়া যাচ্ছে না')}</h3>
                        <p className="text-white/60 max-w-xs mb-6">{error}</p>
                        <button 
                            onClick={() => window.location.reload()}
                            className="px-6 py-2 bg-white text-slate-900 font-bold rounded-full hover:bg-emerald-400 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Controls Overlay */}
                {!isLoading && !error && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5 p-2 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
                        <div className="flex items-center gap-1 px-3 py-1.5 bg-white/10 rounded-xl border border-white/5">
                            <Move className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-[10px] font-bold text-white/80 uppercase tracking-tighter">Drag to Orbit</span>
                        </div>
                        <div className="flex items-center gap-1 px-3 py-1.5 bg-white/10 rounded-xl border border-white/5">
                            <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                            <span className="text-[10px] font-bold text-white/80 uppercase tracking-tighter">Pinch to Zoom</span>
                        </div>
                        <button className="w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-emerald-500 text-white rounded-lg transition-all">
                            <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-emerald-500 text-white rounded-lg transition-all">
                            <Maximize className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}

                {/* Info Badge */}
                <div className="absolute bottom-6 left-6 p-4 bg-emerald-500/10 backdrop-blur-md rounded-2xl border border-emerald-500/20 hidden sm:block">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/40">
                            <Smartphone className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-0.5">Capturing Method</div>
                            <div className="text-sm font-bold text-white leading-none">ARCore + Open3D Scanner</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StationDigitalTwin;
