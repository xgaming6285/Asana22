"use client";

import { useState } from "react";

export default function TestSignalPage() {
  const [phoneNumber, setPhoneNumber] = useState("6fb70b46-30bf-4dd8-a683-9ca2631325cc");
  const [apiKey, setApiKey] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  const sendTestMessage = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/signal/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber,
          apiKey,
          message: message || undefined, // Send undefined to use default test message
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult({ success: true, message: data.message });
      } else {
        setResult({ success: false, message: data.error || "Failed to send message" });
      }
    } catch (error) {
      setResult({ success: false, message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8 shadow-2xl">
          <h1 className="text-3xl font-bold text-white mb-8 text-center">
            🔔 Signal Test Page
          </h1>
          
          <div className="space-y-6">
            {/* Phone Number */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                Signal Phone/Username
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl text-white placeholder-slate-400 transition-all duration-200"
                placeholder="UUID or +1234567890"
              />
            </div>

            {/* API Key */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                CallMeBot API Key
              </label>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl text-white placeholder-slate-400 transition-all duration-200"
                placeholder="Your CallMeBot API key"
              />
            </div>

            {/* Custom Message */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                Custom Message (optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl text-white placeholder-slate-400 transition-all duration-200 resize-none"
                rows={4}
                placeholder="Leave empty to send default test message"
              />
            </div>

            {/* Instructions */}
            <div className="bg-indigo-900/30 border border-indigo-500/30 rounded-xl p-4">
              <h3 className="text-indigo-300 font-medium mb-2">📱 Setup Instructions:</h3>
              <ol className="text-sm text-indigo-200 space-y-1 list-decimal list-inside">
                <li>Add <strong>+34 644 52 74 88</strong> to your Signal contacts</li>
                <li>Send "I allow callmebot to send me messages" to that contact</li>
                <li>Copy the API key from the bot's response</li>
                <li>Paste it above and click "Send Test Message"</li>
              </ol>
            </div>

            {/* Send Button */}
            <button
              onClick={sendTestMessage}
              disabled={isLoading || !phoneNumber.trim() || !apiKey.trim()}
              className={`
                w-full py-3 px-6 rounded-xl font-medium transition-all duration-200
                ${isLoading || !phoneNumber.trim() || !apiKey.trim()
                  ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-lg hover:shadow-xl'
                }
              `}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Sending...
                </div>
              ) : (
                "Send Test Message"
              )}
            </button>

            {/* Result */}
            {result && (
              <div className={`
                p-4 rounded-xl border
                ${result.success 
                  ? 'bg-green-900/30 border-green-500/30 text-green-200' 
                  : 'bg-red-900/30 border-red-500/30 text-red-200'
                }
              `}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {result.success ? '✅' : '❌'}
                  </span>
                  <span className="font-medium">
                    {result.success ? 'Success!' : 'Error'}
                  </span>
                </div>
                <p className="mt-1 text-sm opacity-90">{result.message}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 