import React, { useState } from 'react';
import ImageUpload from './components/ImageUpload';
import ResultDisplay from './components/ResultDisplay';
import { ImageFile, TransformationMode } from './types';
import { generateTransformedImage } from './services/geminiService';

const App: React.FC = () => {
  const [identityImage, setIdentityImage] = useState<ImageFile | null>(null);
  const [styleImage, setStyleImage] = useState<ImageFile | null>(null);
  const [mode, setMode] = useState<TransformationMode>(TransformationMode.REALISTIC);
  const [prompt, setPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!identityImage) {
      setError("Please upload a User Identity Image.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const result = await generateTransformedImage(
        styleImage ? styleImage.base64 : null,
        styleImage ? styleImage.mimeType : null,
        identityImage.base64,
        identityImage.mimeType,
        mode,
        prompt
      );
      setGeneratedImage(result);
    } catch (err: any) {
      setError(err.message || "Something went wrong during generation.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500/30">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              StyleFusion AI
            </h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-400">
             <span>Powered by Gemini 2.5</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Inputs */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white">Input Configuration</h2>
              <p className="text-slate-400">Upload your images and configure the style transfer settings.</p>
            </div>

            {/* Image Uploaders */}
            <div className="space-y-6">
              <ImageUpload 
                label="1. User Identity Image (Image B)" 
                subLabel="Subject identity, face, pose"
                image={identityImage}
                onImageSelected={setIdentityImage}
                onRemove={() => setIdentityImage(null)}
                required
              />
              
              <ImageUpload 
                label="2. Reference Style Image (Image A)" 
                subLabel="Art style, colors, lighting (Optional for text-only edits)"
                image={styleImage}
                onImageSelected={setStyleImage}
                onRemove={() => setStyleImage(null)}
              />
            </div>

            {/* Settings */}
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-3">Transformation Mode</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-800 p-1 rounded-lg">
                  <button
                    onClick={() => setMode(TransformationMode.REALISTIC)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      mode === TransformationMode.REALISTIC 
                        ? 'bg-indigo-600 text-white shadow-lg' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Realistic
                  </button>
                  <button
                    onClick={() => setMode(TransformationMode.FULL_STYLE)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      mode === TransformationMode.FULL_STYLE 
                        ? 'bg-purple-600 text-white shadow-lg' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Full Style
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {mode === TransformationMode.REALISTIC 
                    ? "Maintains human anatomy and realism while applying style shaders." 
                    : "Transforms the subject into the art style (anime, cartoon, 3D, etc.)."}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Additional Instructions (Text Prompt)
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="E.g., Make the lighting darker, add a retro filter, remove the background..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none h-24"
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !identityImage}
                className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-95 ${
                  isGenerating || !identityImage
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 hover:shadow-indigo-500/25'
                }`}
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                    Generate Image
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <h2 className="text-2xl font-bold text-white">Generated Result</h2>
             <ResultDisplay 
                imageUrl={generatedImage} 
                isLoading={isGenerating} 
                error={error} 
             />
             
             {/* Instructions Panel */}
             {!generatedImage && !isGenerating && !error && (
               <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                 <h3 className="font-semibold text-slate-200 mb-4">How it works</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-indigo-400">
                        <span className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-bold">1</span>
                        <span className="font-medium text-sm">Upload Identity</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Upload the photo of the person you want to transform. This preserves the face and pose.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-purple-400">
                        <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs font-bold">2</span>
                        <span className="font-medium text-sm">Upload Style (Optional)</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Upload a reference image (art, anime, game) to copy its visual style.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-blue-400">
                        <span className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-bold">3</span>
                        <span className="font-medium text-sm">Select Mode</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Choose 'Realistic' for subtle stylistic shading or 'Full Style' for complete transformations.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-pink-400">
                        <span className="w-6 h-6 rounded-full bg-pink-500/20 flex items-center justify-center text-xs font-bold">4</span>
                        <span className="font-medium text-sm">Text Edit</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Use the text box to add filters or specific instructions like "Make it cybernetic".
                      </p>
                    </div>
                 </div>
               </div>
             )}
          </div>
          
        </div>
      </main>
    </div>
  );
};

export default App;
