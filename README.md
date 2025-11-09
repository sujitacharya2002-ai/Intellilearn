
# IntelliLearn: AI-Powered Learning Assistant

## 1. Overview

IntelliLearn is a personal AI-powered learning assistant designed to transform educational material into a dynamic and engaging study experience. The application provides a structured environment where users can create courses, add chapters, and upload source materials (PDFs, text files, images). Using the power of Google's Gemini AI, IntelliLearn then generates a suite of powerful, custom study aids from the provided content.

All user data, including courses, chapters, and generated content, is saved locally in the browser's `localStorage`, ensuring persistence across sessions without the need for a backend server or user accounts.

## 2. Core Features

### Course & Chapter Management
- **Create Courses:** Users can create multiple courses to organize their learning topics.
- **Delete Courses:** Unneeded courses and all their associated content can be easily removed.
- **Add Chapters:** Within each course, users can add chapters, which serve as containers for study materials.
- **Delete Chapters:** Individual chapters can be deleted from a course.

### Content Upload & Processing
- **Multi-Format Support:** Upload source material in various formats:
  - **PDF (`.pdf`):** Text is automatically extracted using the `pdf.js` library.
  - **Text (`.txt`):** Plain text content is read directly.
  - **Image (`.jpg`, `.png`):** Images are processed as visual input for the AI.
- **Drag-and-Drop Interface:** A modern, intuitive file upload component allows users to either click to select a file or drag and drop it into the application.
- **Processing Feedback:** The UI provides clear feedback during file processing, especially for larger PDF files.

### AI-Generated Study Aids

Once source material is uploaded, users can generate the following study aids with a single click:

1.  **AI Summaries:**
    - Generates a concise, easy-to-digest summary of the source material.
    - Formats the output with headings and bullet points for maximum clarity and readability.

2.  **Interactive Quizzes:**
    - Automatically creates a multiple-choice quiz based on the key information in the content.
    - Each question includes several options and an interactive checking mechanism that provides immediate feedback on whether the selected answer is correct.

3.  **Flippable Flashcards:**
    - Produces a set of digital flashcards for key terms, concepts, and definitions.
    - The viewer features an interactive, 3D flipping animation and simple navigation controls, making memorization effective and engaging.

4.  **Manga Mode:**
    - A unique feature that converts study material into a visually compelling manga (Japanese-style comic).
    - **Two-Step Process:**
        1.  **Script Generation:** The AI first crafts a multi-panel script with scene descriptions, dialogue, narration, and character emotions. The number of panels is dynamically calculated based on the length of the source text.
        2.  **Image Generation:** For each panel in the script, the AI generates a unique, black-and-white manga-style image that visually represents the scene. Images are generated sequentially to provide progressive feedback to the user.

## 3. Technology Stack

- **Frontend Framework:** React with TypeScript
- **Styling:** Tailwind CSS for a utility-first, responsive design.
- **AI Model Integration:** `@google/genai` SDK for interacting with the Google Gemini API.
  - **`gemini-2.5-flash`:** Used for all text-based generation tasks (summary, quiz, flashcards, manga script) due to its speed and strong reasoning capabilities.
  - **`gemini-2.5-flash-image`:** Used for generating the black-and-white manga panel images.
- **PDF Processing:** `pdf.js` library for client-side text extraction from PDF files.
- **Data Persistence:** Browser `localStorage` API.

## 4. Project Structure

The application is organized into a modular structure for clarity and maintainability.

```
/
├── components/
│   ├── ActionButtons.tsx     # Buttons to trigger AI generation
│   ├── ChapterView.tsx       # Main view for a single chapter's content
│   ├── FileUpload.tsx        # Drag-and-drop file upload component
│   ├── FlashcardViewer.tsx   # Interactive flashcard display
│   ├── MangaViewer.tsx       # Displays the generated manga panels
│   ├── Quiz.tsx              # Renders the interactive quiz
│   ├── ResultDisplay.tsx     # Tabbed container for generated content
│   └── Spinner.tsx           # Reusable loading spinner
├── services/
│   └── geminiService.ts      # All logic for Gemini API calls and response parsing
├── App.tsx                   # Main component, handles state and view routing
├── index.html                # HTML entry point
├── index.tsx                 # React application root
├── metadata.json             # Application name and description
└── types.ts                  # TypeScript type definitions for the application
```

## 5. Architectural Overview

### State Management
- The primary application state (the `courses` array) is managed within the `App.tsx` component using React's `useState` hook.
- State is passed down to child components via props.
- State modifications are handled by callback functions (e.g., `onUpdateChapter`) passed down from `App.tsx`, ensuring a unidirectional data flow.
- The `useEffect` hook in `App.tsx` is used to synchronize the state with `localStorage` whenever the `courses` array changes.

### View Routing
- The application uses a simple state-based routing system managed in `App.tsx`.
- The `view` state variable (`'DASHBOARD'`, `'COURSE'`, or `'CHAPTER'`) determines which main component is rendered, providing a smooth, single-page application experience without a dedicated routing library.

### Gemini Service (`geminiService.ts`)
- This file acts as the sole interface to the Google Gemini API.
- **Prompt Engineering:** Each function (`generateSummary`, `generateQuiz`, etc.) contains a carefully crafted prompt that instructs the AI on its task, the desired output format, and any specific constraints.
- **JSON Mode:** For quizzes, flashcards, and manga scripts, the service leverages Gemini's JSON mode by providing a `responseSchema`. This ensures the AI's output is a well-structured, parsable JSON object, reducing the risk of errors.
- **Image Generation:** The `generateMangaPanelImage` function uses the `gemini-2.5-flash-image` model and specifies `Modality.IMAGE` to request an image as output.
- **Robust Parsing:** A helper function, `parseJsonResponse`, safely handles the AI's text response, cleaning it of potential markdown artifacts (like code fences) before parsing it into a TypeScript object.

### UI/UX Design
- **Modern & Clean:** The UI is designed to be clean, with ample whitespace and a calming color palette (based on Tailwind's `sky` and `slate` colors).
- **Responsive:** The layout adapts smoothly to different screen sizes, from mobile devices to desktops.
- **User Feedback:** The application provides constant feedback to the user through:
    - **Loading States:** Spinners and descriptive messages (`"Generating panel 2 of 4..."`) inform the user about ongoing processes.
    - **Error Handling:** Clear, user-friendly error messages are displayed if an API call fails.
    - **Visual Transitions:** Subtle animations on hover, focus, and view changes make the application feel more dynamic and polished.
