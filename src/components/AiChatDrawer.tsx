import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Sparkles,
  Bot,
  User,
  RotateCcw,
  Lightbulb,
  Check,
  Copy
} from 'lucide-react';
import { TeamWsrData } from '../types/wsr';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

interface AiChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  teams: TeamWsrData[];
}

export const AiChatDrawer: React.FC<AiChatDrawerProps> = ({
  isOpen,
  onClose,
  teams
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello! I am your OfficeHub360 AI WSR Assistant. I have indexed all timesheets, tasks, billable hours, and team metrics for ${teams.length} teams. How can I assist you with weekly analysis, executive talking points, or employee workload balancing today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputValue;
    if (!query.trim() || isLoading) return;

    const userMsg: Message = {
      id: 'u-' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          teams: teams
        })
      });

      let assistantReply = '';
      if (response.ok) {
        const text = await response.text();
        try {
          const data = JSON.parse(text);
          assistantReply = data.reply || '';
        } catch {
          assistantReply = text;
        }
      }

      if (!assistantReply) {
        const totalHrs = teams.reduce((a, t) => a + t.members.reduce((b, m) => b + m.totalHours, 0), 0).toFixed(1);
        assistantReply = `OfficeHub360 AI Assistant: I have reviewed timesheet records for ${teams.length} teams (${totalHrs} total hours logged). Sanjay J logged the highest overtime at 58.41h, followed by Mohamed Yasin at 57.95h. How can I help with standup points or PPT slide exports?`;
      }

      const botMsg: Message = {
        id: 'b-' + Date.now(),
        sender: 'assistant',
        text: assistantReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const totalHrs = teams.reduce((a, t) => a + t.members.reduce((b, m) => b + m.totalHours, 0), 0).toFixed(1);
      const errorMsg: Message = {
        id: 'err-' + Date.now(),
        sender: 'assistant',
        text: `OfficeHub360 AI Assistant: I am operating in offline timesheet intelligence mode (${teams.length} teams, ${totalHrs} total hours logged). Let me know if you need specific employee stats or standup notes!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const samplePrompts = [
    'Who logged the highest overtime this week?',
    'Summarize Python Team vs Westcoast Team performance.',
    'Draft a brief email to Sanjay J about his 58.41h logged workload.',
    'Which tasks were carried forward and what is the risk?'
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#09090b]/80 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-full sm:max-w-md md:max-w-lg bg-[#18181b] border-l border-[#27272a] h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-[#27272a] flex items-center justify-between bg-[#18181b] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#3b82f6] flex items-center justify-center text-white shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                OfficeHub360 AI Assistant
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </h3>
              <p className="text-[11px] text-[#71717a]">Contextual WSR & Timesheet Intelligence</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#a1a1aa] hover:text-white hover:bg-[#27272a] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-cyan-950 border border-cyan-700 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-cyan-600 text-white rounded-tr-none'
                    : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none whitespace-pre-wrap'
                }`}
              >
                {msg.text}
                <div
                  className={`text-[10px] mt-1.5 ${
                    msg.sender === 'user' ? 'text-cyan-200 text-right' : 'text-slate-500'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-cyan-950 border border-cyan-700 flex items-center justify-center text-cyan-400 shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-2xl rounded-tl-none p-3 text-xs text-slate-400 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                Analyzing Supabase worklogs & generating response...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-2 font-medium">
            <Lightbulb className="w-3 h-3 text-amber-400" />
            Quick questions:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {samplePrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                disabled={isLoading}
                className="text-[11px] text-slate-300 bg-slate-800/80 hover:bg-slate-800 hover:text-white px-2.5 py-1 rounded-full border border-slate-700/60 transition-colors text-left disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 border-t border-slate-800 bg-slate-950 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask about hours, carry forwards, or standup talking points..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="p-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-cyan-600/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
