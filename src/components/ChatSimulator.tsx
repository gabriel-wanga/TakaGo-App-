import { useState, useRef, useEffect, FormEvent } from 'react';
import { Send, User, MessageSquare, Phone, X } from 'lucide-react';
import { ChatMessage, UserRole } from '../types';
import { Language, translations } from '../utils/translations';

interface ChatSimulatorProps {
  pickupId: string;
  senderRole: UserRole;
  senderName: string;
  recipientName: string;
  chatHistory: ChatMessage[];
  language: Language;
  onSendMessage: (text: string) => void;
  onClose?: () => void;
}

export default function ChatSimulator({
  pickupId,
  senderRole,
  senderName,
  recipientName,
  chatHistory,
  language,
  onSendMessage,
  onClose
}: ChatSimulatorProps) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const t = translations[language];

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSend = (e: FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const filteredMessages = chatHistory.filter(msg => msg.pickupId === pickupId);

  return (
    <div className="flex flex-col h-[400px] border border-gray-200 bg-white rounded-2xl shadow-xl overflow-hidden" id="chat-simulator-container">
      {/* Header */}
      <div className="bg-emerald-600 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-white text-white font-bold">
              {recipientName ? recipientName[0] : 'U'}
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-emerald-600 rounded-full animate-pulse"></span>
          </div>
          <div>
            <h4 className="font-semibold text-sm leading-tight">{recipientName || t.collector}</h4>
            <span className="text-[11px] text-emerald-100 flex items-center font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-200 mr-1 inline-block"></span>
              {pickupId}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Mock call helper */}
          <button
            onClick={() => alert(language === 'en' ? `Dialing ${recipientName} at simulated VoIP line...` : `Inapiga simu ya ${recipientName} kwa mtandao...`)}
            className="p-1.5 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
            title="Call"
            id="chat-btn-phone"
          >
            <Phone className="w-4 h-4" />
          </button>
          {onClose && (
            <button onClick={onClose} className="p-1.5 hover:bg-emerald-700 rounded-lg transition-colors opacity-80 hover:opacity-100 cursor-pointer" id="chat-btn-close">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50 space-y-3 flex flex-col" id="chat-messages-area">
        {filteredMessages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-gray-400">
            <MessageSquare className="w-8 h-8 mb-2 text-gray-300 animate-bounce" />
            <p className="text-xs">{language === 'en' ? `Send a text to ${recipientName} to align collection specifics!` : `Mtumie ujumbe ${recipientName} ili kukubaliana kuhusu kuchukua taka!`}</p>
          </div>
        ) : (
          filteredMessages.map((msg) => {
            // Is sender the current viewer role?
            const isMe = (senderRole === 'customer' && msg.senderRole === 'customer') || 
                         (senderRole === 'collector' && msg.senderRole === 'collector');

            return (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[85%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}
              >
                <div
                  className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isMe
                      ? 'bg-emerald-600 text-white rounded-br-none'
                      : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-line break-words">{msg.text}</p>
                </div>
                <span className="text-[9px] text-gray-400 mt-1 px-1 font-mono">{msg.timestamp}</span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex items-center space-x-2" id="chat-message-form">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={t.typeMessage}
          className="flex-1 px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all"
          maxLength={150}
          id="chat-input-text-field"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          id="chat-btn-send"
        >
          <Send className="w-4.5 h-4.5" />
        </button>
      </form>
    </div>
  );
}
