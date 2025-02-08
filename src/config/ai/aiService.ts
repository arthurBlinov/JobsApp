import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Validates the CV object to ensure it has at least 5 of the 7 required fields.
 * @param cvData - The structured CV data.
 */
const validateCV = (cvData: { [key: string]: any }): string[] | null => {
  const requiredFields = [
    'Name',
    'Age',
    'Profession',
    'Experience',
    'Company',
    'Skills',
    'Contact Info',
  ];

  const providedFields = requiredFields.filter((field) => cvData[field] && cvData[field].length > 0);

  if (providedFields.length >= 5) {
    return null; 
  }
  return requiredFields.filter((field) => !providedFields.includes(field));
};

/**
 * Parses the structured CV text into an object for validation.
 * @param cvText - The structured CV text from OpenAI.
 */
const parseStructuredCV = (cvText: string): { [key: string]: string } => {
  const lines = cvText.split('\n').map((line) => line.trim());
  const cvData: { [key: string]: string } = {};

  lines.forEach((line) => {
    const [key, value] = line.split(':').map((part) => part.trim());
    if (key && value) {
      cvData[key] = value;
    }
  });

  return cvData;
};

/**
 * Translates input text into the target language.
 * @param inputText - The text to translate.
 * @param targetLanguage - The target language ("Hebrew" or "English").
 */
async function translateText(inputText: string, targetLanguage: string): Promise<string> {
  const prompt = `
    Translate the following text into ${targetLanguage}:
    Text: ${inputText}
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
    });

    return response.choices[0].message?.content?.trim() || "Translation failed.";
  } catch (error) {
    console.error("Error with OpenAI API during translation:", error);
    throw new Error("Failed to translate text with OpenAI.");
  }
}

/**
 * Transforms translated text into a structured CV format and validates it.
 * @param inputText - The original user-provided text.
 * @param targetLanguage - The target language for the CV ("Hebrew" or "English").
 */
export async function transformToCV(
  inputText: string,
  targetLanguage: string
): Promise<{ cv?: { [key: string]: string }; missingFields?: string[] }> {
  const translatedText = await translateText(inputText, targetLanguage);

  const prompt = `
    Transform the following text into a structured CV format in ${targetLanguage}:

    Text: ${translatedText}

    Output Template:
    Name: [Name]
    Age: [Age]
    Profession: [Profession]
    Experience: [Experience]
    Company: [Company]
    Skills: [Skills]
    ContactInfo: [Contact Info]
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
    });

    const cvText = response.choices[0].message?.content?.trim() || "Unable to generate CV.";
    const cvData = parseStructuredCV(cvText);

    const missingFields = validateCV(cvData);

    if (missingFields) {
      return { missingFields }; 
    }

    return { cv:cvData }; 
  } catch (error) {
    console.error("Error with OpenAI API during CV generation:", error);
    throw new Error("Failed to generate CV with OpenAI.");
  }
}





