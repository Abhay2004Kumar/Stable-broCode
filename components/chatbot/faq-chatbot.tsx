"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  Minimize2,
  Maximize2,
  Sparkles,
  ArrowUp
} from "lucide-react";

interface Message {
  id: string;
  type: 'bot' | 'user';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  isTyping?: boolean;
}

const quickSuggestions = [
  "What is BroCode?",
  "How do I get started?",
  "Which languages are supported?",
  "Is it free to use?",
  "How do I save projects?",
  "Can I collaborate with others?"
];

export default function FAQChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: "👋 Hi! I'm your AI-powered BroCode assistant. I have comprehensive knowledge about our platform and can answer any questions about BroCode's features, coding help, supported languages, and development tools. For questions outside of coding and our platform, I'll politely let you know they're outside my expertise. What would you like to know about BroCode?",
        timestamp: new Date(),
        suggestions: quickSuggestions.slice(0, 3)
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length]);

  // Auto-focus input when opened on desktop
  useEffect(() => {
    if (isOpen && !isMinimized && !isMobile) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, isMinimized, isMobile]);

  const simulateTyping = async (): Promise<void> => {
    setIsTyping(true);
    // Simulate typing delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    setIsTyping(false);
  };

  const handleSendMessage = async (text: string = inputValue) => {
    if (!text.trim() || isTyping) return;

    // Blur input on mobile to hide keyboard
    if (isMobile) {
      inputRef.current?.blur();
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: text.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");

    // Simulate bot thinking
    await simulateTyping();

    let botResponse: Message;

    // Always use AI for all responses
    try {
      const response = await fetch('/api/faq-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text.trim(),
          history: messages
            .filter(msg => !msg.isTyping)
            .slice(-6) // Last 6 messages for context
            .map(msg => ({
              role: msg.type === 'user' ? 'user' : 'assistant',
              content: msg.content
            }))
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      botResponse = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: data.response,
        timestamp: new Date(),
        suggestions: data.isRelevant ? quickSuggestions.slice(0, 2) : []
      };

    } catch (error) {
      console.error('AI response error:', error);
      botResponse = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: "I apologize, but I'm having trouble processing your question right now. Please try again, or you can ask me about BroCode features, coding help, or getting started with our platform.",
        timestamp: new Date(),
        suggestions: quickSuggestions.slice(0, 3)
      };
    }

    setMessages(prev => [...prev, botResponse]);
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  // Touch handlers for mobile swipe-to-close
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isMobile) {
      setTouchStart(e.touches[0].clientY);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isMobile || !touchStart) return;
    
    const touchEnd = e.changedTouches[0].clientY;
    const diff = touchStart - touchEnd;
    
    // If swipe down is more than 100px, close the chat
    if (diff < -100) {
      setIsOpen(false);
    }
    
    setTouchStart(0);
  };

  if (!isOpen) {
    return (
      <div className={`fixed z-50 ${isMobile ? 'bottom-4 right-4' : 'bottom-6 right-6'}`}>
        <Button
          onClick={() => setIsOpen(true)}
          className={`${isMobile ? 'h-12 w-12' : 'h-14 w-14'} rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110 group relative overflow-hidden`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <MessageCircle className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} text-white group-hover:scale-110 transition-transform duration-300 relative z-10`} />
          <Sparkles className="absolute top-1 right-1 h-3 w-3 text-yellow-300 animate-pulse opacity-70" />
        </Button>
      </div>
    );
  }

  return (
    <div className={`fixed z-50 ${isMobile ? 'inset-4' : 'bottom-6 right-6'}`}>
      <div className={`${
        isMobile 
          ? isMinimized 
            ? 'w-full h-16 bottom-0 right-0 absolute' 
            : 'w-full h-full max-h-[calc(100vh-2rem)]'
          : `w-96 ${isMinimized ? 'h-16' : 'h-[580px]'}`
      } rounded-lg border border-blue-500/30 shadow-2xl backdrop-blur-sm bg-background/95 transition-all duration-300 overflow-hidden flex flex-col`}>
        {/* Header */}
        <div 
          className={`${isMobile ? 'p-3' : 'px-5 py-4'} relative overflow-hidden flex-shrink-0 cursor-pointer`}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Background with gradient and pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/8 via-cyan-500/6 to-blue-500/8" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,oklch(0.65_0.2_240/0.05),transparent_70%)]" />
          
          {/* Border gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {/* Enhanced Avatar */}
              <div className={`${isMobile ? 'h-7 w-7' : 'h-10 w-10'} rounded-full relative flex items-center justify-center flex-shrink-0`}>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full shadow-lg" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-300" />
                <Bot className={`${isMobile ? 'h-3 w-3' : 'h-5 w-5'} text-white relative z-10`} />
                {isTyping && (
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full shadow-md">
                    <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75" />
                  </div>
                )}
                {!isTyping && (
                  <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 bg-green-500 rounded-full shadow-sm" />
                )}
              </div>
              
              {/* Title and Status */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className={`${isMobile ? 'text-xs' : 'text-base'} font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent truncate`}>
                    BroCode AI Assistant
                  </h3>
                  <Sparkles className={`${isMobile ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5'} text-yellow-500/70 animate-pulse`} />
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className={`h-1.5 w-1.5 rounded-full ${isTyping ? 'bg-orange-500 animate-pulse' : 'bg-green-500'} shadow-sm`} />
                  <p className={`${isMobile ? 'text-[10px]' : 'text-sm'} text-muted-foreground/80 font-medium truncate`}>
                    {isTyping ? "Processing your request..." : isMobile ? "Swipe down to close" : "Ready to assist with coding"}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {isMobile && (
                <div className="w-8 h-1.5 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-full mr-2" />
              )}
              {!isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0 hover:bg-blue-500/10 hover:border-blue-500/20 border border-transparent transition-all duration-200 rounded-lg group"
                  onClick={() => setIsMinimized(!isMinimized)}
                >
                  {isMinimized ? (
                    <Maximize2 className="h-4 w-4 text-muted-foreground group-hover:text-blue-500 transition-colors" />
                  ) : (
                    <Minimize2 className="h-4 w-4 text-muted-foreground group-hover:text-blue-500 transition-colors" />
                  )}
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className={`${isMobile ? 'h-7 w-7' : 'h-9 w-9'} p-0 hover:bg-red-500/10 hover:border-red-500/20 border border-transparent transition-all duration-200 rounded-lg group`}
                onClick={() => setIsOpen(false)}
              >
                <X className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-muted-foreground group-hover:text-red-500 transition-colors`} />
              </Button>
            </div>
          </div>
        </div>

        {/* Chat Content */}
        {!isMinimized && (
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Messages */}
            <div className={`${isMobile ? 'p-3' : 'p-4'} flex-1 overflow-y-auto ${
              isMobile ? 'max-h-[calc(100vh-8rem)]' : ''
            }`}>
              <div className={`space-y-${isMobile ? '3' : '4'}`}>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${isMobile ? 'gap-2' : 'gap-3'} ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
                  >
                    {message.type === 'bot' && (
                      <div className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'} rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-md`}>
                        <Bot className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-white`} />
                      </div>
                    )}
                    
                    <div className={`${isMobile ? 'max-w-[85%]' : 'max-w-[80%]'} ${message.type === 'user' ? 'order-first' : ''}`}>
                      <div
                        className={`rounded-2xl ${isMobile ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-sm'} ${
                          message.type === 'user'
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white ml-auto shadow-lg'
                            : 'bg-muted/80 backdrop-blur-sm border border-border/50'
                        } transition-all duration-200 hover:shadow-md`}
                      >
                        {message.content}
                      </div>
                      
                      {/* Suggestions */}
                      {message.suggestions && message.suggestions.length > 0 && (
                        <div className={`${isMobile ? 'mt-1.5 space-y-1' : 'mt-2 space-y-1'}`}>
                          <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-muted-foreground font-medium`}>
                            Quick suggestions:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {message.suggestions.map((suggestion, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                className={`${
                                  isMobile 
                                    ? 'text-[10px] h-6 px-2' 
                                    : 'text-xs h-7 px-3'
                                } border-blue-500/30 hover:bg-blue-500/10 hover:border-blue-500/50 transition-all duration-200`}
                                onClick={() => handleSuggestionClick(suggestion)}
                              >
                                {suggestion}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {message.type === 'user' && (
                      <div className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'} rounded-full bg-gradient-to-r from-gray-500 to-gray-600 flex items-center justify-center flex-shrink-0 shadow-md`}>
                        <User className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-white`} />
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Typing indicator */}
                {isTyping && (
                  <div className={`flex ${isMobile ? 'gap-2' : 'gap-3'} justify-start animate-in slide-in-from-bottom-2 duration-300`}>
                    <div className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'} rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-md`}>
                      <Bot className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-white`} />
                    </div>
                    <div className={`bg-muted/80 backdrop-blur-sm border border-border/50 rounded-2xl ${isMobile ? 'px-3 py-2' : 'px-4 py-3'}`}>
                      <div className="flex gap-1">
                        <div className={`${isMobile ? 'w-1.5 h-1.5' : 'w-2 h-2'} bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]`}></div>
                        <div className={`${isMobile ? 'w-1.5 h-1.5' : 'w-2 h-2'} bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]`}></div>
                        <div className={`${isMobile ? 'w-1.5 h-1.5' : 'w-2 h-2'} bg-blue-500 rounded-full animate-bounce`}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input */}
            <div className={`${isMobile ? 'p-3' : 'p-4'} border-t border-blue-500/20 bg-background/95 mt-auto`}>
              <div className="flex gap-2 items-end">
                <div className="flex-1 relative">
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={isMobile ? "Ask about BroCode..." : "Ask me anything about BroCode..."}
                    className={`${
                      isMobile ? 'text-sm h-10 chatbot-mobile-input' : 'text-sm h-10'
                    } pr-10 border-blue-500/30 focus:border-blue-500 focus:ring-blue-500/20 rounded-2xl transition-all duration-200`}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    disabled={isTyping}
                    maxLength={500}
                  />
                  {inputValue.trim() && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      <div className="h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <ArrowUp className="h-3 w-3 text-blue-500" />
                      </div>
                    </div>
                  )}
                </div>
                <Button
                  size="sm"
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isTyping}
                  className={`${
                    isMobile ? 'h-10 w-10 p-0' : 'h-10 px-4'
                  } bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100`}
                >
                  <Send className={`${isMobile ? 'h-4 w-4' : 'h-4 w-4'}`} />
                  {!isMobile && <span className="ml-1 text-xs font-medium">Send</span>}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}