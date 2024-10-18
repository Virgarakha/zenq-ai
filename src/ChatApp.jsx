import React, { useState } from 'react';

const ChatApp = () => {
  const [messages, setMessages] = useState([]); // State untuk menyimpan percakapan
  const [input, setInput] = useState(''); // State untuk input pengguna

  // Fungsi untuk menangani pengiriman pesan
  const sendMessage = () => {
    if (input.trim() === '') return; // Menghindari pengiriman pesan kosong

    // Menambah pesan pengguna ke state
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: 'user', text: input }
    ]);

    // Simulasi AI merespons (bisa diganti dengan API atau logika lain)
    setTimeout(() => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'ai', text: `AI: ${input.split('').reverse().join('')}` } // Simulasi balasan AI
      ]);
    }, 1000);

    setInput(''); // Mengosongkan input setelah pesan dikirim
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {/* Render pesan sebelumnya */}
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.sender}`}>
            {message.text}
          </div>
        ))}
      </div>

      <div className="input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)} // Mengupdate input
          placeholder="Ketik pesan..."
        />
        <button onClick={sendMessage}>Kirim</button>
      </div>
    </div>
  );
};

export default ChatApp;
