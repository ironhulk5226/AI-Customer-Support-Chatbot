import {
    processDocument
} from "./documentProcessingService.js";

const filePath = "./uploads/1789895833023-customer_support_chatbot_test.pdf";

const result = await processDocument(
    filePath,
    "pdf"
);

console.log("Extracted text length:", result.extractedText.length);
console.log("Cleaned text length:", result.cleanedText.length);
console.log("Number of chunks:", result.chunks.length);

console.log("\nFirst chunk:\n");
console.log(result.chunks[0]);