// Gemini AI ile velosiped içerik doğrulama
export interface ValidationResult {
  isValid: boolean;
  isBicycle: boolean;
  isBicycleVideo: boolean;
  isBicycleContent: boolean;
  message: string;
  confidence: number;
}

export async function validateBicycleContent(
  title: string,
  description: string,
  imageUrls: string[] = [],
  videoUrls: string[] = []
): Promise<ValidationResult> {
  try {
    const geminiToken = process.env.NEXT_PUBLIC_GEMINI_TOKENS;
    
    if (!geminiToken) {
      // Fallback validation without AI
      const bicycleKeywords = [
        'bicycle', 'bike', 'velosiped', 'bisiklet', 'cycle', 'cycling',
        'mountain bike', 'road bike', 'electric bike', 'e-bike', 'bmx',
        'cruiser', 'hybrid', 'folding bike', 'tandem', 'recumbent',
        'pedal', 'wheel', 'frame', 'handlebar', 'saddle', 'chain',
        'gear', 'brake', 'tire', 'tube', 'helmet', 'cycling gear'
      ];
      
      const content = `${title} ${description}`.toLowerCase();
      const hasBicycleContent = bicycleKeywords.some(keyword => 
        content.includes(keyword.toLowerCase())
      );
      
      return {
        isValid: hasBicycleContent,
        isBicycle: hasBicycleContent,
        isBicycleVideo: hasBicycleContent,
        isBicycleContent: hasBicycleContent,
        message: hasBicycleContent 
          ? "Content appears to be bicycle-related" 
          : "Content must be related to bicycles/bikes only",
        confidence: hasBicycleContent ? 80 : 0
      };
    }

    // Text content validation
    const textPrompt = `
Analyze the following content and determine if it's related to bicycles/bikes:

Title: "${title}"
Description: "${description}"

Please respond with JSON format:
{
  "isBicycleContent": true/false,
  "confidence": 0-100,
  "reason": "explanation"
}

Only respond with JSON, no other text.
`;

    const textResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiToken}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: textPrompt
          }]
        }]
      })
    });

    const textData = await textResponse.json();
    const textResult = JSON.parse(textData.candidates[0].content.parts[0].text);

    // Image validation if images exist
    let imageResult = { isBicycle: true, confidence: 100 };
    if (imageUrls.length > 0) {
      const imagePrompt = `
Analyze this image and determine if it shows a bicycle/bike. 

Please respond with JSON format:
{
  "isBicycle": true/false,
  "confidence": 0-100,
  "reason": "explanation"
}

Only respond with JSON, no other text.
`;

      const imageResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${geminiToken}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: imagePrompt },
              ...imageUrls.map(url => ({ inline_data: { mime_type: "image/jpeg", data: url } }))
            ]
          }]
        })
      });

      const imageData = await imageResponse.json();
      imageResult = JSON.parse(imageData.candidates[0].content.parts[0].text);
    }

    // Video validation if videos exist
    let videoResult = { isBicycleVideo: true, confidence: 100 };
    if (videoUrls.length > 0) {
      // For videos, we'll use a simpler approach since Gemini Vision API has limitations
      videoResult = {
        isBicycleVideo: textResult.isBicycleContent && imageResult.isBicycle,
        confidence: Math.min(textResult.confidence, imageResult.confidence)
      };
    }

    const overallValid = textResult.isBicycleContent && imageResult.isBicycle && videoResult.isBicycleVideo;
    const overallConfidence = Math.min(textResult.confidence, imageResult.confidence, videoResult.confidence);

    return {
      isValid: overallValid,
      isBicycle: imageResult.isBicycle,
      isBicycleVideo: videoResult.isBicycleVideo,
      isBicycleContent: textResult.isBicycleContent,
      message: overallValid 
        ? "Content is valid for bicycle marketplace" 
        : "Content must be related to bicycles/bikes only",
      confidence: overallConfidence
    };

  } catch (error) {
    console.error('Gemini validation error:', error);
    return {
      isValid: false,
      isBicycle: false,
      isBicycleVideo: false,
      isBicycleContent: false,
      message: "AI validation failed. Please ensure content is bicycle-related.",
      confidence: 0
    };
  }
}

export async function validateBicycleImage(imageUrl: string): Promise<boolean> {
  try {
    const geminiToken = process.env.NEXT_PUBLIC_GEMINI_TOKENS;
    
    if (!geminiToken) {
      return true; // Skip validation if not configured
    }

    const prompt = `
Analyze this image and determine if it shows a bicycle, bike, or cycling-related content.

Respond with only "true" or "false".
`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${geminiToken}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { inline_data: { mime_type: "image/jpeg", data: imageUrl } }
          ]
        }]
      })
    });

    const data = await response.json();
    const result = data.candidates[0].content.parts[0].text.toLowerCase().trim();
    
    return result === 'true';
  } catch (error) {
    console.error('Image validation error:', error);
    return true; // Allow if validation fails
  }
}
