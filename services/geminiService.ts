import { GoogleGenAI } from "@google/genai";
import { TransformationMode } from "../types";

const API_KEY = process.env.API_KEY;

/**
 * Stage 1 & 2: Analyze the reference image to extract structured style attributes
 * and convert them into a detailed generative prompt.
 */
async function analyzeStyle(
  ai: GoogleGenAI,
  styleImageBase64: string,
  styleMimeType: string,
  mode: TransformationMode
): Promise<string> {
  const cleanBase64 = styleImageBase64.replace(/^data:image\/\w+;base64,/, "");

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          inlineData: {
            data: cleanBase64,
            mimeType: styleMimeType,
          },
        },
        {
          text: `ACT AS A WORLD-CLASS ART DIRECTOR. 
          Analyze this reference image and extract the following structured attributes to create a detailed prompt for a generative image model:
          - ARTISTIC STYLE: (e.g., Cyberpunk, Oil Painting, 1950s Film Noir, Studio Ghibli Anime, 3D Octane Render)
          - LIGHTING: (e.g., Volumetric fog, rim lighting, neon highlights, soft natural sun)
          - COLOR PALETTE: (e.g., Duotone teal and orange, monochromatic sepia, vibrant primary colors)
          - TEXTURE & MEDIUM: (e.g., Grainy film, canvas texture, smooth vector, hyper-detailed skin)
          - OUTFIT & PROPS: (e.g., Techwear, Victorian armor, casual hoodie)
          - BACKGROUND & ENVIRONMENT: (e.g., Futuristic Tokyo, overgrown forest, abstract geometric shapes)
          - CAMERA ANGLE & MOOD: (e.g., Low angle hero shot, melancholic close-up, high-octane action blur)
          - TYPOGRAPHY & OVERLAYS: (If any, describe them)

          FORMAT: Output ONLY a single, highly-detailed paragraph that summarizes all these attributes. 
          Target the description to be used as a style-guide for a NEW image generation. 
          Mode: ${mode === TransformationMode.REALISTIC ? 'Photorealistic/Cinematic' : 'Stylized/Artistic'}.`,
        },
      ],
    },
  });

  return response.text || "A high-quality artistic portrait.";
}

/**
 * Stage 3: Send ONLY the user image and the generated prompt to the image generation model.
 */
export const generateTransformedImage = async (
  styleImageBase64: string | null,
  styleMimeType: string | null,
  identityImageBase64: string,
  identityMimeType: string,
  mode: TransformationMode,
  userPrompt: string
): Promise<string> => {
  if (!API_KEY) {
    throw new Error("API Key is missing. Please check your configuration.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const cleanIdentityBase64 = identityImageBase64.replace(/^data:image\/\w+;base64,/, "");

  let synthesizedStylePrompt = "";

  // STAGE 1 & 2: Analyze Reference (if provided)
  if (styleImageBase64 && styleMimeType) {
    try {
      synthesizedStylePrompt = await analyzeStyle(ai, styleImageBase64, styleMimeType, mode);
    } catch (e) {
      console.error("Style analysis failed, falling back to default styling", e);
      synthesizedStylePrompt = "A cinematic high-quality masterpiece.";
    }
  } else {
    synthesizedStylePrompt = "A high-quality, professional portrait.";
  }

  // STAGE 3: Final Generation (Synthesis)
  // We do NOT send the reference image here. We only send the Identity Image and the Text Prompt.
  const generationPrompt = `
    TASK: FULL LATENT SPACE REGENERATION.
    IDENTITY SOURCE: Provided Image. 
    STYLE GUIDE: ${synthesizedStylePrompt}
    USER REQUEST: ${userPrompt || "No additional requests."}

    INSTRUCTIONS:
    1. LOCK IDENTITY: Use the provided image ONLY to learn the face, bone structure, and identity of the subject.
    2. SYNTHESIZE: Generate a COMPLETELY NEW image from scratch. 
    3. NO COMPOSITING: Do not overlay, blend, or use the original background of the identity image.
    4. APPLY STYLE: The new image must perfectly reflect the "STYLE GUIDE" attributes in every pixel.
    5. QUALITY: Ensure the subject is seamlessly integrated into the new environment with matching lighting and texture.
    
    ${mode === TransformationMode.REALISTIC 
      ? "Ensure photorealism, natural skin pores, and accurate light bounce." 
      : "Ensure full artistic transformation matching the style's unique brushwork or rendering."}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanIdentityBase64,
              mimeType: identityMimeType,
            },
          },
          { text: generationPrompt },
        ],
      },
    });

    if (response.candidates && response.candidates.length > 0) {
      const content = response.candidates[0].content;
      if (content.parts) {
        for (const part of content.parts) {
          if (part.inlineData) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          }
        }
      }
    }

    throw new Error("Generation completed but no image data was returned.");
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to generate image.");
  }
};