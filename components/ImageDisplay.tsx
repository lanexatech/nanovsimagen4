import React from 'react';

interface ImageDisplayProps {
  imageUrl: string | null;
  prompt: string;
  onImageClick: () => void;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({ imageUrl, prompt, onImageClick }) => {
  if (!imageUrl) {
    return null;
  }
  
  return (
    <button
      onClick={onImageClick}
      className="relative w-full focus:outline-none rounded-lg"
      aria-label="Enlarge generated image"
    >
      <img src={imageUrl} alt={prompt} className="rounded-lg shadow-lg max-w-full max-h-[85vh] w-auto h-auto block mx-auto" />
    </button>
  );
};

export default ImageDisplay;