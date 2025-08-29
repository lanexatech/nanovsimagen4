import React from 'react';
import { DownloadIcon } from './icons/DownloadIcon';
import { CloseIcon } from './icons/CloseIcon';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  prompt: string;
  t: (key: string) => string;
}

const ImageModal: React.FC<ImageModalProps> = ({ isOpen, onClose, imageUrl, prompt, t }) => {
  if (!isOpen || !imageUrl) {
    return null;
  }

  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    const fileName = prompt.trim().replace(/[\s\W]+/g, '-').substring(0, 50) || 'generated-image';
    link.href = imageUrl;
    link.download = `${fileName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="image-modal-title"
    >
      <div
        className="relative bg-white/10 border border-white/20 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col p-6"
        onClick={stopPropagation}
      >
        <div className="flex items-center justify-between mb-4">
            <h2 id="image-modal-title" className="text-lg font-semibold text-gray-200 truncate pr-4">
                {prompt || t('generated_image_title')}
            </h2>
            <button
                onClick={onClose}
                className="p-2 rounded-full text-gray-300 hover:bg-white/20 hover:text-white transition-colors"
                aria-label={t('close_modal_aria')}
            >
                <CloseIcon className="w-6 h-6" />
            </button>
        </div>

        <div className="flex-grow overflow-auto no-scrollbar">
             <img src={imageUrl} alt={prompt} className="rounded-lg" />
        </div>

        <div className="mt-6 flex justify-center">
            <button
              onClick={handleDownload}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
              aria-label={t('download_image_aria')}
            >
              <DownloadIcon className="w-5 h-5 mr-2" />
              {t('download_png_button')}
            </button>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;