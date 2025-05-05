# AI-titude 🎙️

AI-titude is an AI-powered application that allows users to extract text, detect emotions, and generate audio and music based on prompts. It leverages advanced AI models for text analysis, emotion detection, and audio synthesis.

---

## Features

- **Text Extraction**: Upload files to extract text content.
- **Emotion Detection**: Analyze extracted text to detect emotions.
- **Audio Generation**: Generate audio with customizable voice settings.
- **Music Generation**: Create music based on text prompts and detected emotions.
- **Theme Switching**: Toggle between light and dark themes.

---

## Project Structure

```
ai-titude/
├── .env                # Environment variables
├── .gitignore          # Git ignore file
├── credentials.json    # Credentials for external services
├── LICENSE             # Project license
├── package.json        # Node.js dependencies and scripts
├── README.md           # Project documentation
├── requirement.txt     # Python dependencies
├── test.py             # Python test script
├── backend/            # Backend assets (e.g., images)
├── frontend/           # React frontend application
│   ├── public/         # Static assets (HTML, icons, etc.)
│   ├── src/            # React source code
│   └── README.md       # Frontend-specific documentation
└── music_with_emotions/ # Music generation logic
```

---

## Installation

### Prerequisites

- Node.js (v14 or higher)
- Python (v3.8 or higher)
- npm or yarn
- pip (Python package manager)

### Backend Setup

1. Navigate to the project root directory.
2. Install Python dependencies:
   ```bash
   pip install -r requirement.txt
   ```
3. Configure the `.env` file with necessary environment variables.

### Frontend Setup

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install Node.js dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Usage

1. **Upload Files**: Use the file upload feature to extract text.
2. **Analyze Emotions**: View detected emotions and gender from the extracted text.
3. **Generate Audio**: Customize voice settings and generate audio.
4. **Generate Music**: Create music based on text prompts and emotions.

---

## API Endpoints

### Backend APIs

- **Text Analysis**: `POST /api/analyze-files/`
- **Audio Generation**: `POST /api/generate-audio/`
- **Available Voices**: `GET /api/available-voices/`
- **Music Generation**: `POST /api/prompt-based-music-generation`

---

## Frontend Overview

The frontend is built using React and includes the following key components:

- **Theme Toggle**: Switch between light and dark modes.
- **File Upload**: Upload files for text extraction.
- **Audio Player**: Play generated audio files.
- **Music Player**: Play generated music files.

---

## Scripts

### Available Scripts

In the `frontend` directory, you can run:

- `npm start`: Runs the app in development mode.
- `npm test`: Launches the test runner.
- `npm run build`: Builds the app for production.
- `npm run eject`: Ejects the app configuration.

---

## Learn More

- [React Documentation](https://reactjs.org/)
- [Create React App Documentation](https://facebook.github.io/create-react-app/docs/getting-started)

---

## License

This project is licensed under the terms of the [LICENSE](LICENSE) file.

---

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

---

## Acknowledgments

- Built with [Create React App](https://github.com/facebook/create-react-app).
- Powered by AI models for text, emotion, and audio processing.
````

This README.md provides a comprehensive overview of your project, including its features, setup instructions, usage, and API details. Let me know if you'd like to refine any section further!