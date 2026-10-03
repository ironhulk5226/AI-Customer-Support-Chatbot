# AI Customer Support Chatbot

An AI-powered customer support platform that combines Retrieval-Augmented Generation (RAG), a local Large Language Model, semantic document retrieval, administrator-managed FAQs, automatic knowledge-gap detection, multilingual support, local speech recognition, conversation history, response feedback, and support analytics.

The system is designed around a privacy-oriented local AI workflow: customer-support answers are generated from an administrator-controlled knowledge base, while the main chatbot LLM runs locally through Ollama.

> **Repository:** https://github.com/ironhulk5226/AI-Customer-Support-Chatbot  
> **Default branch:** `master`

---

## Table of Contents

- [Project Overview](#project-overview)
- [Key Capabilities](#key-capabilities)
- [Architecture](#architecture)
- [Core RAG Workflow](#core-rag-workflow)
- [Knowledge Base Workflow](#knowledge-base-workflow)
- [Knowledge Gap to FAQ Workflow](#knowledge-gap-to-faq-workflow)
- [Multilingual Support](#multilingual-support)
- [Voice Input](#voice-input)
- [Conversation and Feedback Workflow](#conversation-and-feedback-workflow)
- [Admin Analytics](#admin-analytics)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Local Setup](#local-setup)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Main API Endpoints](#main-api-endpoints)
- [How Data Moves Through the System](#how-data-moves-through-the-system)
- [Security and Privacy Design](#security-and-privacy-design)
- [Important Implementation Details](#important-implementation-details)
- [Testing](#testing)
- [Limitations and Operational Notes](#limitations-and-operational-notes)
- [Troubleshooting](#troubleshooting)
- [Future Improvements](#future-improvements)
- [License](#license)

---

## Project Overview

The AI Customer Support Chatbot provides a complete customer-support workflow for organizations that need answers grounded in their own documents and administrator-approved knowledge.

The application has two main sides.

### Customer Side

Customers can:

- Register and log in.
- Ask support questions in **English, Hindi, or Marathi**.
- Use normal chat or voice input.
- Receive grounded answers from the knowledge base.
- See source/evidence information with answers.
- Review recent conversations and reopen previous chats.
- Rate assistant responses as **Helpful** or **Not Helpful**.

### Administrator Side

Administrators can:

- Log in through protected admin routes.
- Upload and manage knowledge-base documents.
- View document-processing status.
- Review detected knowledge gaps.
- Generate FAQ drafts from recurring gaps.
- Enter and verify the official FAQ answer.
- Approve an FAQ and add it to the vector knowledge base.
- Edit approved FAQ answers and refresh their embeddings.
- View approved FAQs.
- Monitor customer activity, languages, feedback, documents, FAQs, and knowledge-gap metrics.

---

## Key Capabilities

| Capability | Implementation |
|---|---|
| Grounded customer support | RAG using retrieved knowledge-base context |
| Local LLM | Ollama with `qwen2.5:3b` |
| Local embeddings | Ollama with `nomic-embed-text` |
| Vector database | ChromaDB |
| Knowledge documents | PDF and DOCX processing |
| Knowledge-gap detection | Distance threshold + context relevance checking |
| Knowledge-gap grouping | Token normalization + Jaccard similarity |
| FAQ lifecycle | Draft → review → approved/rejected |
| Verified FAQ retrieval | Strong FAQ matches return administrator-approved evidence directly |
| Multilingual support | English, Hindi, Marathi |
| Romanized language styles | Hinglish and Minglish normalization/output |
| Indic translation | IndicTrans2 service through the local Python translation server |
| Voice input | Local Faster-Whisper speech recognition |
| Conversation persistence | MongoDB-backed conversation history |
| Response feedback | Helpful / Not Helpful stored with assistant messages |
| Admin analytics | MongoDB aggregation-based support metrics |
| Authentication | JWT |
| Authorization | Customer/admin role middleware |
| Document management | Upload, process, index, delete |
| Source evidence | Document, section/chunk, and evidence metadata |

---

## Architecture

```text
                              ┌──────────────────────────┐
                              │        React Client      │
                              │    Vite + Tailwind CSS   │
                              └────────────┬─────────────┘
                                           │
                              HTTP / JSON / SSE
                                           │
                                           ▼
                              ┌──────────────────────────┐
                              │      Express Server       │
                              │   JWT + role protection   │
                              └────────────┬─────────────┘
                                           │
              ┌────────────────────────────┼─────────────────────────────┐
              │                            │                             │
              ▼                            ▼                             ▼
     ┌─────────────────┐        ┌──────────────────┐          ┌─────────────────┐
     │    MongoDB      │        │   RAG Services   │          │ Speech / i18n   │
     │                 │        │                  │          │                 │
     │ Users           │        │ Embeddings       │          │ Faster-Whisper  │
     │ Documents       │        │ ChromaDB         │          │ IndicTrans2     │
     │ Conversations   │        │ Relevance check  │          │ Qwen normalize  │
     │ FAQs            │        │ Local Qwen LLM   │          │ Hinglish/Minglish│
     │ Knowledge Gaps  │        │ Grounding score  │          │                 │
     └─────────────────┘        └──────────────────┘          └─────────────────┘
                                           │
                                           ▼
                              ┌──────────────────────────┐
                              │      Ollama Runtime      │
                              │                          │
                              │ qwen2.5:3b              │
                              │ nomic-embed-text        │
                              └──────────────────────────┘
```

---

## Core RAG Workflow

The production chat route follows this sequence:

```text
Customer Question
      │
      ▼
Language / Style Detection
      │
      ▼
Normalize Query to English
      │
      ▼
Generate Query Embedding
      │
      ▼
ChromaDB Semantic Search
      │
      ├── Best distance <= strong threshold
      │          │
      │          ├── Approved FAQ?
      │          │      └── Return verified FAQ evidence directly
      │          │
      │          └── Otherwise continue to grounded generation
      │
      └── Borderline match
                 │
                 ▼
        Combined Context Relevance Check
                 │
           ┌─────┴─────┐
           │           │
          YES          NO
           │           │
           ▼           ▼
     Build RAG prompt  Record knowledge gap
           │
           ▼
     Local Qwen answer
           │
           ▼
     Grounding score
       (monitoring)
           │
           ▼
      Answer + Sources
```

### Retrieval Thresholds

The current RAG configuration uses:

```env
KNOWLEDGE_GAP_DISTANCE_THRESHOLD=0.75
RAG_GROUNDING_THRESHOLD=0.5
RAG_STRONG_SIMILARITY_THRESHOLD=0.5
```

The implementation treats ChromaDB distance as the retrieval signal:

- Distance **≤ 0.75** is eligible for the RAG context.
- Best distance **≤ 0.5** is treated as a strong semantic match.
- Borderline retrieved context is passed through the local LLM relevance checker.
- A grounding score is calculated for monitoring and logging; it does not currently block an answer.

---

## Knowledge Base Workflow

Administrators upload supported knowledge documents through the admin interface.

### Document Ingestion

```text
PDF / DOCX
   │
   ▼
Upload with Multer
   │
   ▼
Create MongoDB Document record
   │
   ▼
Extract + clean + split text
   │
   ▼
Generate embedding for each chunk
   │
   ▼
Store chunks + embeddings + metadata in ChromaDB
   │
   ▼
Mark document as processed
```

Each indexed chunk carries metadata such as:

- `documentId`
- `documentName`
- `chunkIndex`
- `fileType`

Deleting a document removes its physical file, removes its vectors from ChromaDB, and removes its MongoDB record.

---

## Knowledge Gap to FAQ Workflow

When the RAG pipeline cannot find a sufficiently useful answer, the question can be recorded as a knowledge gap.

Repeated semantically similar questions are grouped using the knowledge-gap grouping service.

The recurrence threshold used by the knowledge-gap workflow is **3 occurrences**.

```text
Unknown Customer Question
        │
        ▼
Knowledge Gap Candidate
        │
        ▼
Repeated / Similar Questions
        │
        ▼
Occurrence threshold reached
        │
        ▼
Recurring Knowledge Gap
        │
        ▼
Admin generates FAQ draft
        │
        ├── Question → AI-generated concise FAQ wording
        └── Answer   → administrator must provide verified answer
                              │
                              ▼
                         Admin approves
                              │
                              ▼
                    FAQ embedded into ChromaDB
                              │
                              ▼
                       Knowledge gap resolved
                              │
                              ▼
             Future semantic match → verified FAQ answer
```

The FAQ model supports:

```text
draft
approved
rejected
```

Approved FAQs receive deterministic ChromaDB IDs in the form:

```text
faq_<faqId>
```

This allows an approved FAQ to be updated by regenerating its embedding and upserting the same vector ID.

---

## Multilingual Support

The chatbot supports:

- English
- Hindi
- Marathi

The system also recognizes Romanized conversational styles:

- **Hinglish** — Hindi written using Latin/Roman characters.
- **Minglish** — Marathi written using Latin/Roman characters.

### Query Normalization

```text
English
   └──> English

Hindi (Devanagari)
   └──> IndicTrans2
          └──> English

Marathi (Devanagari)
   └──> IndicTrans2
          └──> English

Hinglish
   └──> Qwen normalization
          └──> English

Minglish
   └──> Qwen normalization
          └──> English
```

### Answer Translation

```text
English answer
   │
   ├──> English
   │
   ├──> Hindi (Devanagari)
   │      └── IndicTrans2
   │
   ├──> Marathi (Devanagari)
   │      └── IndicTrans2
   │
   ├──> Hinglish
   │      └── Qwen Romanized Hindi generation
   │
   └──> Minglish
          └── Qwen Romanized Marathi generation
```

The proper Indic-script translation service runs locally through the Python service at port **7000** by default.

---

## Voice Input

The frontend can record audio and send it to:

```text
POST /api/speech
```

The Node server starts a persistent Python speech worker and communicates with it through JSON lines over stdin/stdout.

The speech worker uses:

- Faster-Whisper
- CPU execution by default

Supported speech languages in the route are:

```text
en
hi
mr
```

The recorded temporary audio file is deleted after recognition.

The speech dependency file contains:

```text
faster-whisper==1.2.1
```

---

## Conversation and Feedback Workflow

Conversation records are stored in MongoDB.

A conversation contains:

- User ID
- Conversation title
- Message array
- Creation timestamp
- Update timestamp

Each message stores:

- Role: `user` or `assistant`
- Content
- Language
- Timestamp
- Source metadata
- Feedback

Feedback is stored **inside the assistant message** rather than in a separate feedback collection.

Allowed feedback values are:

```text
helpful
not_helpful
```

The feedback route verifies:

1. A valid conversation ID.
2. A valid message ID.
3. Ownership of the conversation by the authenticated user.
4. That the target message is an assistant message.
5. That the feedback value is allowed.

---

## Admin Analytics

The administrator analytics route exposes aggregated operational metrics.

The dashboard currently includes:

- Customer count
- Conversation count
- Message count
- Active-today count
- Document count
- FAQ count
- Recurring candidate knowledge gaps
- Approved FAQ count
- Message activity over the last 7 days
- Message-language distribution
- Document status distribution
- FAQ status distribution
- Helpful / Not Helpful feedback counts
- Customer satisfaction percentage

The dashboard refreshes analytics periodically from the backend.

---

## Technology Stack

### Frontend

| Technology | Usage |
|---|---|
| React | UI |
| Vite | Development/build tooling |
| React Router DOM | Routing |
| Tailwind CSS | Styling |
| Axios | API requests |

### Backend

| Technology | Usage |
|---|---|
| Node.js | Runtime |
| Express | REST API |
| Mongoose | MongoDB ODM |
| JWT | Authentication |
| bcryptjs | Password hashing |
| Multer | File uploads |
| pdf-parse | PDF text extraction |
| Mammoth | DOCX processing |
| ChromaDB | Vector store |
| Ollama | Local model runtime |

### Local AI / ML

| Model / Tool | Usage |
|---|---|
| Qwen2.5 3B | Customer-support generation, normalization, relevance checking, Romanized language generation |
| nomic-embed-text | Text embeddings |
| IndicTrans2 | Hindi/Marathi ↔ English translation |
| Faster-Whisper | Local speech-to-text |

---

## Project Structure

```text
AI-Customer-Support-Chatbot/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminRoute.jsx
│   │   │   ├── Chatbot.jsx
│   │   │   ├── Icon.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── RecentConversations.jsx
│   │   │   └── SourceEvidence.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminLogin.jsx
│   │   │   ├── ApprovedFAQs.jsx
│   │   │   ├── ConversationHistory.jsx
│   │   │   ├── CustomerHome.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── ManageDocuments.jsx
│   │   │   ├── ManageFAQs.jsx
│   │   │   └── Register.jsx
│   │   │
│   │   └── services/
│   │       └── api.js
│   │
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
│
└── server/
    ├── config/
    │   └── db.js
    │
    ├── controllers/
    │   ├── authController.js
    │   ├── documentController.js
    │   ├── faqController.js
    │   └── vectorStoreController.js
    │
    ├── middleware/
    │   ├── authMiddleware.js
    │   └── roleMiddleware.js
    │
    ├── middlewares/
    │   └── uploadMiddleware.js
    │
    ├── models/
    │   ├── Conversation.js
    │   ├── Document.js
    │   ├── FAQ.js
    │   ├── KnowledgeGap.js
    │   └── User.js
    │
    ├── routes/
    │   ├── analyticsRoutes.js
    │   ├── authRoutes.js
    │   ├── chatRoutes.js
    │   ├── conversationRoutes.js
    │   ├── documentRoutes.js
    │   ├── faqRoutes.js
    │   ├── feedbackRoutes.js
    │   ├── healthRoutes.js
    │   ├── knowledgeGapRoutes.js
    │   ├── speechRoutes.js
    │   ├── translationRoutes.js
    │   └── vectorStoreRoutes.js
    │
    ├── services/
    │   ├── documentProcessingService.js
    │   ├── embeddingService.js
    │   ├── faqService.js
    │   ├── groundingService.js
    │   ├── knowledgeGapGroupingService.js
    │   ├── knowledgeGapService.js
    │   ├── llmService.js
    │   ├── localTranslationService.js
    │   ├── ragService.js
    │   ├── speechWorker.py
    │   ├── translationService.js
    │   └── vectorStoreService.js
    │
    ├── server.js
    ├── translation_service.py
    ├── requirements-speech.txt
    └── .env.example
```

---

## Prerequisites

Install and configure the following before running the project:

### Required

- Node.js
- npm
- MongoDB
- ChromaDB
- Ollama

### Local Models

Pull the models used by the server:

```bash
ollama pull qwen2.5:3b
ollama pull nomic-embed-text
```

### Python Speech Environment

Create a dedicated Python environment for speech recognition and install the speech requirements:

```bash
python -m venv server/.venv-speech
server/.venv-speech/Scripts/activate
pip install -r server/requirements-speech.txt
```

### Translation Service

The translation service uses a separate Python environment because IndicTrans2 has its own model and runtime requirements.

The repository contains:

```text
server/translation_service.py
```

Run that service on:

```text
http://127.0.0.1:7000
```

unless the server configuration is changed.

---

## Local Setup

Clone the repository:

```bash
git clone https://github.com/ironhulk5226/AI-Customer-Support-Chatbot.git
cd AI-Customer-Support-Chatbot
```

### 1. Install Frontend Dependencies

```bash
cd client
npm install
```

### 2. Install Backend Dependencies

Open a second terminal:

```bash
cd server
npm install
```

### 3. Configure Environment Variables

Create:

```text
server/.env
client/.env
```

using the corresponding example files.

Do not commit real secrets or local environment files.

### 4. Start MongoDB

Make sure MongoDB is running locally and that the configured database URI is reachable.

### 5. Start ChromaDB

The backend expects ChromaDB at:

```text
localhost:8000
```

Start your local ChromaDB instance and keep it running while using the application.

### 6. Start Ollama

Make sure Ollama is running and the required models are installed.

### 7. Start the IndicTrans2 Service

Run:

```bash
python server/translation_service.py
```

The service listens on port **7000** by default.

### 8. Start the Speech Environment

Make sure `WHISPER_PYTHON` points to the Python executable that has `faster-whisper` installed, or make the correct Python executable available as `python`.

---

## Environment Variables

### Server

A typical local configuration includes:

```env
PORT=5000

MONGODB_URI=mongodb://127.0.0.1:27017/ai_customer_support

OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=qwen2.5:3b

TRANSLATION_SERVICE_URL=http://127.0.0.1:7000

KNOWLEDGE_GAP_DISTANCE_THRESHOLD=0.75
RAG_GROUNDING_THRESHOLD=0.5
RAG_STRONG_SIMILARITY_THRESHOLD=0.5

KNOWLEDGE_GAP_RECURRENCE_THRESHOLD=3

WHISPER_PYTHON=python

JWT_SECRET=your_secret_here
```

Depending on the enabled translation functionality, the application may also use:

```env
SARVAM_API_KEY=your_key_here
```

The main multilingual RAG flow uses the local translation and normalization services described above.

### Client

```env
VITE_API_URL=http://localhost:5000
```

---

## Running the Application

### Start the Frontend

From `client/`:

```bash
npm run dev
```

### Start the Backend

From `server/`:

```bash
npm run dev
```

For a normal Node start:

```bash
npm start
```

### Build the Frontend

```bash
cd client
npm run build
```

### Preview the Frontend Build

```bash
npm run preview
```

### Lint the Frontend

```bash
npm run lint
```

The backend currently exposes a placeholder npm test script rather than a full automated test suite.

---

## Main API Endpoints

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
GET  /api/auth/protected
GET  /api/auth/admin-test
```

### Chat

```text
POST /api/chat
```

The route is authenticated and accepts:

```json
{
  "message": "How do I get my refund?",
  "language": "en"
}
```

For English, the backend can return a Server-Sent Events stream.

For Hindi and Marathi, the backend returns the completed response after translation.

### Conversations

```text
GET  /api/conversations
GET  /api/conversations/:id
POST /api/conversations
```

### Feedback

```text
POST /api/feedback
```

Example:

```json
{
  "conversationId": "conversationObjectId",
  "messageId": "assistantMessageObjectId",
  "feedback": "helpful"
}
```

### Knowledge Gaps

```text
GET  /api/knowledge-gaps
POST /api/knowledge-gaps
```

### Documents

```text
GET    /api/documents
GET    /api/documents/:id
POST   /api/documents/upload
DELETE /api/documents/:id
```

All document management endpoints are admin protected.

### FAQs

```text
GET   /api/faqs
POST  /api/faqs
POST  /api/faqs/generate
PUT   /api/faqs/:id
PATCH /api/faqs/:id/reject
PATCH /api/faqs/:id/approve
```

FAQ management endpoints are admin protected.

### Vector Store

```text
GET /api/vector-store/stats
```

### Speech

```text
POST /api/speech
```

The language is passed as a query parameter:

```text
/api/speech?language=en
/api/speech?language=hi
/api/speech?language=mr
```

### Translation

```text
POST /api/translate
```

### Admin Analytics

```text
GET /api/admin/analytics
```

---

## How Data Moves Through the System

### Customer Chat

```text
React Chatbot
    │
    ▼
POST /api/chat
    │
    ▼
JWT authentication
    │
    ▼
Language/style normalization
    │
    ▼
Embedding with nomic-embed-text
    │
    ▼
ChromaDB top-k semantic retrieval
    │
    ├── Strong approved FAQ
    │       └── Verified answer directly
    │
    ├── Strong regular match
    │       └── Grounded local LLM answer
    │
    └── Borderline match
            └── Context relevance checker
                    │
                    ├── YES → grounded answer
                    └── NO  → knowledge gap
    │
    ▼
Optional translation
    │
    ▼
Source metadata + answer
    │
    ▼
React UI
```

### Admin Document Ingestion

```text
Admin upload
   │
   ▼
Multer
   │
   ▼
Document metadata in MongoDB
   │
   ▼
Extract text
   │
   ▼
Chunk text
   │
   ▼
Generate embeddings
   │
   ▼
ChromaDB upsert
   │
   ▼
Document marked processed
```

### FAQ Knowledge Expansion

```text
Unknown question
   │
   ▼
Knowledge gap
   │
   ▼
Recurring threshold
   │
   ▼
FAQ draft generation
   │
   ▼
Administrator verified answer
   │
   ▼
Approval
   │
   ▼
Embedding + ChromaDB
   │
   ▼
Knowledge gap resolved
```

---

## Security and Privacy Design

The repository implements several application-level protections.

### Authentication

- Passwords are hashed with `bcryptjs`.
- Login issues JWTs.
- Protected routes require a valid bearer token.

### Authorization

Admin operations use both:

```text
protect
requireAdmin
```

This separates authentication from role-based authorization.

### Conversation Ownership

Conversation reads and updates are filtered by both:

```text
conversation ID
+
authenticated user ID
```

This prevents one authenticated customer from directly loading another customer's conversation through the conversation API.

### Feedback Ownership

Feedback updates also resolve the conversation through the authenticated user ID before modifying an assistant message.

### Local AI Orientation

The core chatbot LLM and embedding generation are implemented against the local Ollama runtime. This keeps the primary RAG generation workflow local to the machine running the application.

### Secrets

The repository excludes environment files such as:

```text
.env
.env.*
```

Never commit:

- Passwords
- JWT secrets
- API keys
- Database credentials
- Local virtual environments
- Generated ChromaDB data

---

## Important Implementation Details

### Approved FAQ Direct Answering

A strong semantic match against an approved FAQ is treated differently from ordinary retrieved context.

When the strongest result is:

```text
metadata.type === "faq"
```

and contains verified evidence, the RAG service returns the stored administrator-approved answer directly instead of sending that answer through Qwen.

This reduces the chance that the local LLM rewrites a verified FAQ into an unsupported response.

### Context Relevance

Borderline retrieval results are evaluated collectively.

The relevance checker is explicitly instructed that multiple chunks can jointly contain the information needed to answer a question.

It fails closed when it receives an unexpected response or encounters an error.

### Grounding Score

The grounding service compares meaningful answer words against retrieved context words.

The resulting score is currently used for monitoring/logging rather than blocking output.

### Knowledge-Gap Grouping

The grouping service uses:

- Token normalization
- Stop-word removal
- Lightweight canonicalization
- Jaccard similarity

This is intentionally lightweight and does not require another embedding model for grouping.

### Deterministic FAQ Vector IDs

Approved FAQ vectors use:

```text
faq_<FAQ MongoDB ID>
```

When an approved FAQ is edited, the same vector ID is upserted after generating a new embedding.

---

## Testing

The repository contains a grounding-score test utility:

```text
server/testGrounding.js
```

The project has also been manually validated through the major workflows, including:

- Semantic document retrieval
- Unavailable-knowledge behavior
- Borderline relevance checks
- Approved FAQ retrieval
- Hindi output
- Marathi output
- Repeated knowledge-gap detection
- FAQ draft generation
- FAQ approval
- FAQ embedding insertion
- Response feedback persistence

### Recommended Smoke-Test Sequence

```text
1. Register customer
2. Log in
3. Ask a known knowledge-base question
4. Verify answer + sources
5. Ask a paraphrased version
6. Verify semantic retrieval
7. Ask an unsupported question
8. Verify knowledge-gap recording
9. Repeat the unsupported question
10. Log in as admin
11. Review recurring knowledge gap
12. Generate FAQ draft
13. Enter verified answer
14. Approve FAQ
15. Ask a paraphrased version again
16. Verify direct approved-FAQ response
17. Submit Helpful / Not Helpful feedback
18. Reload conversation
19. Open admin analytics
20. Test Hindi, Marathi, and voice input
```

---

## Limitations and Operational Notes

This repository is a local-AI-oriented development project and has several practical requirements:

1. **Ollama must be running** for embeddings, LLM generation, normalization, and Romanized answer generation.
2. **ChromaDB must be running separately** at the configured address.
3. **MongoDB must be available** for accounts, conversations, documents, FAQs, and knowledge gaps.
4. **IndicTrans2 requires a separate Python service** and its model dependencies.
5. **Faster-Whisper requires a Python environment** with the speech dependency installed.
6. The backend's npm test script is currently a placeholder; functional validation is primarily manual and service-level.
7. The current grounding score is a lexical monitoring metric rather than a complete semantic factuality evaluator.
8. Knowledge-gap grouping uses lightweight Jaccard similarity and token rules, so complex multilingual semantic grouping can still require refinement.
9. The current application is structured primarily for local development and demonstration rather than one-command production deployment.
10. Large local resources such as virtual environments and ChromaDB runtime data are intentionally excluded from Git.

---

## Troubleshooting

### Ollama Errors

Check that Ollama is running and the models exist:

```bash
ollama list
```

Required model names:

```text
qwen2.5:3b
nomic-embed-text
```

### ChromaDB Connection Errors

The vector store is configured for:

```text
localhost:8000
```

Make sure ChromaDB is started before using document ingestion or chat retrieval.

### MongoDB Errors

Verify the configured:

```env
MONGODB_URI
```

and make sure MongoDB is running.

### Translation Errors

Check that:

```text
server/translation_service.py
```

is running and that:

```env
TRANSLATION_SERVICE_URL=http://127.0.0.1:7000
```

points to the correct address.

### Speech Errors

Verify:

```env
WHISPER_PYTHON=...
```

and ensure that the selected Python executable can import `faster_whisper`.

### Frontend Cannot Reach Backend

Verify:

```env
VITE_API_URL=http://localhost:5000
```

and confirm the Express server is listening on port 5000.

### Admin Route Redirects to Login

Verify that:

- The user is logged in.
- The JWT is valid.
- The JWT contains the expected role.
- The account has the admin role.

---

## Future Improvements

Potential next-stage enhancements include:

- Automated unit and integration tests.
- End-to-end browser testing.
- Better semantic knowledge-gap clustering.
- More robust grounding evaluation.
- Evaluation datasets and retrieval-quality benchmarks.
- Background document indexing jobs.
- Production deployment configuration.
- Observability and structured logging.
- Rate limiting and request validation hardening.
- More language support.
- Streaming support for translated responses.
- Model quantization and performance optimization for low-resource hardware.
- More granular analytics and feedback analysis.

---

## License

The repository currently does not declare a project-specific open-source license in its root documentation.

Until a license is added, treat the source code as **all rights reserved** by default and follow the repository owner's intended usage terms.

---

## Acknowledgements

This project combines open-source and local AI technologies including:

- React
- Vite
- Tailwind CSS
- Node.js
- Express
- MongoDB / Mongoose
- ChromaDB
- Ollama
- Qwen2.5
- nomic-embed-text
- IndicTrans2
- Faster-Whisper

---

## Project Status

The `master` branch contains the current integrated implementation of:

- RAG customer support
- Local LLM generation
- Source evidence
- Multilingual chat
- Voice input
- Conversation persistence
- Response feedback
- Knowledge-gap detection
- Recurring-gap grouping
- AI FAQ draft generation
- Administrator FAQ approval
- FAQ embedding into ChromaDB
- Document management
- Approved FAQ management
- Administrator analytics

The repository is organized as a **React frontend + Express backend + MongoDB + ChromaDB + local AI services** application.
