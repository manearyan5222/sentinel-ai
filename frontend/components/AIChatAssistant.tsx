'use client';

import React, { useState } from 'react';
import { sendAIChat } from '../lib/api';
import { AIChatMessage } from '../lib/types';
import { Sparkles, Send, Bot, User, MessageSquare, X, ChevronDown } from 'lucide-react';

export function AIChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Hello Guard. I am your SentinelAI Security Assistant. Ask me to summarize active alerts, query specific cameras, or check resident activity.',
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMsg: AIChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: inputMessage,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await sendAIChat(userMsg.text);
      const botMsg: AIChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: response.answer,
        referencedAlerts: response.referenced_alerts,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: 'Sorry, I could not query the event log right now. Please try again.',
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const sampleQueries = [
    "Summarize active alerts today",
    "Which camera triggered the most events?",
    "Explain the perimeter fence incident",
  ];

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-full shadow-2xl transition-all border border-purple-400/40 group font-bold text-xs"
        >
          <Sparkles className="w-5 h-5 text-purple-200 animate-pulse group-hover:rotate-12 transition-transform" />
          <span>AI Security Assistant</span>
        </button>
      ) : (
        <div className="w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[460px] animate-fade-in">
          {/* Header */}
          <div className="px-4 py-3 bg-purple-950/80 border-b border-purple-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-900 border border-purple-700">
                <Sparkles className="w-4 h-4 text-purple-300 animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-xs text-purple-100 uppercase tracking-wide">
                  SentinelAI SOC Assistant
                </h3>
                <span className="text-[10px] text-purple-300 block leading-none">
                  Read-Only Database Intelligence
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-purple-300 hover:text-white transition-colors"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs bg-slate-950/80">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-purple-950 border border-purple-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-purple-300" />
                  </div>
                )}
                <div
                  className={`p-3 rounded-xl max-w-[80%] space-y-1 ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                  }`}
                >
                  <p className="leading-relaxed">{msg.text}</p>
                  <span className="text-[9px] opacity-60 block text-right font-mono">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-purple-400 font-mono text-[11px]">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Querying SentinelAI event logs...</span>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div className="px-3 py-1.5 bg-slate-950 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-[10px]">
            {sampleQueries.map((q, idx) => (
              <button
                key={idx}
                onClick={() => setInputMessage(q)}
                className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded whitespace-nowrap transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Form Input */}
          <form onSubmit={handleSend} className="p-2.5 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about alerts, cameras, or events..."
              className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="p-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl disabled:opacity-50 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
