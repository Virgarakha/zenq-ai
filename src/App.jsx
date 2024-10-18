import { useState, useEffect, useRef } from "react";
import Tesseract from "tesseract.js";
import { requestToGroqAi } from "./utils/groq";
import { Light as SyntaxHighlight } from "react-syntax-highlighter";
import { a11yDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { CopyToClipboard } from "react-copy-to-clipboard";
import "./App.css";
import logo from "./assets/logo.svg";
import share from "./assets/share.svg";
import copy from "./assets/copy.svg";
import check from "./assets/check.svg";
import clock from "./assets/clock.svg";
import mic from "./assets/mic.svg";
import micoff from "./assets/mic-off.svg";

function App() {
  const [messages, setMessages] = useState([]);  // State untuk menyimpan percakapan
  const [inputValue, setInputValue] = useState("");  // Input pengguna
  const [isTyping, setIsTyping] = useState(false);  // Status typing
  const [isInputVisible, setIsInputVisible] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isImageProcessing, setIsImageProcessing] = useState(false);
  const [showPopup, setShowPopup] = useState(true);
  const chatBoxRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize speech recognition
  useEffect(() => {
    const storedMessages = localStorage.getItem('chatMessages');
    const storedUserName = localStorage.getItem('userName'); // Ambil nama dari localStorage
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    }
    if (storedUserName) {
      setUserName(storedUserName);  // Simpan nama pengguna jika ada
    }

    if (window.SpeechRecognition || window.webkitSpeechRecognition) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = "id-ID";

      recognition.onresult = (event) => {
        const transcript = event.results[event.resultIndex][0].transcript;
        setInputValue((prev) => prev + transcript);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      alert("Speech recognition is not supported in this browser.");
    }
  }, []);

  const handleSpeechToggle = () => {
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSubmit = async () => {
    if (!inputValue.trim()) {
      return;
    }

    let newMessages = [...messages];
    const timestamp = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (inputValue.toLowerCase().includes('nama saya')) {
      // Ambil nama dari input pengguna dan simpan di localStorage
      const extractedName = inputValue.split('nama saya ')[1].trim();
      localStorage.setItem('userName', extractedName); // Simpan nama pengguna ke localStorage
      setUserName(extractedName); // Set state untuk nama pengguna
      newMessages = [
        ...newMessages,
        { user: inputValue, ai: null, copied: false, timestamp },
        { user: `Saya akan ingat, nama kamu adalah ${extractedName}.`, ai: null, copied: false, timestamp },
      ];
    } else {
      // Jika bukan input nama, lanjutkan dengan percakapan biasa
      newMessages = [
        ...newMessages,
        { user: inputValue, ai: null, copied: false, timestamp },
      ];
    }

    // Simpan messages ke localStorage
    localStorage.setItem('chatMessages', JSON.stringify(newMessages));

    setMessages(newMessages);
    setInputValue("");
    setIsTyping(true);

    const aiResponse = await requestToGroqAi(inputValue);
    setIsTyping(false);

    const updatedMessages = newMessages.map((message, index) =>
      index === newMessages.length - 1
        ? { ...message, ai: parseResponse(aiResponse) }
        : message
    );
    setMessages(updatedMessages);

    // Simpan kembali setelah menambah respons AI
    localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
  };

  const parseResponse = (response) => {
    const codeBlockRegex = /```[\s\S]*?```/g;
    const parts = response.split(codeBlockRegex);
    const codeBlocks = response.match(codeBlockRegex) || [];

    return parts.map((part, index) => ({
      explanation: part.trim(),
      code: codeBlocks[index] ? codeBlocks[index].replace(/```/g, "").trim() : null,
      copied: false,
    }));
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSubmit();
    }
  };

  const toggleInputVisibility = () => {
    setIsInputVisible(!isInputVisible);
  };

  const handleCopy = (messageIndex, partIndex) => {
    const updatedMessages = [...messages];
    if (partIndex === null) {
      updatedMessages[messageIndex].copied = true;
    } else {
      updatedMessages[messageIndex].ai[partIndex].copied = true;
    }
    setMessages(updatedMessages);

    setTimeout(() => {
      if (partIndex === null) {
        updatedMessages[messageIndex].copied = false;
      } else {
        updatedMessages[messageIndex].ai[partIndex].copied = false;
      }
      setMessages([...updatedMessages]);
    }, 2000);
  };

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setIsImageProcessing(true);
      try {
        const { data: { text } } = await Tesseract.recognize(file, "eng", {
          logger: (m) => console.log(m),
        });
        setInputValue(text);
      } catch (error) {
        console.error("Error processing image:", error);
      }
      setIsImageProcessing(false);
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const clearChat = () => {
    // Clear the chat history from local storage
    localStorage.removeItem("chatMessages");
  
    // Optionally, reset the chat state or reload the page to reflect changes
    window.location.reload(); // Refresh the page to reset the chat state
  };
  

  return (
    <main className="main-container">
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <img style={{ margin: '0 auto' }} src={ logo } alt="" />
            <h2>Zenq Ai 1-0</h2>
            <p>Dalam tahap perkembangan</p>
            <button onClick={handleClosePopup}>Close</button>
          </div>
        </div>
      )}
      <nav className="navbar">
        <div className="navbox">
          <div className="logo2" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold' }}>
            <img src={logo} style={{ width: '25px' }} alt="" />
            <h1 style={{ fontSize: '25px', fontWeight: 'bold' }}>Zenq AI</h1>
            <p style={{ color: '#bebebe' }}>v-1.0</p>
          </div>
          <div className="close">
          <button className="btn-close" onClick={clearChat}>
            Clear Chat
          </button>

          </div>
        </div>
      </nav>

      <div className="chat-container">
        <div className="intro2" style={{ paddingBottom: '20px' }}>
          <h1>Welcome bro!</h1>
        </div>
        <div className="chat-box" ref={chatBoxRef}>
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.ai ? "ai-message" : "user-message"}`}>
              <div className="userr">
                <p>{message.user}</p>
                <div className="time">
                  <img src={clock} alt="" />
                  <span className="timestamp">{message.timestamp}</span>
                </div>
              </div>
              <div className="aipesan">
                {message.ai &&
                  message.ai.map((part, i) => (
                    <div key={i} className="message-content" style={{ color: '#bebebe' }}>
                      {part.explanation && <p>{part.explanation}</p>}
                      {part.code && (
                        <div className="code-block">
                          <div className="ov">
                          <SyntaxHighlight language="javascript" style={a11yDark}>
                            {part.code}
                          </SyntaxHighlight>
                          </div>
                          <CopyToClipboard text={part.code}>
                            <img
                              onClick={() => handleCopy(index, i)}
                              src={part.copied ? check : copy}
                              alt="Copy to clipboard"
                              className="copy-icon"
                            />
                          </CopyToClipboard>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {isTyping && (
          <div className="typing-indicator">
            <span>AI is typing...</span>
          </div>
        )}

{isInputVisible && (
          <form onSubmit={(e) => e.preventDefault()} className="input-form">
            <div className="micc" style={{ display: 'flex' }}>
              <button type="button" onClick={handleSpeechToggle} className="speech-button">
                <img style={{ width: '20px' }} src={isListening ? mic : micoff} alt="Mic" />
              </button>
            </div>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              className="input-box"
              placeholder="Type a message..."
            />
            <button type="submit" onClick={handleSubmit} className="send-button">
              <img src={ share } alt="" />
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

export default App;
