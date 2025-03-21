import React, { useState } from "react";
import axios from "axios";

const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;
  
    const newMessage = { text: input, sender: "user" };
    setMessages([...messages, newMessage]);
  
    try {
      const response = await axios.post("http://localhost:8080/api/chatbox", {
        message: input,
      });
  
      if (response.data.reply) {
        const botMessage = { text: response.data.reply, sender: "bot" };
        setMessages([...messages, newMessage, botMessage]);
      } else if (response.data.error) {
        alert("Lỗi: " + response.data.error);
      }
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn:", error);
      alert("Có lỗi xảy ra khi kết nối đến máy chủ.");
    }
  
    setInput("");
  };
  

  return (
    <div style={{ maxWidth: "500px", margin: "auto" }}>
      <div style={{ height: "400px", overflowY: "auto", border: "1px solid #ccc", padding: "10px" }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ textAlign: msg.sender === "user" ? "right" : "left" }}>
            <p style={{ background: msg.sender === "user" ? "#daf8cb" : "#f1f1f1", display: "inline-block", padding: "5px 10px", borderRadius: "5px" }}>
              {msg.text}
            </p>
          </div>
        ))}
      </div>
      <input 
        type="text" 
        value={input} 
        onChange={(e) => setInput(e.target.value)} 
        style={{ width: "80%", padding: "10px" }} 
        placeholder="Nhập tin nhắn..."
      />
      <button onClick={sendMessage} style={{ width: "20%", padding: "10px" }}>Gửi</button>
    </div>
  );
};

export default ChatBox;
