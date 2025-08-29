import { GoogleGenAI, Modality } from "@google/genai";

interface ImageInput {
  data: string; // Base64 encoded string without the data URL prefix
  mimeType: string;
}

const getAiClient = (customApiKey?: string): GoogleGenAI => {
  const effectiveApiKey = customApiKey || process.env.API_KEY;

  if (!effectiveApiKey) {
    throw new Error("error_api_key_not_configured");
  }
  
  return new GoogleGenAI({ apiKey: effectiveApiKey });
};

/**
 * Generates an image using the Gemini API based on a text prompt and selected model.
 * @param prompt The text prompt to generate an image from.
 * @param aspectRatio The desired aspect ratio for the image (for supported models).
 * @param model The selected model for image generation.
 * @param image Optional image data for editing.
 * @param customApiKey Optional user-provided API key.
 * @returns A promise that resolves to the base64 encoded image string.
 */
export const generateImage = async (
  prompt: string,
  aspectRatio: string,
  model: string,
  image?: ImageInput,
  customApiKey?: string
): Promise<string> => {
  try {
    const ai = getAiClient(customApiKey);
    if (model === 'imagen-4.0-generate-001') {
      const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png', // Generate high-quality PNG
          aspectRatio: aspectRatio,
        },
      });

      if (response.generatedImages && response.generatedImages.length > 0) {
        return response.generatedImages[0].image.imageBytes;
      }
    } else if (model === 'gemini-2.5-flash-image-preview') {
      const parts: ({ text: string } | { inlineData: { data: string; mimeType: string } })[] = [];

      if (image) {
        parts.push({
          inlineData: {
            data: image.data,
            mimeType: image.mimeType,
          },
        });
      }

      if (prompt.trim()) {
        parts.push({ text: prompt });
      }

      if (parts.length === 0) {
        throw new Error('error_prompt_or_image_required_for_edit');
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts },
        config: {
          responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
      });
      
      if (response.candidates?.[0]?.finishReason === 'SAFETY') {
        throw new Error('error_safety');
      }

      for (const part of response.candidates?.[0]?.content?.parts ?? []) {
        if (part.inlineData) {
          return part.inlineData.data;
        }
      }
    }
    
    throw new Error('error_no_images_returned');

  } catch (error) {
    console.error('Gemini API Error:', error);
    
    // Default our known error types
    if (error instanceof Error) {
      if (error.message === 'error_api_key_not_configured' ||
          error.message === 'error_prompt_or_image_required_for_edit' ||
          error.message === 'error_no_images_returned' ||
          error.message === 'error_safety') {
        throw error; // Re-throw our custom internal errors
      }
    }

    const errorMessage = error instanceof Error ? error.message.toLowerCase() : '';

    // Check for specific error messages from the Gemini API
    if (errorMessage.includes('safety') || errorMessage.includes('policy')) {
      throw new Error('error_safety');
    }
    if (errorMessage.includes('api key not valid') || errorMessage.includes('invalid api key')) {
      throw new Error('error_api_key');
    }
    if (errorMessage.includes('billing')) {
      throw new Error('error_billing');
    }
    if (errorMessage.includes('permission denied') || errorMessage.includes('api is not enabled')) {
      throw new Error('error_permission');
    }
    if (errorMessage.includes('unsupported location')) {
        throw new Error('error_location');
    }
    if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('resource_exhausted')) {
      throw new Error('error_quota');
    }
    
    // Fallback to a generic error if no specific message is found
    throw new Error('error_generic');
  }
};