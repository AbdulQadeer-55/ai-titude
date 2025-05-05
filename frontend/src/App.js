import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import { FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import Modal from 'react-modal';
import './App.css';

Modal.setAppElement('#root');

function App() {
  const [files, setFiles] = useState([]);
  const [extractedText, setExtractedText] = useState('');
  const [detectedEmotion, setDetectedEmotion] = useState('');
  const [detectedGender, setDetectedGender] = useState('unknown');
  const [isLoading, setIsLoading] = useState(false);
  const [dictionary, setDictionary] = useState(new Set());
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentWord, setCurrentWord] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [currentStart, setCurrentStart] = useState(null);
  const [currentEnd, setCurrentEnd] = useState(null);
  const [voiceSettings, setVoiceSettings] = useState({
    language_code: 'en-US',
    voice_name: 'coral',
    gender: 'NEUTRAL',
    speaking_rate: 1.0,
    pitch: 0.0,
    volume_gain_db: 0.0,
    audio_effects: [],
    emotion: 'happiness',
    emotion_intensity: 70,
    secondary_emotion: 'none',
    secondary_emotion_intensity: 0,
    tone: 'empathetic',
    style: 'conversational',
    pacing: 100,
    pause_frequency: 'medium',
    emphasis_words: '',
    instruction_template: '',
    custom_instructions: '',
  });
  const [availableVoices, setAvailableVoices] = useState([]);
  const [audioUrl, setAudioUrl] = useState(null);
  const [theme, setTheme] = useState('light');
  const [errorMessage, setErrorMessage] = useState('');
  const [genderWarning, setGenderWarning] = useState('');
  const [ttsProvider, setTtsProvider] = useState('gpt4o_mini');
  const [warnings, setWarnings] = useState({ pacing: '', instructions: '' });
  const [voiceSectionExpanded, setVoiceSectionExpanded] = useState(true);

  const [musicLink,setMusicLink]=useState('')


  const textAreaRef = useRef(null);

  const emotionOptions = useMemo(
    () => [
      'neutral',
      'sympathetic',
      'sincere',
      'calm',
      'serene',
      'sadness',
      'happiness',
      'fear',
      'horror',
      'surprise',
      'anger',
      'rage',
      'love',
      'excitement',
      'anxiety',
      'disgust',
    ],
    []
  );

  const secondaryEmotionOptions = useMemo(() => ['none', ...emotionOptions], [emotionOptions]);

  const toneOptions = useMemo(
    () => [
      'empathetic',
      'solution-focused',
      'gentle',
      'authoritative',
      'warm',
      'soothing',
      'excited',
      'noble',
      'chaotic',
      'calm',
    ],
    []
  );

  const styleOptions = useMemo(
    () => [
      'conversational',
      'professional',
      'dramatic',
      'monotone',
      'narrative',
      'poetic',
      'motivational',
      'whispered',
      'sarcastic',
      'childlike',
      'commanding',
      'meditative',
      'sports-coach',
      'bedtime-story',
      'medieval-knight',
      'mad-scientist',
      'patient-teacher',
      'auctioneer',
      'old-timey',
      'chill-surfer',
    ],
    []
  );

  const pauseFrequencyOptions = useMemo(() => ['low', 'medium', 'high'], []);

  const instructionTemplates = useMemo(
    () => ({
      none: '',
      sympathetic: 'Speak warmly and empathetically, like comforting a friend',
      sincere: 'Speak with genuine concern, pausing briefly after apologies',
      calm: 'Speak in a calm, composed tone with quiet authority',
      serene: 'Speak softly and slowly, with a soothing tone for relaxation',
      sadness: 'Speak softly with slight vocal trembling, as if recalling a painful memory',
      happiness: 'Speak with a bright, cheerful tone and a slight smile',
    }),
    []
  );

  const gpt4oVoices = useMemo(
    () => [
      { name: 'alloy', gender: 'NEUTRAL', language_code: 'en-US' },
      { name: 'ash', gender: 'NEUTRAL', language_code: 'en-US' },
      { name: 'ballad', gender: 'NEUTRAL', language_code: 'en-US' },
      { name: 'coral', gender: 'NEUTRAL', language_code: 'en-US' },
      { name: 'echo', gender: 'NEUTRAL', language_code: 'en-US' },
      { name: 'fable', gender: 'NEUTRAL', language_code: 'en-US' },
      { name: 'onyx', gender: 'NEUTRAL', language_code: 'en-US' },
      { name: 'nova', gender: 'NEUTRAL', language_code: 'en-US' },
      { name: 'sage', gender: 'NEUTRAL', language_code: 'en-US' },
      { name: 'shimmer', gender: 'NEUTRAL', language_code: 'en-US' },
      {name: 'alloy', gender: 'NEUTRAL', language_code: 'ur-PK'},
      {name: 'ash', gender: 'NEUTRAL', language_code: 'ur-PK'},
      {name: 'ballad', gender: 'NEUTRAL', language_code: 'ur-PK'},
      {name: 'coral', gender: 'NEUTRAL', language_code: 'ur-PK'},
      {name: 'echo', gender: 'NEUTRAL', language_code: 'ur-PK'},
      {name: 'fable', gender: 'NEUTRAL', language_code: 'ur-PK'},
      {name: 'onyx', gender: 'NEUTRAL', language_code: 'ur-PK'},
      {name: 'nova', gender: 'NEUTRAL', language_code: 'ur-PK'},
      {name: 'sage', gender: 'NEUTRAL', language_code: 'ur-PK'},
      {name: 'shimmer', gender: 'NEUTRAL', language_code: 'ur-PK'}
    ],
    []
  );

  useEffect(() => {
    fetch('/urdu_words.txt')
      .then((response) => response.text())
      .then((text) => {
        const words = text.split('\n').map((word) => word.trim()).filter(Boolean);
        setDictionary(new Set(words));
      })
      .catch((err) => console.error('Error loading dictionary:', err));
  }, []);

  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/available-voices/');
        setAvailableVoices(response.data.voices);
        if (response.data.voices.length > 0 && ttsProvider === 'google') {
          const firstLanguage = response.data.voices.find((lang) => lang.language_code === 'en-US') || response.data.voices[0];
          const firstVoice = firstLanguage.voices[0];
          setVoiceSettings((prev) => ({
            ...prev,
            language_code: firstLanguage.language_code,
            voice_name: firstVoice.name,
            gender: firstVoice.gender,
          }));
        }
      } catch (error) {
        const errorData = error.response?.data?.error || {};
        setErrorMessage(errorData.message || 'Failed to load available voices.');
      }
    };
    fetchVoices();
  }, [ttsProvider]);

  useEffect(() => {
    if (extractedText && detectedGender !== 'unknown' && ttsProvider === 'google') {
      if (detectedGender !== voiceSettings.gender.toLowerCase()) {
        setGenderWarning(
          `Warning: Text appears to be in ${detectedGender} form, but you selected a ${voiceSettings.gender.toLowerCase()} voice. Audio generation is disabled until genders match.`
        );
        setAudioUrl(null);
      } else {
        setGenderWarning('');
      }
    } else {
      setGenderWarning('');
    }
  }, [voiceSettings, extractedText, detectedGender, ttsProvider]);

  useEffect(() => {
    const validateSettings = () => {
      let pacingWarning = '';
      let instructionsWarning = '';

      if (voiceSettings.style === 'sports-coach' && voiceSettings.pacing < 150) {
        pacingWarning = 'Sports Coach style typically uses faster pacing (≥150%) for an energetic tone.';
      } else if (voiceSettings.style === 'bedtime-story' && voiceSettings.pacing > 150) {
        pacingWarning = 'Bedtime Story style typically uses steady pacing (≤150%) for a magical tone.';
      } else if (voiceSettings.style === 'patient-teacher' && voiceSettings.pacing > 130) {
        pacingWarning = 'Patient Teacher style typically uses slower pacing (≤130%) for a gentle tone.';
      } else if (voiceSettings.style === 'auctioneer' && voiceSettings.pacing < 150) {
        pacingWarning = 'Auctioneer style typically uses faster pacing (≥150%) for an urgent tone.';
      } else if (voiceSettings.style === 'chill-surfer' && voiceSettings.pacing > 130) {
        pacingWarning = 'Chill Surfer style typically uses slower pacing (≤130%) for a relaxed tone.';
      } else if (voiceSettings.style === 'meditative' && voiceSettings.pacing > 100) {
        pacingWarning = 'Meditative style typically uses slower pacing (≤100%) for a hypnotic effect.';
      } else if (voiceSettings.emotion === 'serene' && voiceSettings.pacing > 120) {
        pacingWarning = 'Serene emotion typically uses slower pacing (≤120%) for a soothing effect.';
      }

      const instructions = voiceSettings.custom_instructions.toLowerCase();
      const contradictions = {
        sadness: ['cheerful', 'excited', 'happy'],
        serene: ['fast', 'hurried', 'excited'],
        sincere: ['angry', 'rage', 'disgust'],
        'sports-coach': ['calm', 'soft', 'relaxed'],
        'bedtime-story': ['fast', 'urgent'],
        'patient-teacher': ['fast', 'hurried'],
        'medieval-knight': ['casual', 'modern'],
        'chill-surfer': ['formal', 'structured'],
        meditative: ['fast', 'hurried'],
        childlike: ['formal', 'professional'],
      };

      if (instructions && contradictions[voiceSettings.emotion]) {
        const hasContradiction = contradictions[voiceSettings.emotion].some((word) => instructions.includes(word));
        if (hasContradiction) {
          instructionsWarning = `The instruction may not align with the '${voiceSettings.emotion}' emotion. Consider adjusting for a more natural tone.`;
        }
      } else if (instructions && contradictions[voiceSettings.style]) {
        const hasContradiction = contradictions[voiceSettings.style].some((word) => instructions.includes(word));
        if (hasContradiction) {
          instructionsWarning = `The instruction may not align with the '${voiceSettings.style}' style. Consider adjusting for a more natural tone.`;
        }
      } else if (instructions && instructions.length < 10) {
        instructionsWarning = "Try a more detailed instruction, e.g., 'Speak with genuine concern'.";
      }

      setWarnings({ pacing: pacingWarning, instructions: instructionsWarning });
    };

    validateSettings();
  }, [voiceSettings]);

  const handleTextChange = (e) => {
    const text = e.target.innerText;
    setExtractedText(text);
  };

  const highlightIncorrectWords = (text) => {
    if (!text) return null;
    const parts = text.split(/(\s+)/);
    let charIndex = 0;

    return parts.map((part, index) => {
      const key = `${part}-${index}`;
      if (index % 2 === 0 && part.trim().length > 0) {
        const start = charIndex;
        charIndex += part.length;
        if (!dictionary.has(part)) {
          return (
            <span
              key={key}
              className="incorrect-word"
              data-start={start}
              data-end={start + part.length}
            >
              {part}
              <span className="warning-icon">
                <FaExclamationTriangle aria-label="Incorrect word warning" />
              </span>
            </span>
          );
        }
        return <span key={key}>{part}</span>;
      } else {
        charIndex += part.length;
        return <span key={key}>{part}</span>;
      }
    });
  };

  const handleWordClick = (e) => {
    if (e.target.classList.contains('incorrect-word')) {
      const word = e.target.innerText.replace(/[^a-zA-Z\u0600-\u06FF]/g, '');
      const start = parseInt(e.target.getAttribute('data-start'), 10);
      const end = parseInt(e.target.getAttribute('data-end'), 10);
      showSuggestions(word, start, end);
    }
  };

  const getSuggestions = (word) => {
    const dictArray = Array.from(dictionary);
    return dictArray
      .filter((w) => w.startsWith(word[0]) && Math.abs(w.length - word.length) <= 2)
      .slice(0, 5);
  };

  const showSuggestions = (word, start, end) => {
    const suggs = getSuggestions(word);
    setCurrentWord(word);
    setSuggestions(suggs);
    setCurrentStart(start);
    setCurrentEnd(end);
    setModalIsOpen(true);
  };

  const replaceWord = (suggestion) => {
    const before = extractedText.substring(0, currentStart);
    const after = extractedText.substring(currentEnd);
    const newText = before + suggestion + after;
    setExtractedText(newText);
    setModalIsOpen(false);
    setTimeout(() => textAreaRef.current.focus(), 0);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
    setErrorMessage('');
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setErrorMessage('Please select at least one file to upload.');
      return;
    }
    setIsLoading(true);
    setErrorMessage('');
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    try {
      const response = await axios.post('http://localhost:8000/api/analyze-files/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setExtractedText(response.data.extracted_text);
      setDetectedEmotion(response.data.detected_emotion);
      setDetectedGender(response.data.detected_gender);
      setAudioUrl(null);
    } catch (error) {
      const errorData = error.response?.data?.error || {};
      const message = errorData.message || 'An unexpected error occurred while analyzing files.';
      const details = errorData.details ? ` Details: ${errorData.details}` : '';
      setErrorMessage(`${message}${details}`);
    } finally {
      setIsLoading(false);
    }
  };

  const updateVoiceSetting = (field, value) => {
    setVoiceSettings((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'language_code') {
        if (ttsProvider === 'gpt4o_mini') {
          const validVoices = gpt4oVoices.filter((v) => v.language_code === value);
          updated.voice_name = validVoices.length > 0 ? validVoices[0].name : 'coral';
          updated.gender = 'NEUTRAL';
        } else {
          const selectedLanguage = availableVoices.find((lang) => lang.language_code === value);
          if (selectedLanguage?.voices.length > 0) {
            updated.voice_name = selectedLanguage.voices[0].name;
            updated.gender = selectedLanguage.voices[0].gender;
          }
        }
      }
      if (field === 'voice_name') {
        if (ttsProvider === 'gpt4o_mini') {
          const selectedVoice = gpt4oVoices.find((voice) => voice.name === value);
          updated.gender = selectedVoice ? selectedVoice.gender : 'NEUTRAL';
        } else {
          const selectedLanguage = availableVoices.find((lang) => lang.language_code === prev.language_code);
          const selectedVoice = selectedLanguage?.voices.find((voice) => voice.name === value);
          updated.gender = selectedVoice ? selectedVoice.gender : prev.gender;
        }
      }
      if (field === 'emotion') {
        updated.instruction_template = value in instructionTemplates ? value : 'none';
        updated.custom_instructions = instructionTemplates[updated.instruction_template];
        const emotionStyleMap = {
          happiness: 'sports-coach',
          serene: 'bedtime-story',
          sadness: 'patient-teacher',
          anger: 'medieval-knight',
          surprise: 'mad-scientist',
        };
        updated.style = emotionStyleMap[value] || prev.style;
      }
      if (field === 'style') {
        const styleDefaults = {
          'sports-coach': { tone: 'excited', pacing: 200 },
          'bedtime-story': { tone: 'warm', pacing: 130},
          'professional': { tone: 'neutral', pacing: 150 },
          'medieval-knight': { tone: 'noble', pacing: 140},
          'mad-scientist': { tone: 'chaotic', pacing: 180 },
          'patient-teacher': { tone: 'calm', pacing: 120 },
        };
        const defaults = styleDefaults[value] || { tone: 'empathetic', pacing: 100 };
        updated.tone = defaults.tone;
        updated.pacing = defaults.pacing;
        if (defaults.language_code) updated.language_code = defaults.language_code;
      }
      if (field === 'instruction_template') {
        updated.custom_instructions = instructionTemplates[value] || '';
      }
      if (
        ['speaking_rate', 'pitch', 'volume_gain_db', 'emotion_intensity', 'secondary_emotion_intensity', 'pacing'].includes(
          field
        )
      ) {
        updated[field] = parseFloat(value);
      }
      return updated;
    });
  };

  const handleGenerateAudio = async () => {
    if (!extractedText) {
      setErrorMessage('No text available to generate audio.');
      return;
    }
    if (ttsProvider === 'google' && detectedGender !== 'unknown' && detectedGender !== voiceSettings.gender.toLowerCase()) {
      setErrorMessage('Audio generation is disabled due to gender mismatch.');
      return;
    }
    setIsLoading(true);
    setErrorMessage('');
    try {
      let instructions = `Speak in a ${voiceSettings.emotion} tone with ${voiceSettings.emotion_intensity}% intensity, ${
        voiceSettings.secondary_emotion !== 'none'
          ? `blended with ${voiceSettings.secondary_emotion} at ${voiceSettings.secondary_emotion_intensity}% intensity, `
          : ''
      }${voiceSettings.tone} tone, ${voiceSettings.style} style, with pacing at ${voiceSettings.pacing}% and pause frequency set to ${
        voiceSettings.pause_frequency
      }.`;

      if (voiceSettings.emphasis_words) {
        instructions += ` Emphasize the following words: ${voiceSettings.emphasis_words}.`;
      }

      if (voiceSettings.custom_instructions.trim()) {
        instructions = `${voiceSettings.custom_instructions}. ${instructions}`;
      }

      const voiceSettingsPayload = {
        language_code: voiceSettings.language_code,
        voice_name: voiceSettings.voice_name,
        gender: voiceSettings.gender,
        instructions,
      };

      if (ttsProvider === 'google') {
        voiceSettingsPayload.speaking_rate = voiceSettings.speaking_rate;
        voiceSettingsPayload.pitch = voiceSettings.pitch;
        voiceSettingsPayload.volume_gain_db = voiceSettings.volume_gain_db;
        voiceSettingsPayload.audio_effects = voiceSettings.audio_effects;
      }

      const response = await axios.post(
        'http://localhost:8000/api/generate-audio/',
        {
          text: extractedText,
          voice_settings_list: [voiceSettingsPayload],
          detected_gender: detectedGender,
          tts_provider: ttsProvider,
        },
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'audio/mp3' }));
      await generatePromptBasedMusic();
      setAudioUrl(url);
    } catch (error) {
      let message = 'An unexpected error occurred while generating audio.';
      if (error.response) {
        try {
          const text = await error.response.data.text();
          const errorData = JSON.parse(text);
          message = errorData.error?.message || message;
          const details = errorData.error?.details ? ` Details: ${errorData.error.details}` : '';
          message += details;
        } catch (e) {
          message =
            error.response.status === 500
              ? 'Server error: Failed to generate audio. Please check the backend logs.'
              : `Error ${error.response.status}: ${error.response.statusText}`;
        }
      }
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetApp = () => {
    setFiles([]);
    setExtractedText('');
    setDetectedEmotion('');
    setDetectedGender('unknown');
    setAudioUrl(null);
    setErrorMessage('');
    setGenderWarning('');
    setTtsProvider('gpt4o_mini');
    setVoiceSettings({
      language_code: 'en-US',
      voice_name: 'coral',
      gender: 'NEUTRAL',
      speaking_rate: 1.0,
      pitch: 0.0,
      volume_gain_db: 0.0,
      audio_effects: [],
      emotion: 'happiness',
      emotion_intensity: 70,
      secondary_emotion: 'none',
      secondary_emotion_intensity: 0,
      tone: 'empathetic',
      style: 'conversational',
      pacing: 100,
      pause_frequency: 'medium',
      emphasis_words: '',
      instruction_template: '',
      custom_instructions: '',
    });
  };

  //  Generate prompt based music
  const generatePromptBasedMusic=async()=>{
    const call=await fetch('http://localhost:8000/api/prompt-based-music-generation', {method: 'POST', body: JSON.stringify({prompt: extractedText})});
    const response=await call.json();
    console.log('res', response)
    setMusicLink(response.music_file_path);



             
  }

  return (
    <div className={`App ${theme}`}>
      <header className="app-header">
        <div className="header-content">
          <h1>AI-titude 🎙️</h1>
          <p>Extract text, detect emotions, and generate audio with AI</p>
          <button
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
          </button>
        </div>
      </header>

      <main className="app-main">
        {errorMessage && (
          <div className="error-message" role="alert">
            <FaExclamationTriangle aria-hidden="true" /> {errorMessage}
            <button onClick={() => setErrorMessage('')} className="close-error" aria-label="Dismiss error">
              ✖
            </button>
          </div>
        )}

        <section className="section file-upload">
          <h2 className="upload-title">
            <span className="upload-icon">📤</span> Upload Your Files
          </h2>
          <div className="upload-container">
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="file-input"
              id="file-upload"
              accept=".jpg,.jpeg,.png,.bmp,.tiff,.tif,.gif,.pdf,.docx,.txt"
            />
            <label htmlFor="file-upload" className="file-label">
              <span className="button-icon">📂</span> Choose Files
            </label>
            <button
              onClick={handleUpload}
              disabled={isLoading || files.length === 0}
              className="action-button"
              aria-label="Analyze selected files"
            >
              {isLoading ? (
                <span className="spinner" aria-label="Loading"></span>
              ) : (
                <>
                  <span className="button-icon">🔍</span> Analyze Files
                </>
              )}
            </button>
            <button onClick={resetApp} className="reset-button" aria-label="Reset application">
              <span className="button-icon">🔄</span> Reset
            </button>
          </div>
          {files.length > 0 && (
            <div className="file-list">
              <h3>Selected Files:</h3>
              <ul>
                {files.map((file, idx) => (
                  <li key={idx} className="file-item">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">({(file.size / 1024).toFixed(2)} KB)</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {extractedText && (
          <>
            <section className="section text-section">
              <h2>📝 Extracted Text</h2>
              <div className="text-container">
                <div
                  ref={textAreaRef}
                  className="editable-text"
                  contentEditable
                  onInput={handleTextChange}
                  onClick={handleWordClick}
                  aria-label="Editable text with highlighted incorrect words"
                  dir="rtl"
                >
                  {highlightIncorrectWords(extractedText)}
                </div>
              </div>
              <div className="emotion-display">
                <h3>😊 Detected Emotion</h3>
                <p>{detectedEmotion || 'None'}</p>
                <h3>👤 Detected Gender</h3>
                <p>{detectedGender.charAt(0).toUpperCase() + detectedGender.slice(1)}</p>
              </div>
            </section>

            <section className="section voice-section">
              <h2
                className="section-title collapsible"
                onClick={() => setVoiceSectionExpanded(!voiceSectionExpanded)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => e.key === 'Enter' && setVoiceSectionExpanded(!voiceSectionExpanded)}
                aria-expanded={voiceSectionExpanded}
                aria-label="Toggle voice settings section"
              >
                🎙️ Voice Settings {voiceSectionExpanded ? '▼' : '▶'}
              </h2>
              {voiceSectionExpanded && (
                <div className="voice-card">
                  <div className="form-group">
                    <label htmlFor="tts-provider">
                      TTS Provider
                      <span className="tooltip">
                        <FaInfoCircle aria-hidden="true" />
                        <span className="tooltip-text">
                          Choose the TTS provider. GPT-4o mini offers advanced emotional control.
                        </span>
                      </span>
                    </label>
                    <select
                      id="tts-provider"
                      value={ttsProvider}
                      onChange={(e) => {
                        setTtsProvider(e.target.value);
                        setVoiceSettings((prev) => ({
                          ...prev,
                          voice_name: e.target.value === 'gpt4o_mini' ? 'coral' : availableVoices[0]?.voices[0]?.name || '',
                          gender: e.target.value === 'gpt4o_mini' ? 'NEUTRAL' : availableVoices[0]?.voices[0]?.gender || 'FEMALE',
                          language_code: e.target.value === 'gpt4o_mini' ? 'en-US' : availableVoices[0]?.language_code || 'en-US',
                        }));
                      }}
                    >
                      <option value="google">Google Cloud TTS</option>
                      <option value="gpt4o_mini">GPT-4o mini TTS</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="language-code">
                      Language
                      <span className="tooltip">
                        <FaInfoCircle aria-hidden="true" />
                        <span className="tooltip-text">Select the language for the voice output.</span>
                      </span>
                    </label>
                    <select
                      id="language-code"
                      value={voiceSettings.language_code}
                      onChange={(e) => updateVoiceSetting('language_code', e.target.value)}
                      disabled={availableVoices.length === 0 && ttsProvider !== 'gpt4o_mini'}
                    >
                      {ttsProvider === 'gpt4o_mini' ? (
                        <>
                          <option value="en-US">en-US</option>
                          <option value="ur-PK">ur-PK</option>
                        </>
                      ) : availableVoices.length === 0 ? (
                        <option value="">Loading...</option>
                      ) : (
                        availableVoices.map((lang) => (
                          <option key={lang.language_code} value={lang.language_code}>
                            {lang.language_code}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="voice-name">
                      Voice Name
                      <span className="tooltip">
                        <FaInfoCircle aria-hidden="true" />
                        <span className="tooltip-text">Select the voice. All GPT-4o mini voices are neutral gender.</span>
                      </span>
                    </label>
                    <select
                      id="voice-name"
                      value={voiceSettings.voice_name}
                      onChange={(e) => updateVoiceSetting('voice_name', e.target.value)}
                      disabled={availableVoices.length === 0 && ttsProvider !== 'gpt4o_mini'}
                    >
                      {ttsProvider === 'gpt4o_mini' ? (
                        gpt4oVoices
                          .filter((voice) => voice.language_code === voiceSettings.language_code)
                          .map((voice) => (
                            <option key={voice.name} value={voice.name}>
                              {voice.name} ({voice.gender})
                            </option>
                          ))
                      ) : availableVoices.length === 0 ? (
                        <option value="">Loading...</option>
                      ) : (
                        availableVoices
                          .find((lang) => lang.language_code === voiceSettings.language_code)
                          ?.voices.map((voice) => (
                            <option key={voice.name} value={voice.name}>
                              {voice.name} ({voice.gender})
                            </option>
                          )) || <option value="">No voices available</option>
                      )}
                    </select>
                    {genderWarning && <span className="voice-note warning">{genderWarning}</span>}
                  </div>

                  {ttsProvider === 'gpt4o_mini' && (
                    <>
                      <div className="form-group">
                        <label htmlFor="emotion">
                          Base Emotion
                          <span className="tooltip">
                            <FaInfoCircle aria-hidden="true" />
                            <span className="tooltip-text">Select the primary emotion to set the voice's mood.</span>
                          </span>
                        </label>
                        <select
                          id="emotion"
                          value={voiceSettings.emotion}
                          onChange={(e) => updateVoiceSetting('emotion', e.target.value)}
                        >
                          {emotionOptions.map((emotion) => (
                            <option key={emotion} value={emotion}>
                              {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label htmlFor="emotion-intensity">
                          Emotion Intensity: {voiceSettings.emotion_intensity}%
                        </label>
                        <input
                          type="range"
                          id="emotion-intensity"
                          value={voiceSettings.emotion_intensity}
                          onChange={(e) => updateVoiceSetting('emotion_intensity', e.target.value)}
                          min="0"
                          max="100"
                          step="1"
                          aria-label={`Emotion intensity: ${voiceSettings.emotion_intensity}%`}
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="secondary-emotion">
                          Secondary Emotion (Optional)
                          <span className="tooltip">
                            <FaInfoCircle aria-hidden="true" />
                            <span className="tooltip-text">
                              Add a secondary emotion to blend with the base emotion for nuanced expression.
                            </span>
                          </span>
                        </label>
                        <select
                          id="secondary-emotion"
                          value={voiceSettings.secondary_emotion}
                          onChange={(e) => updateVoiceSetting('secondary_emotion', e.target.value)}
                        >
                          {secondaryEmotionOptions.map((emotion) => (
                            <option key={emotion} value={emotion}>
                              {emotion === 'none' ? 'None' : emotion.charAt(0).toUpperCase() + emotion.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label htmlFor="secondary-emotion-intensity">
                          Secondary Emotion Intensity: {voiceSettings.secondary_emotion_intensity}%
                        </label>
                        <input
                          type="range"
                          id="secondary-emotion-intensity"
                          value={voiceSettings.secondary_emotion_intensity}
                          onChange={(e) => updateVoiceSetting('secondary_emotion_intensity', e.target.value)}
                          min="0"
                          max="100"
                          step="1"
                          disabled={voiceSettings.secondary_emotion === 'none'}
                          aria-label={`Secondary emotion intensity: ${voiceSettings.secondary_emotion_intensity}%`}
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="tone">
                          Tone
                          <span className="tooltip">
                            <FaInfoCircle aria-hidden="true" />
                            <span className="tooltip-text">Adjust the voice's tone for specific expression.</span>
                          </span>
                        </label>
                        <select id="tone" value={voiceSettings.tone} onChange={(e) => updateVoiceSetting('tone', e.target.value)}>
                          {toneOptions.map((tone) => (
                            <option key={tone} value={tone}>
                              {tone.charAt(0).toUpperCase() + tone.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label htmlFor="style">
                          Style
                          <span className="tooltip">
                            <FaInfoCircle aria-hidden="true" />
                            <span className="tooltip-text">Set the speaking style, e.g., Sports Coach for an energetic tone.</span>
                          </span>
                        </label>
                        <select
                          id="style"
                          value={voiceSettings.style}
                          onChange={(e) => updateVoiceSetting('style', e.target.value)}
                        >
                          {styleOptions.map((style) => (
                            <option key={style} value={style}>
                              {style
                                .split('-')
                                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                .join(' ')}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label htmlFor="pacing">
                          Pacing: {voiceSettings.pacing}%
                          <span className="tooltip">
                            <FaInfoCircle aria-hidden="true" />
                            <span className="tooltip-text">Adjust the speed of speech. 100% is normal speed (150 wpm).</span>
                          </span>
                        </label>
                        <input
                          type="range"
                          id="pacing"
                          value={voiceSettings.pacing}
                          onChange={(e) => updateVoiceSetting('pacing', e.target.value)}
                          min="50"
                          max="200"
                          step="1"
                          aria-label={`Pacing: ${voiceSettings.pacing}%`}
                        />
                        {warnings.pacing && <span className="voice-note warning">{warnings.pacing}</span>}
                      </div>

                      <div className="form-group">
                        <label htmlFor="pause-frequency">
                          Pause Frequency
                          <span className="tooltip">
                            <FaInfoCircle aria-hidden="true" />
                            <span className="tooltip-text">Control how often the voice pauses for emphasis or clarity.</span>
                          </span>
                        </label>
                        <select
                          id="pause-frequency"
                          value={voiceSettings.pause_frequency}
                          onChange={(e) => updateVoiceSetting('pause_frequency', e.target.value)}
                        >
                          {pauseFrequencyOptions.map((freq) => (
                            <option key={freq} value={freq}>
                              {freq.charAt(0).toUpperCase() + freq.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label htmlFor="emphasis-words">
                          Emphasis Words (Comma-separated)
                          <span className="tooltip">
                            <FaInfoCircle aria-hidden="true" />
                            <span className="tooltip-text">
                              Enter words to emphasize in the audio, e.g., "important, critical".
                            </span>
                          </span>
                        </label>
                        <input
                          type="text"
                          id="emphasis-words"
                          value={voiceSettings.emphasis_words}
                          onChange={(e) => updateVoiceSetting('emphasis_words', e.target.value)}
                          placeholder="e.g., important, critical"
                          aria-label="Enter words to emphasize, comma-separated"
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="instruction-template">
                          Instruction Template
                          <span className="tooltip">
                            <FaInfoCircle aria-hidden="true" />
                            <span className="tooltip-text">Select a predefined instruction or write your own.</span>
                          </span>
                        </label>
                        <select
                          id="instruction-template"
                          value={voiceSettings.instruction_template}
                          onChange={(e) => updateVoiceSetting('instruction_template', e.target.value)}
                        >
                          {Object.keys(instructionTemplates).map((template) => (
                            <option key={template} value={template}>
                              {template === 'none' ? 'None' : template.charAt(0).toUpperCase() + template.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label htmlFor="custom-instructions">
                          Custom Instructions (Optional)
                          <span className="tooltip">
                            <FaInfoCircle aria-hidden="true" />
                            <span className="tooltip-text">
                              Provide specific instructions for the voice, e.g., "Speak with genuine concern".
                            </span>
                          </span>
                        </label>
                        <textarea
                          id="custom-instructions"
                          className="instructions-input"
                          value={voiceSettings.custom_instructions}
                          onChange={(e) => updateVoiceSetting('custom_instructions', e.target.value)}
                          placeholder="e.g., Speak with genuine concern"
                          rows="4"
                          aria-label="Enter custom instructions for the voice"
                        />
                        {warnings.instructions && <span className="voice-note warning">{warnings.instructions}</span>}
                      </div>

                      <div className="form-group"> 
                        <label htmlFor="prompt-based-music-generation">
                          Prompt-based Music Generation
                          <span className="tooltip">
                            <FaInfoCircle aria-hidden="true" />
                            <span className="tooltip-text">
                              Generate music based on the provided prompt.
                            </span>
                          </span>
                          </label>
                          <textarea
                            id="prompt-based-music-generation"
                            className="instructions-input"
                            value={voiceSettings.prompt_based_music_generation}
                            onChange={(e) => updateVoiceSetting('prompt_based_music_generation', e.target.value)}
                            placeholder="e.g., Create a happy melody for a birthday party."
                            rows="4"
                            aria-label="Enter prompt for music generation"
                          />
                      </div>
                    </>
                  )}

                  {ttsProvider === 'google' && (
                    <>
                      <div className="form-group">
                        <label htmlFor="speaking-rate">
                          Speaking Rate: {voiceSettings.speaking_rate}x
                        </label>
                        <input
                          type="range"
                          id="speaking-rate"
                          value={voiceSettings.speaking_rate}
                          onChange={(e) => updateVoiceSetting('speaking_rate', e.target.value)}
                          min="0.25"
                          max="4.0"
                          step="0.05"
                          aria-label={`Speaking rate: ${voiceSettings.speaking_rate}x`}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="pitch">
                          Pitch: {voiceSettings.pitch}
                        </label>
                        <input
                          type="range"
                          id="pitch"
                          value={voiceSettings.pitch}
                          onChange={(e) => updateVoiceSetting('pitch', e.target.value)}
                          min="-20"
                          max="20"
                          step="1"
                          aria-label={`Pitch: ${voiceSettings.pitch}`}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="volume-gain-db">
                          Volume Gain: {voiceSettings.volume_gain_db} dB
                        </label>
                        <input
                          type="range"
                          id="volume-gain-db"
                          value={voiceSettings.volume_gain_db}
                          onChange={(e) => updateVoiceSetting('volume_gain_db', e.target.value)}
                          min="-96"
                          max="16"
                          step="1"
                          aria-label={`Volume gain: ${voiceSettings.volume_gain_db} dB`}
                        />
                      </div>
                    </>
                  )}

                  <div className="form-group">
                    <h3>🔊 Audio Output Settings Summary</h3>
                    <ul className="settings-summary">
                      <li>
                        <strong>Provider</strong>: {ttsProvider === 'gpt4o_mini' ? 'GPT-4o mini TTS' : 'Google Cloud TTS'}
                      </li>
                      <li>
                        <strong>Language</strong>: {voiceSettings.language_code}
                      </li>
                      <li>
                        <strong>Voice</strong>: {voiceSettings.voice_name} ({voiceSettings.gender})
                      </li>
                      {ttsProvider === 'gpt4o_mini' && (
                        <>
                          <li>
                            <strong>Base Emotion</strong>: {voiceSettings.emotion.charAt(0).toUpperCase() + voiceSettings.emotion.slice(1)} (
                            {voiceSettings.emotion_intensity}%)
                          </li>
                          {voiceSettings.secondary_emotion !== 'none' && (
                            <li>
                              <strong>Secondary Emotion</strong>:{' '}
                              {voiceSettings.secondary_emotion.charAt(0).toUpperCase() + voiceSettings.secondary_emotion.slice(1)} (
                              {voiceSettings.secondary_emotion_intensity}%)
                            </li>
                          )}
                          <li>
                            <strong>Tone</strong>: {voiceSettings.tone.charAt(0).toUpperCase() + voiceSettings.tone.slice(1)}
                          </li>
                          <li>
                            <strong>Style</strong>:{' '}
                            {voiceSettings.style
                              .split('-')
                              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                              .join(' ')}
                          </li>
                          <li>
                            <strong>Pacing</strong>: {voiceSettings.pacing}%
                          </li>
                          <li>
                            <strong>Pause Frequency</strong>:{' '}
                            {voiceSettings.pause_frequency.charAt(0).toUpperCase() + voiceSettings.pause_frequency.slice(1)}
                          </li>
                          {voiceSettings.emphasis_words && (
                            <li>
                              <strong>Emphasis Words</strong>: {voiceSettings.emphasis_words}
                            </li>
                          )}
                          <li>
                            <strong>Instructions</strong>: {voiceSettings.custom_instructions || 'Auto-generated'}
                          </li>
                        </>
                      )}
                      {ttsProvider === 'google' && (
                        <>
                          <li>
                            <strong>Speaking Rate</strong>: {voiceSettings.speaking_rate}x
                          </li>
                          <li>
                            <strong>Pitch</strong>: {voiceSettings.pitch}
                          </li>
                          <li>
                            <strong>Volume Gain</strong>: {voiceSettings.volume_gain_db} dB
                          </li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              )}

              <button
                onClick={handleGenerateAudio}
                disabled={isLoading || (ttsProvider === 'google' && detectedGender !== 'unknown' && detectedGender !== voiceSettings.gender.toLowerCase())}
                className="generate-audio"
                aria-label="Generate audio from text"
              >
                {isLoading ? <span className="spinner" aria-label="Loading"></span> : 'Generate Audio'}
              </button>
              {audioUrl && (
                <div className="audio-player">
                  <h3>Generated Audio</h3>
                  <audio controls src={audioUrl} aria-label="Play generated audio" />
                  <a href={audioUrl} download="generated_audio.mp3" className="download-button">
                    Download Audio
                  </a>
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        className={`modal ${theme}`}
        overlayClassName="modal-overlay"
        aria={{
          labelledby: 'suggestions-modal-title',
          describedby: 'suggestions-modal-content',
        }}
      >
        <h2 id="suggestions-modal-title">Suggestions for "{currentWord}"</h2>
        <div id="suggestions-modal-content">
          <ul className="suggestions-list">
            {suggestions.length > 0 ? (
              suggestions.map((sugg, idx) => (
                <li
                  key={idx}
                  onClick={() => replaceWord(sugg)}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => e.key === 'Enter' && replaceWord(sugg)}
                  aria-label={`Replace with ${sugg}`}
                >
                  {sugg}
                </li>
              ))
            ) : (
              <li>No suggestions available.</li>
            )}
          </ul>
        </div>
        <button onClick={() => setModalIsOpen(false)} className="close-button" aria-label="Close suggestions">
          Close
        </button>
      </Modal>

      <footer className="app-footer">
        <p>© {new Date().getFullYear()} AI-titude. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;