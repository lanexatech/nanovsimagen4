import React, { useState, useCallback, useEffect } from 'react';
import PromptInput from './components/PromptInput';
import ImageDisplay from './components/ImageDisplay';
import ImageModal from './components/ImageModal';
import PromptModal from './components/PromptModal';
import { generateImage } from './services/geminiService';
import { SpinnerIcon } from './components/icons/SpinnerIcon';
import { CanvasPlaceholder } from './components/CanvasPlaceholder';
import { useTranslation } from './hooks/useTranslation';
import Toast from './components/Toast';

const LoadingIndicator: React.FC<{ t: (key: string) => string }> = ({ t }) => (
  <div className="flex flex-col items-center justify-center text-center text-gray-300">
    <SpinnerIcon className="w-12 h-12 mb-4" />
    <h3 className="text-xl font-semibold">{t('loading_title')}</h3>
    <p className="mt-1">{t('loading_description')}</p>
  </div>
);

const ErrorDisplay: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center text-center text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-6 w-full max-w-md" role="alert">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <h3 className="text-xl font-semibold">Oops! Something went wrong.</h3>
    <p className="mt-1">{message}</p>
  </div>
);

const App: React.FC = () => {
  const { lang, setLang, t } = useTranslation();
  const [prompt, setPrompt] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  const [selectedModel, setSelectedModel] = useState<string>('imagen-4.0-generate-001');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState<boolean>(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedImageMimeType, setUploadedImageMimeType] = useState<string | null>(null);
  const [imagen4Result, setImagen4Result] = useState<{ imageUrl: string; aspectRatio: string } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (selectedModel !== 'gemini-2.5-flash-image-preview') {
      setUploadedImage(null);
      setUploadedImageMimeType(null);
    }

    if (selectedModel === 'gemini-2.5-flash-image-preview') {
      setGeneratedImage(null);
    } else if (selectedModel === 'imagen-4.0-generate-001') {
      if (imagen4Result) {
        setGeneratedImage(imagen4Result.imageUrl);
        setAspectRatio(imagen4Result.aspectRatio);
      } else {
        setGeneratedImage(null);
      }
    }
  }, [selectedModel, imagen4Result]);

  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setToastMessage(t('error_invalid_image_file'));
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImage(reader.result as string);
      setUploadedImageMimeType(file.type);
    };
    reader.onerror = () => {
      setToastMessage(t('error_read_file'));
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setUploadedImage(null);
    setUploadedImageMimeType(null);
  };

  const handleGenerateImage = useCallback(async () => {
    if (!prompt.trim() && !uploadedImage) {
      setToastMessage(t('error_prompt_or_image_required'));
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const imageToEdit = uploadedImage && uploadedImageMimeType 
        ? { data: uploadedImage.split(',')[1], mimeType: uploadedImageMimeType } 
        : undefined;
        
      const base64Image = await generateImage(prompt, aspectRatio, selectedModel, imageToEdit);
      const imageUrl = `data:image/png;base64,${base64Image}`;
      setGeneratedImage(imageUrl);

      if (selectedModel === 'imagen-4.0-generate-001') {
        setImagen4Result({ imageUrl, aspectRatio });
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? t(err.message) : t('error_unknown');
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [prompt, aspectRatio, selectedModel, uploadedImage, uploadedImageMimeType, t]);

  const handleSavePrompt = (newPrompt: string) => {
    setPrompt(newPrompt);
    setIsPromptModalOpen(false);
  };

  const isNanoBanana = selectedModel === 'gemini-2.5-flash-image-preview';

  const renderRightCanvasContent = () => {
    if (isLoading) return <LoadingIndicator t={t} />;
    if (error) return <ErrorDisplay message={error} />;
    
    if (generatedImage) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center animate-fade-in">
           {isNanoBanana && <p className="text-sm font-semibold text-cyan-400 mb-2 text-center">{t('after_label')}</p>}
           <ImageDisplay
              imageUrl={generatedImage}
              prompt={prompt}
              onImageClick={() => setIsModalOpen(true)}
            />
        </div>
      );
    }

    if (isNanoBanana && uploadedImage) return null;
    
    return <CanvasPlaceholder />;
  };
  
  const renderMobileCanvas = () => {
    if(isLoading) return <LoadingIndicator t={t} />;
    if(error) return <ErrorDisplay message={error} />;
    if(isNanoBanana && (uploadedImage || generatedImage)){
      return (
        <div className="w-full flex flex-col items-center justify-center gap-8 p-4">
          {uploadedImage && (
            <div className="w-full max-w-xl animate-fade-in">
              <p className="text-sm font-semibold text-gray-400 mb-2 text-center">{t('before_label')}</p>
              <img src={uploadedImage} alt={t('reference_image_alt')} className="rounded-lg shadow-lg w-full h-auto object-contain" />
            </div>
          )}
          {generatedImage && (
             <div className="w-full max-w-xl animate-fade-in">
               <p className="text-sm font-semibold text-cyan-400 mb-2 text-center">{t('after_label')}</p>
               <ImageDisplay imageUrl={generatedImage} prompt={prompt} onImageClick={() => setIsModalOpen(true)} />
             </div>
          )}
        </div>
      )
    }
    if(generatedImage){
       return <ImageDisplay imageUrl={generatedImage} prompt={prompt} onImageClick={() => setIsModalOpen(true)} />
    }
    return <CanvasPlaceholder />;
  }

  return (
    <main className="h-screen w-full bg-gradient-to-br from-[#0a192f] via-[#112240] to-[#2a0e4a] text-gray-200 flex flex-col lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-x-6 lg:p-6 overflow-hidden">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

      <div className="relative h-full hidden lg:flex items-center justify-center p-6">
        {isNanoBanana && uploadedImage && (
           <div className="w-full max-w-xl animate-fade-in">
              <p className="text-sm font-semibold text-gray-400 mb-2 text-center">{t('before_label')}</p>
              <img 
                src={uploadedImage} 
                alt={t('reference_image_alt')}
                className="rounded-lg shadow-lg w-full h-auto object-contain max-h-[85vh]"
              />
            </div>
        )}
      </div>

      <div className="relative z-10 w-full max-w-xl mx-auto lg:w-[520px] lg:max-w-none h-full bg-black/10 backdrop-blur-2xl flex flex-col shadow-2xl overflow-y-auto no-scrollbar lg:rounded-2xl flex-shrink-0">
         <PromptInput
            prompt={prompt}
            setPrompt={setPrompt}
            aspectRatio={aspectRatio}
            setAspectRatio={setAspectRatio}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            onSubmit={handleGenerateImage}
            isLoading={isLoading}
            onImageUpload={handleImageUpload}
            showUploaderFrame={isNanoBanana}
            onPromptClick={() => setIsPromptModalOpen(true)}
            lang={lang}
            setLang={setLang}
            t={t}
          />
      </div>
      
      <div className="relative h-full hidden lg:flex items-center justify-center p-6">
        {renderRightCanvasContent()}
      </div>

      <div className="relative flex-grow lg:hidden flex items-center justify-center p-4 overflow-y-auto">
        {renderMobileCanvas()}
      </div>

      <ImageModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        imageUrl={generatedImage}
        prompt={prompt}
        t={t}
      />

      <PromptModal
        isOpen={isPromptModalOpen && isNanoBanana}
        onClose={() => setIsPromptModalOpen(false)}
        currentPrompt={prompt}
        onSave={handleSavePrompt}
        t={t}
      />
      
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </main>
  );
};

export default App;