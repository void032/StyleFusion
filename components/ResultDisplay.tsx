import React from 'react';

interface ResultDisplayProps {
  imageUrl: string | null;
  isLoading: boolean;
  error: string | null;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ imageUrl, isLoading, error }) => {
  if (error) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center bg-red-900/20 border border-red-500/30 rounded-2xl p-6 text-center">
        <svg className="w-12 h-12 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 className="text-lg font-bold text-red-200 mb-2">Generation Failed</h3>
        <p className="text-red-300 text-sm">{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center bg-slate-800/50 border border-slate-700 rounded-2xl p-6 relative overflow-hidden">
        {/* Animated gradient background for loading state */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent w-[200%] animate-[shimmer_2s_infinite_linear] -translate-x-full"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
          <p className="text-indigo-300 font-medium animate-pulse">Transforming Reality...</p>
          <p className="text-slate-500 text-xs mt-2">Processing styles and identity</p>
        </div>
      </div>
    );
  }

  if (!imageUrl) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center bg-slate-900/50 border border-slate-800 rounded-2xl p-6 border-dashed">
        <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4">
          <svg className="w-10 h-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-slate-500 font-medium">Your masterpiece will appear here</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-4 animate-[fadeIn_0.5s_ease-out]">
      <div className="relative group rounded-2xl overflow-hidden shadow-2xl shadow-indigo-500/20 border border-indigo-500/30">
        <img 
          src={imageUrl} 
          alt="Generated Result" 
          className="w-full h-auto max-h-[700px] object-contain bg-black/40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-6">
          <a 
            href={imageUrl} 
            download={`stylefusion-${Date.now()}.png`}
            className="bg-white text-indigo-900 px-6 py-3 rounded-full font-bold shadow-lg hover:bg-indigo-50 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Image
          </a>
        </div>
      </div>
      <div className="bg-indigo-900/20 border border-indigo-500/20 rounded-lg p-4 flex items-start gap-3">
        <svg className="w-6 h-6 text-indigo-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm text-indigo-200">
          <span className="font-bold">Tip:</span> If the result isn't perfect, try adjusting your text prompt to be more specific about the desired lighting or features, or try the other style mode.
        </p>
      </div>
    </div>
  );
};

export default ResultDisplay;
