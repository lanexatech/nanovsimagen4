import React, { useState, useEffect } from 'react';
import { CloseIcon } from './icons/CloseIcon';

interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPrompt: string;
  onSave: (newPrompt: string) => void;
  t: (key: string) => string;
}

const PromptModal: React.FC<PromptModalProps> = ({ isOpen, onClose, currentPrompt, onSave, t }) => {
  const [editingPrompt, setEditingPrompt] = useState(currentPrompt);

  useEffect(() => {
    if (isOpen) {
      setEditingPrompt(currentPrompt);
    }
  }, [isOpen, currentPrompt]);

  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    onSave(editingPrompt);
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
      aria-labelledby="prompt-modal-title"
    >
      <div
        className="relative bg-[#112240] border border-white/20 rounded-2xl shadow-xl w-full max-w-2xl flex flex-col p-6"
        onClick={stopPropagation}
      >
        <div className="flex items-center justify-between mb-4">
            <h2 id="prompt-modal-title" className="text-lg font-semibold text-gray-200">
                {t('edit_prompt_title')}
            </h2>
            <button
                onClick={onClose}
                className="p-2 rounded-full text-gray-300 hover:bg-white/20 hover:text-white transition-colors"
                aria-label={t('close_prompt_editor_aria')}
            >
                <CloseIcon className="w-6 h-6" />
            </button>
        </div>

        <div className="flex-grow">
             <textarea
                value={editingPrompt}
                onChange={(e) => setEditingPrompt(e.target.value)}
                placeholder={t('prompt_placeholder_imagen')}
                className="w-full h-60 p-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all no-scrollbar"
                autoFocus
             />
        </div>

        <div className="mt-6 flex justify-end">
            <button
              onClick={handleSave}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
              aria-label={t('save_close_prompt_editor_aria')}
            >
              {t('save_close_button')}
            </button>
        </div>
      </div>
    </div>
  );
};

export default PromptModal;