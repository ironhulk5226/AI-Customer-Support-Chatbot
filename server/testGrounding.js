import { calculateGroundingScore } from "./services/groundingService.js";

const tests = [
  {
    name: "Fully grounded",
    answer: "We accept credit cards and UPI for online payments.",
    context: [
      "We accept credit cards and UPI for online payments.",
    ],
  },

  {
    name: "Partially grounded",
    answer:
      "We accept credit cards and UPI. Payments are processed instantly.",
    context: [
      "We accept credit cards and UPI for online payments.",
    ],
  },

  {
    name: "Not grounded",
    answer:
      "We provide international shipping and cash on delivery.",
    context: [
      "We accept credit cards and UPI for online payments.",
    ],
  },

  {
    name: "Multilingual",
    answer:
      "आम्ही सध्या आंतरराष्ट्रीय शिपिंग देत नाही.",
    context: [
      "आम्ही सध्या आंतरराष्ट्रीय शिपिंग देत नाही.",
    ],
  },
];

for (const test of tests) {
  const score = calculateGroundingScore(
    test.answer,
    test.context,
  );

  console.log(`${test.name}: ${score}`);
}