import fs from "fs/promises";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";


export const extractTextFromPDF = async (filePath) => {
  const fileBuffer = await fs.readFile(filePath);
  const parser = new PDFParse({ data: fileBuffer });
  const data = await parser.getText();

  return data.text;
};

export const extractTextFromDOCX = async (filePath) => {
  const result = await mammoth.extractRawText({
    path: filePath,
  });

  return result.value;
};

export const extractText = async (filePath, fileType) => {
  if (fileType === "pdf") {
    return await extractTextFromPDF(filePath);
  }

  if (fileType === "docx") {
    return await extractTextFromDOCX(filePath);
  }

  throw new Error("Unsupported Document Type");
};

export const cleanText = (text) => {
    return text
        .replace(/\r/g, "")
        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
};

export const splitIntoChunks = (text, chunkSize = 1000, chunkOverlap = 200) => {
  const chunks = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);

    const chunk = text.slice(start, end).trim();

    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    start += chunkSize - chunkOverlap;
  }
  return chunks;
};

export const processDocument = async(filePath,fileType) =>{
    const extractedText = await extractText(filePath,fileType);

    const cleanedText = cleanText(extractedText);

    const chunks = splitIntoChunks(cleanedText);

    return{ extractedText , cleanedText , chunks };
}