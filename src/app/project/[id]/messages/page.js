"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useParams } from "next/navigation";

const MessagesPage = () => {
  const { user } = useAuth();
  const params = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [editingMessage, setEditingMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch messages
  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}/messages`);
      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }
      const data = await response.json();
      setMessages(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    // Set up polling for new messages
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [params.id]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const response = await fetch(`/api/projects/${params.id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: newMessage }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const message = await response.json();
      setMessages([...messages, message]);
      setNewMessage("");
      // Focus back to input on mobile after sending
      if (window.innerWidth <= 768) {
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditMessage = (messageId) => {
    const message = messages.find((m) => m.id === messageId);
    if (message && message.user.id === user?.id) {
      setEditingMessage(message);
    }
  };

  const handleUpdateMessage = async (e) => {
    e.preventDefault();
    if (!editingMessage.text.trim()) return;

    try {
      const response = await fetch(
        `/api/projects/${params.id}/messages/${editingMessage.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: editingMessage.text }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update message");
      }

      const updatedMessage = await response.json();
      setMessages(
        messages.map((m) => (m.id === updatedMessage.id ? updatedMessage : m))
      );
      setEditingMessage(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm("Are you sure you want to delete this message?")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/projects/${params.id}/messages/${messageId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete message");
      }

      setMessages(messages.filter((m) => m.id !== messageId));
    } catch (err) {
      setError(err.message);
    }
  };

  // Format timestamp for mobile
  const formatMessageTime = (createdAt, isMobile = false) => {
    const date = new Date(createdAt);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (isMobile && diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (isMobile && diffInHours < 48) {
      return `Yesterday ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (isMobile) {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
    return date.toLocaleTimeString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-500 px-4 text-center">
        <div>
          <div className="text-lg font-semibold mb-2">Oops!</div>
          <div className="text-sm">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-gray-900">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-2 sm:px-4 py-2 sm:py-4 space-y-3 sm:space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 px-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mb-4 opacity-50">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
              </svg>
            </div>
            <p className="text-center text-sm sm:text-base">No messages yet</p>
            <p className="text-center text-xs sm:text-sm mt-1 text-gray-500">Start the conversation!</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isOwnMessage = message.user.id === user?.id;
            const showAvatar = index === 0 || messages[index - 1].user.id !== message.user.id;
            const isLastInGroup = index === messages.length - 1 || messages[index + 1].user.id !== message.user.id;
            
            return (
              <div
                key={message.id}
                className={`flex items-end gap-2 sm:gap-3 ${
                  isOwnMessage ? "flex-row-reverse" : ""
                } ${!showAvatar ? "ml-10 sm:ml-12" : ""}`}
              >
                {/* Avatar - only show for first message in a group */}
                {showAvatar && (
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-gray-700 flex-shrink-0 mb-1">
                    {message.user.imageUrl ? (
                      <img
                        src={message.user.imageUrl}
                        alt={message.user.firstName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-sm font-semibold">
                        {message.user.firstName?.[0] || "U"}
                      </div>
                    )}
                  </div>
                )}
                
                {!showAvatar && <div className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0" />}
                
                {/* Message Content */}
                <div
                  className={`flex flex-col max-w-[85%] sm:max-w-md ${
                    isOwnMessage ? "items-end" : "items-start"
                  }`}
                >
                  {/* Name and timestamp - only show for first message in group */}
                  {showAvatar && (
                    <div className={`flex items-center gap-2 mb-1 px-1 ${isOwnMessage ? "flex-row-reverse" : ""}`}>
                      <span className="text-xs sm:text-sm font-medium text-gray-300 truncate">
                        {isOwnMessage ? "You" : `${message.user.firstName} ${message.user.lastName}`}
                      </span>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        <span className="hidden sm:inline">
                          {formatMessageTime(message.createdAt, false)}
                        </span>
                        <span className="sm:hidden">
                          {formatMessageTime(message.createdAt, true)}
                        </span>
                      </span>
                    </div>
                  )}
                  
                  {/* Message bubble */}
                  {editingMessage?.id === message.id ? (
                    <form onSubmit={handleUpdateMessage} className="w-full">
                      <input
                        type="text"
                        value={editingMessage.text}
                        onChange={(e) =>
                          setEditingMessage({
                            ...editingMessage,
                            text: e.target.value,
                          })
                        }
                        className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-purple-500 border border-gray-600"
                        autoFocus
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          type="submit"
                          className="text-xs px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingMessage(null)}
                          className="text-xs px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div
                      className={`rounded-2xl px-3 py-2 sm:px-4 sm:py-2 shadow-sm ${
                        isOwnMessage
                          ? "bg-purple-600 text-white rounded-br-md"
                          : "bg-gray-800 text-white rounded-bl-md"
                      } ${!showAvatar && !isLastInGroup ? "mb-1" : ""}`}
                    >
                      <p className="text-sm sm:text-base leading-relaxed break-words">
                        {message.text}
                      </p>
                      
                      {/* Show timestamp on long press for mobile (inline for grouped messages) */}
                      {!showAvatar && (
                        <div className={`text-xs text-gray-400 mt-1 ${isOwnMessage ? "text-right" : "text-left"}`}>
                          <span className="hidden sm:inline">
                            {formatMessageTime(message.createdAt, false)}
                          </span>
                          <span className="sm:hidden">
                            {formatMessageTime(message.createdAt, true)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Action buttons - only show for own messages */}
                  {message.user.id === user?.id && !editingMessage && isLastInGroup && (
                    <div className={`flex gap-3 mt-1 px-1 ${isOwnMessage ? "flex-row-reverse" : ""}`}>
                      <button
                        onClick={() => handleEditMessage(message.id)}
                        className="text-xs text-gray-400 hover:text-white transition-colors py-1 px-2 rounded hover:bg-gray-700/50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteMessage(message.id)}
                        className="text-xs text-gray-400 hover:text-red-400 transition-colors py-1 px-2 rounded hover:bg-gray-700/50"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message Input */}
      <form
        onSubmit={handleSendMessage}
        className="p-3 sm:p-4 border-t border-gray-700 bg-gray-900"
      >
        <div className="flex gap-2 sm:gap-3">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-gray-800 text-white rounded-full px-4 py-3 sm:py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-purple-500 border border-gray-600 placeholder-gray-400"
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-purple-600 text-white px-4 sm:px-6 py-3 sm:py-2 rounded-full hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center min-w-[48px] sm:min-w-[auto]"
          >
            <span className="hidden sm:inline">Send</span>
            <svg className="w-5 h-5 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default MessagesPage;
