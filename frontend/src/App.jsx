import { useEffect, useState } from "react";
import "./App.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

function App() {
  const [languages, setLanguages] = useState([]);
  const [sourceLanguage, setSourceLanguage] = useState("en");
  const [targetLanguage, setTargetLanguage] = useState("hi");

  const [text, setText] = useState("");
  const [translation, setTranslation] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingLanguages, setLoadingLanguages] = useState(true);

  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadLanguages = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/languages`
        );

        if (!response.ok) {
          throw new Error("Unable to load languages.");
        }

        const data = await response.json();
        setLanguages(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoadingLanguages(false);
      }
    };

    loadLanguages();
  }, []);

  const translateText = async () => {
    if (!text.trim()) {
      setError("Please enter some text to translate.");
      return;
    }

    if (sourceLanguage === targetLanguage) {
      setTranslation(text);
      setError("");
      return;
    }

    setLoading(true);
    setError("");
    setCopied(false);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/translate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: text.trim(),
            source: sourceLanguage,
            target: targetLanguage,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Translation failed."
        );
      }

      setTranslation(data.translated_text);
    } catch (error) {
      setTranslation("");
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const swapLanguages = () => {
    const oldSource = sourceLanguage;

    setSourceLanguage(targetLanguage);
    setTargetLanguage(oldSource);

    if (translation) {
      const oldText = text;
      setText(translation);
      setTranslation(oldText);
    }
  };

  const copyTranslation = async () => {
    if (!translation) return;

    try {
      await navigator.clipboard.writeText(translation);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setError("Unable to copy translation.");
    }
  };

  const speakTranslation = () => {
    if (!translation) return;

    if (!("speechSynthesis" in window)) {
      setError(
        "Text-to-speech is not supported in this browser."
      );
      return;
    }

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(
      translation
    );

    speech.lang = targetLanguage;

    window.speechSynthesis.speak(speech);
  };

  const clearAll = () => {
    setText("");
    setTranslation("");
    setError("");
    setCopied(false);
  };

  const sourceName =
    languages.find(
      (language) => language.code === sourceLanguage
    )?.name || "English";

  const targetName =
    languages.find(
      (language) => language.code === targetLanguage
    )?.name || "Hindi";

  return (
    <div className="app">

      <div className="background-glow glow-one"></div>
      <div className="background-glow glow-two"></div>

      <header className="header">
  <div className="brand-center">
    <div className="brand-icon">
      文
    </div>

    <h1>LinguaFlow</h1>

    <p>Simple translation. Powerful communication.</p>
  </div>

  {text && (
    <button
      className="clear-button"
      onClick={clearAll}
    >
      Clear
    </button>
  )}
</header>

      <main className="main-content">


        <section className="translator-card">

          <div className="language-bar">

            <div className="language-selector">

              <span className="selector-label">
                FROM
              </span>

              <select
                value={sourceLanguage}
                onChange={(e) => {
                  setSourceLanguage(e.target.value);
                  setError("");
                }}
                disabled={loadingLanguages}
              >
                {loadingLanguages ? (
                  <option>Loading...</option>
                ) : (
                  languages.map((language) => (
                    <option
                      key={language.code}
                      value={language.code}
                    >
                      {language.name}
                    </option>
                  ))
                )}
              </select>

            </div>

            <button
              className="swap-button"
              onClick={swapLanguages}
              disabled={
                loadingLanguages ||
                sourceLanguage === targetLanguage
              }
              title="Swap languages"
            >
              <span>⇄</span>
            </button>

            <div className="language-selector">

              <span className="selector-label">
                TO
              </span>

              <select
                value={targetLanguage}
                onChange={(e) => {
                  setTargetLanguage(e.target.value);
                  setError("");
                }}
                disabled={loadingLanguages}
              >
                {loadingLanguages ? (
                  <option>Loading...</option>
                ) : (
                  languages.map((language) => (
                    <option
                      key={language.code}
                      value={language.code}
                    >
                      {language.name}
                    </option>
                  ))
                )}
              </select>

            </div>

          </div>

          <div className="translation-area">

            <div className="text-panel">

              <div className="panel-top">

                <div className="panel-title">
                  <span className="panel-icon">✎</span>
                  <span>{sourceName}</span>
                </div>

                <span className="character-count">
                  {text.length}/5000
                </span>

              </div>

              <textarea
                value={text}
                maxLength={5000}
                onChange={(e) => {
                  setText(e.target.value);
                  setError("");
                }}
                placeholder="Type or paste your text here..."
              />

              <div className="panel-bottom">
                <span>
                  {text
                    ? "Ready to translate"
                    : "Enter text to get started"}
                </span>
              </div>

            </div>

            <div className="text-panel output-panel">

              <div className="panel-top">

                <div className="panel-title">
                  <span className="panel-icon">文</span>
                  <span>{targetName}</span>
                </div>

                <div className="action-buttons">

                  <button
                    className="icon-button"
                    onClick={speakTranslation}
                    disabled={!translation}
                    title="Listen"
                  >
                    🔊
                  </button>

                  <button
                    className="copy-button"
                    onClick={copyTranslation}
                    disabled={!translation}
                  >
                    {copied ? "✓ Copied" : "Copy"}
                  </button>

                </div>

              </div>

              <div className="translation-result">

                {loading ? (
                  <div className="loading-state">
                    <div className="loader"></div>
                    <p>Translating your text...</p>
                  </div>
                ) : translation ? (
                  <p className="translated-text">
                    {translation}
                  </p>
                ) : (
                  <div className="empty-state">
                    <div className="empty-icon">
                      ✨
                    </div>

                    <p>Your translation will appear here</p>

                    <span>
                      Choose your languages and enter some text
                    </span>
                  </div>
                )}

              </div>

              <div className="panel-bottom">
                <span>
                  {translation
                    ? "Translation complete"
                    : "Waiting for translation"}
                </span>
              </div>

            </div>

          </div>

          {error && (
            <div className="error-message">
              <span>!</span>
              {error}
            </div>
          )}

          <div className="translate-section">

            <button
              className="translate-button"
              onClick={translateText}
              disabled={
                !text.trim() ||
                loading ||
                loadingLanguages
              }
            >
              {loading ? (
                <>
                  <span className="button-loader"></span>
                  Translating...
                </>
              ) : (
                <>
                  Translate
                  <span className="arrow">→</span>
                </>
              )}
            </button>

            <p>
              Fast • Simple • Easy to use
            </p>

          </div>

        </section>

        <div className="features">

          <div className="feature">
            <div>⚡</div>
            <span>Instant Translation</span>
          </div>

          <div className="feature">
            <div>🌐</div>
            <span>Multiple Languages</span>
          </div>

          <div className="feature">
            <div>🔊</div>
            <span>Text-to-Speech</span>
          </div>

          <div className="feature">
            <div>📋</div>
            <span>One-Click Copy</span>
          </div>

        </div>

      </main>

      <footer>
        <span>LinguaFlow</span>
        <span>•</span>
        <span>Translate without limits</span>
      </footer>

    </div>
  );
}

export default App;