import React, { useRef, useState, useCallback, useEffect } from 'react';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { UploadIcon } from './icons/UploadIcon';
import { SaveIcon } from './icons/SaveIcon';

interface PromptInputProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  aspectRatio: string;
  setAspectRatio: (ratio: string) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  onImageUpload: (file: File) => void;
  showUploaderFrame: boolean;
  onPromptClick: () => void;
  lang: string;
  setLang: (lang: 'en' | 'id') => void;
  t: (key: string) => string;
}

const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    try {
      media.addEventListener('change', listener);
    } catch (e) {
      media.addListener(listener);
    }
    
    return () => {
      try {
        media.removeEventListener('change', listener);
      } catch (e) {
        media.removeListener(listener);
      }
    };
  }, [matches, query]);

  return matches;
};

interface AspectRatioButtonProps {
  ratio: string;
  current: string;
  onClick: (ratio: string) => void;
  disabled: boolean;
}

const AspectRatioButton = ({ ratio, current, onClick, disabled }: AspectRatioButtonProps) => (
  <button
    onClick={() => onClick(ratio)}
    disabled={disabled}
    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
      current === ratio
        ? 'bg-cyan-500 text-white shadow-md'
        : 'bg-white/10 hover:bg-white/20 text-gray-300'
    } disabled:opacity-50 disabled:cursor-not-allowed`}
  >
    {ratio}
  </button>
);

interface ModelSelectionButtonProps {
  model: string;
  name: string;
  current: string;
  onClick: (model: string) => void;
  disabled: boolean;
}

const ModelSelectionButton = ({ model, name, current, onClick, disabled }: ModelSelectionButtonProps) => (
    <button
      onClick={() => onClick(model)}
      disabled={disabled}
      className={`flex-1 px-3 py-2 text-sm font-semibold rounded-md transition-all duration-200 text-center ${
        current === model
          ? 'bg-blue-600 text-white shadow-lg'
          : 'bg-white/10 hover:bg-white/20 text-gray-300'
      } disabled:opacity-50`}
    >
      {name}
    </button>
);

interface UploaderFrameProps {
  onImageUpload: (file: File) => void;
  t: (key: string) => string;
}

const UploaderFrame = ({ onImageUpload, t }: UploaderFrameProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onImageUpload(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  }, [onImageUpload]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onImageUpload(e.target.files[0]);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
      />
      <div
        onClick={handleUploadClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`w-full h-40 flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-300
          ${isDragging ? 'border-cyan-400 bg-cyan-500/10' : 'border-gray-500/50 hover:border-cyan-500 hover:bg-cyan-500/5'}
        `}
      >
        <UploadIcon className="w-10 h-10 text-gray-400 mb-2" />
        <p className="text-gray-400 text-center">
          <span className="font-semibold text-cyan-400">{t('upload_reference')}</span>
        </p>
        <p className="text-xs text-gray-500 mt-1">{t('drag_and_drop')}</p>
      </div>
    </>
  );
};


const PromptInput = ({
  prompt,
  setPrompt,
  aspectRatio,
  setAspectRatio,
  selectedModel,
  setSelectedModel,
  onSubmit,
  isLoading,
  onImageUpload,
  showUploaderFrame,
  onPromptClick,
  lang,
  setLang,
  t,
}: PromptInputProps) => {
  const isNanoBanana = selectedModel === 'gemini-2.5-flash-image-preview';
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const nanoOnMobile = isNanoBanana && !isDesktop;
  
  const placeholderText = nanoOnMobile
    ? t('prompt_placeholder_nano_mobile')
    : isNanoBanana
    ? t('prompt_placeholder_nano_desktop')
    : t('prompt_placeholder_imagen');

  const rowsCount = nanoOnMobile ? 2 : isNanoBanana ? 5 : 12;

  return (
    <div className="w-full h-full flex flex-col">
       <header className="text-center py-4 flex-shrink-0 animate-fade-in-down px-4">
          <div className="flex justify-center items-center gap-2 mb-3">
             <button onClick={() => setLang('en')} className={`text-sm font-medium transition-colors ${lang === 'en' ? 'text-cyan-400' : 'text-gray-400 hover:text-white'}`}>EN</button>
             <span className="text-gray-600">|</span>
             <button onClick={() => setLang('id')} className={`text-sm font-medium transition-colors ${lang === 'id' ? 'text-cyan-400' : 'text-gray-400 hover:text-white'}`}>ID</button>
          </div>
          <div className="flex flex-col items-center">
            <h1 className="text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              {t('main_title')}
            </h1>
            <p className="text-xs font-medium text-white tracking-wider">
              by LANEXA ID
            </p>
          </div>
          <p className="mt-1 text-md text-gray-300">
            {t('main_subtitle')}
          </p>
        </header>

      <div className="flex-grow w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl p-6 space-y-4 flex flex-col">
        {showUploaderFrame && (
          <UploaderFrame onImageUpload={onImageUpload} t={t} />
        )}

        <div 
          className="flex-grow flex flex-col"
          onClick={nanoOnMobile ? onPromptClick : undefined}
        >
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">
            {isNanoBanana ? t('editing_instructions_label') : t('image_prompt_label')}
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={placeholderText}
            className={`w-full p-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all no-scrollbar flex-grow ${nanoOnMobile ? 'cursor-pointer' : ''}`}
            rows={rowsCount}
            readOnly={nanoOnMobile}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">{t('model_label')}</label>
            <div className="flex gap-2 bg-black/20 p-1 rounded-lg">
              <ModelSelectionButton model="imagen-4.0-generate-001" name="Imagen 4" current={selectedModel} onClick={setSelectedModel} disabled={isLoading} />
              <ModelSelectionButton model="gemini-2.5-flash-image-preview" name="Nano Banana" current={selectedModel} onClick={setSelectedModel} disabled={isLoading} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">{t('aspect_ratio_label')}</label>
            <div className="grid grid-cols-5 gap-1.5">
              <AspectRatioButton ratio="1:1" current={aspectRatio} onClick={setAspectRatio} disabled={isLoading || isNanoBanana} />
              <AspectRatioButton ratio="16:9" current={aspectRatio} onClick={setAspectRatio} disabled={isLoading || isNanoBanana} />
              <AspectRatioButton ratio="9:16" current={aspectRatio} onClick={setAspectRatio} disabled={isLoading || isNanoBanana} />
              <AspectRatioButton ratio="4:3" current={aspectRatio} onClick={setAspectRatio} disabled={isLoading || isNanoBanana} />
              <AspectRatioButton ratio="3:4" current={aspectRatio} onClick={setAspectRatio} disabled={isLoading || isNanoBanana} />
            </div>
            {isNanoBanana && <p className="text-xs text-gray-500 mt-2 text-center">{t('aspect_ratio_not_applicable')}</p>}
          </div>
        </div>

        <button
          onClick={onSubmit}
          disabled={isLoading}
          className="w-full flex items-center justify-center px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:scale-105 disabled:hover:scale-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 mt-auto"
        >
          {isLoading ? (
            <>
              <SpinnerIcon className="w-5 h-5 mr-2" />
              {t('generating_button')}
            </>
          ) : (
            t('generate_button')
          )}
        </button>
      </div>
    </div>
  );
};

export default PromptInput;