/* eslint-disable no-unused-vars */
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { AiService } from "../../services/AiService";
import AdminSidebar from "../../componens/admin/AdminSidebar";
import { Send, LoaderCircle } from "lucide-react";

// Variants untuk animasi
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};

// Chat message component
const ChatMessage = ({ message, isUser }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${
        isUser ? "justify-end" : "justify-start"
      } mb-3 px-2 sm:px-4`}
    >
      <div
        className={`max-w-[90%] sm:max-w-[75%] rounded-2xl p-3 sm:p-4 ${
          isUser
            ? "bg-blue-600 text-white rounded-br-none"
            : "bg-gray-700 text-gray-200 rounded-bl-none"
        }`}
      >
        <div className="flex items-start">
          {!isUser && (
            <div className="mr-2 mt-1 flex-shrink-0">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center">
                <span className="text-xs font-bold">AI</span>
              </div>
            </div>
          )}
          <div className="text-sm sm:text-base whitespace-pre-wrap">
            {message}
          </div>
          {isUser && (
            <div className="ml-2 mt-1 flex-shrink-0">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gray-600 flex items-center justify-center">
                <span className="text-xs">You</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const AiAssistantController = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Halo! Saya asisten AI untuk manajemen kasir. Ada yang bisa saya bantu?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) {
      setError("Pesan tidak boleh kosong");
      return;
    }

    // Add user message to chat
    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setLoading(true);
    setError(null);

    try {
      // Get AI response
      const response = await AiService.prompt(inputMessage);

      // Add AI response to chat
      const aiMessage = {
        id: Date.now() + 1,
        text: response,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      setError(err.message || "Gagal mendapatkan respons AI");

      // Add error message to chat
      const errorMessage = {
        id: Date.now() + 1,
        text: "Maaf, terjadi kesalahan. Silakan coba lagi.",
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
    if (error) setError(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <AdminSidebar menuActive="kasir" />

      <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8 relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-10 sm:top-20 left-10 sm:left-20 w-48 sm:w-72 h-48 sm:h-72 bg-blue-600 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 sm:bottom-20 right-10 sm:right-20 w-48 sm:w-72 h-48 sm:h-72 bg-purple-600 rounded-full blur-3xl"></div>
        </div>

        {/* Header Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-4 sm:mb-6 relative z-10"
        >
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <motion.div variants={itemVariants} className="max-[884px]:pl-12">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                AI Assistant
              </h1>
              <p className="text-gray-400 mt-1 text-xs sm:text-sm lg:text-base">
                Get help from AI for cashier management tasks
              </p>
            </motion.div>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="mt-3 sm:mt-4 p-3 bg-red-900/30 border border-red-700/50 rounded-xl text-xs sm:text-sm text-red-200 flex items-center backdrop-blur-sm"
            >
              <div className="w-2 h-2 bg-red-500 rounded-full mr-2 sm:mr-3 animate-pulse"></div>
              <span className="flex-1">{error}</span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={sendMessage}
                className="ml-2 px-2 sm:px-3 py-1 text-xs sm:text-sm bg-red-900/20 text-red-200 rounded-lg hover:bg-red-900/30 transition-colors duration-200"
                aria-label="Retry"
              >
                Coba Lagi
              </motion.button>
            </motion.div>
          )}
        </motion.div>

        {/* Chat Container */}
        <motion.div
          variants={itemVariants}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-gray-700/50 mb-4 sm:mb-6 
             h-[calc(100vh-140px)] sm:h-[calc(100vh-180px)] lg:h-[calc(100vh-200px)] flex flex-col"
        >
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-3 sm:space-y-4 
               scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800/50 
               scrollbar-thumb-rounded-full scrollbar-track-rounded-full"
          >
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message.text}
                isUser={message.isUser}
              />
            ))}
            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start mb-3 sm:mb-4"
              >
                <div className="bg-gray-700 text-gray-200 rounded-2xl rounded-bl-none p-3 sm:p-4 max-w-[90%] sm:max-w-[75%]">
                  <div className="flex items-center">
                    <div className="mr-2 flex-shrink-0">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center">
                        <span className="text-xs font-bold">AI</span>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                      <div
                        className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.4s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 sm:p-4 border-t border-gray-700/50 mt-auto">
            <form
              onSubmit={handleSubmit}
              className="flex gap-2 sm:gap-3 items-end"
            >
              <div className="flex-1 relative">
                <textarea
                  value={inputMessage}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyPress}
                  placeholder="type your message..."
                  className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200 resize-none"
                  rows="1"
                  disabled={loading}
                />
              </div>
              <motion.button
                type="submit"
                disabled={loading || !inputMessage.trim()}
                whileHover={{ scale: loading ? 1 : 1.05 }}
                whileTap={{ scale: loading ? 1 : 0.95 }}
                className={`p-2 sm:p-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center flex-shrink-0 ${
                  loading || !inputMessage.trim()
                    ? "bg-blue-500/30 cursor-not-allowed text-blue-200/50"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
              >
                {loading ? (
                  <LoaderCircle className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default AiAssistantController;
