import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MessageSquare, Send, Search, User, Star, MapPin, Plus, Trash2, DollarSign, Calendar, FileText, MoreVertical, X, Check, XCircle } from "lucide-react";
import { apiUrl } from "@/lib/api";

const fetchProviders = async () => {
  const res = await fetch(apiUrl("/api/services"));
  if (!res.ok) throw new Error("Failed to load providers");
  return res.json();
};

const fetchChats = async () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Not authenticated");
  const res = await fetch(apiUrl("/api/chats"), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to load chats");
  return res.json();
};

const fetchMessages = async (chatId: string) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Not authenticated");
  const res = await fetch(apiUrl(`/api/chats/${chatId}/messages`), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to load messages");
  return res.json();
};

const createChat = async ({ providerEmail, providerName }: { providerEmail: string; providerName: string }) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Not authenticated");
  const res = await fetch(apiUrl("/api/chats"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ providerEmail, providerName }),
  });
  if (!res.ok) {
    // Check if response is JSON before parsing
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const error = await res.json();
      throw new Error(error.error || "Failed to create chat");
    } else {
      const text = await res.text();
      throw new Error(`Failed to create chat: ${res.status} ${res.statusText}`);
    }
  }
  const data = await res.json();
  return data;
};

const sendMessage = async ({ chatId, content }: { chatId: string; content: string }) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Not authenticated");
  const res = await fetch(apiUrl("/api/messages"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ chatId, content }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to send message");
  }
  return res.json();
};

const deleteChat = async (chatId: string) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Not authenticated");
  const res = await fetch(apiUrl(`/api/chats/${chatId}`), {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to delete chat");
  }
  return res.json();
};

const ChatPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [providerSearch, setProviderSearch] = useState("");
  const [showProviderList, setShowProviderList] = useState(false);
  const [showChatOptions, setShowChatOptions] = useState(false);
  const [showNegotiate, setShowNegotiate] = useState(false);
  const [negotiatePrice, setNegotiatePrice] = useState(0);
  const [basePrice, setBasePrice] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check authentication - redirect if not signed in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !user) {
      navigate("/auth/login", { state: { from: "/chat" } });
      return;
    }
  }, [user, navigate]);

  // Don't render chat UI if not authenticated
  const token = localStorage.getItem("token");
  if (!token || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030711] text-white">
        <div className="text-center">
          <p className="text-lg opacity-70">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  const { data: providers = [] } = useQuery({
    queryKey: ["providers", "chat"],
    queryFn: fetchProviders,
    enabled: !!token && !!user,
  });

  const { data: chats = [], isLoading: chatsLoading } = useQuery({
    queryKey: ["chats"],
    queryFn: fetchChats,
    enabled: !!token && !!user,
    refetchInterval: 3000,
    retry: false,
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ["messages", selectedChat],
    queryFn: () => fetchMessages(selectedChat!),
    enabled: !!selectedChat && !!token && !!user,
    refetchInterval: 2000,
  });

  const createChatMutation = useMutation({
    mutationFn: createChat,
    onSuccess: async (data) => {
      console.log('Chat created successfully:', data);
      // Invalidate and refetch chats
      await queryClient.invalidateQueries({ queryKey: ["chats"] });
      // Wait a bit then refetch to get the new chat
      setTimeout(async () => {
        try {
          const updatedChats = await queryClient.fetchQuery({ queryKey: ["chats"], queryFn: fetchChats });
          // Find the new chat by ID
          const newChat = updatedChats.find((c: any) => c.id === data.chatId);
          if (newChat) {
            setSelectedChat(newChat.id);
          } else {
            // Fallback: use the chatId directly
            setSelectedChat(data.chatId);
          }
          setShowProviderList(false);
        } catch (err) {
          console.error('Error fetching updated chats:', err);
          // Fallback: use the chatId directly
          setSelectedChat(data.chatId);
          setShowProviderList(false);
        }
      }, 500);
    },
    onError: (error: any) => {
      console.error('Error creating chat:', error);
      alert(error.message || 'Failed to create chat. Please try again.');
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: sendMessage,
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["messages", selectedChat] });
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });

  const deleteChatMutation = useMutation({
    mutationFn: deleteChat,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["chats"] });
      setSelectedChat(null);
      setShowDeleteConfirm(false);
      setShowChatOptions(false);
    },
    onError: (error: any) => {
      console.error('Error deleting chat:', error);
      alert(error.message || 'Failed to delete chat. Please try again.');
      setShowDeleteConfirm(false);
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle navigation from booking page
  useEffect(() => {
    const state = location.state as any;
    if (state?.providerEmail && state?.providerName) {
      const processNavigation = async () => {
        // Wait for chats to load if still loading
        if (chatsLoading) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // Re-fetch chats to ensure we have the latest
        const currentChats = await queryClient.fetchQuery({ queryKey: ["chats"], queryFn: fetchChats });
        
        // Check if chat already exists by name or email
        const existingChat = currentChats.find((c: any) => 
          c.name === state.providerName || 
          c.otherEmail === state.providerEmail ||
          c.name?.toLowerCase() === state.providerName?.toLowerCase()
        );
        
        if (existingChat) {
          setSelectedChat(existingChat.id);
          setShowProviderList(false);
        } else if (!createChatMutation.isPending) {
          // Create new chat
          createChatMutation.mutate({
            providerEmail: state.providerEmail,
            providerName: state.providerName,
          });
        }
        
        // Clear state after processing
        window.history.replaceState({}, '', location.pathname);
      };
      
      processNavigation();
    }
  }, [location.state]);

  // Set base price when chat is selected
  useEffect(() => {
    if (selectedChat && providers.length > 0) {
      const chat = chats.find((c: any) => c.id === selectedChat);
      if (chat) {
        const provider = providers.find((p: any) => p.provider === chat.name || p.name === chat.name);
        if (provider) {
          setBasePrice(parseFloat(provider.price) || 0);
          setNegotiatePrice(parseFloat(provider.price) || 0);
        }
      }
    }
  }, [selectedChat, chats, providers]);

  const currentChat = chats.find((c: any) => c.id === selectedChat);
  const shouldShowProviderList = showProviderList || (chats.length === 0 && !selectedChat);
  
  // Determine role-based features
  const currentUserRole = user?.role || 'influencer';
  
  // Check if the other user is a provider (by checking if they're in the providers list)
  const isOtherUserProvider = currentChat && providers.some((p: any) => 
    p.provider === currentChat.name || 
    p.name === currentChat.name ||
    p.provider?.toLowerCase() === currentChat.name?.toLowerCase()
  );
  
  // Features available based on roles:
  // - Negotiate Price: Only influencers can negotiate with providers
  // - Request Quote: Both can request quotes
  // - Schedule Meeting: Both can schedule meetings
  // - Request Portfolio: Only influencers can request portfolio from providers
  const canNegotiatePrice = currentUserRole === 'influencer' && !!isOtherUserProvider;
  const canRequestPortfolio = currentUserRole === 'influencer' && !!isOtherUserProvider;

  const filteredProviders = providers.filter((provider: any) => {
    if (!providerSearch.trim()) return true;
    const search = providerSearch.toLowerCase();
    return (
      provider.provider?.toLowerCase().includes(search) ||
      provider.name?.toLowerCase().includes(search) ||
      provider.category?.toLowerCase().includes(search) ||
      provider.location?.toLowerCase().includes(search)
    );
  });

  const handleStartChat = async (provider: any, providerEmail?: string, providerName?: string) => {
    try {
      const email = providerEmail || (provider.provider?.toLowerCase().replace(/\s+/g, '.') + '@onefame.local') || `${provider.provider}@onefame.local`;
      const name = providerName || provider.provider || provider.name;
      
      // Ensure chats are loaded
      if (chatsLoading) {
        await queryClient.fetchQuery({ queryKey: ["chats"], queryFn: fetchChats });
      }
      
      // Get fresh chats list
      const currentChats = await queryClient.fetchQuery({ queryKey: ["chats"], queryFn: fetchChats });
      
      // Check if chat already exists
      const existingChat = currentChats.find((c: any) => 
        c.name === name || 
        c.name?.toLowerCase() === name?.toLowerCase() ||
        c.otherEmail === email
      );
      
      if (existingChat) {
        setSelectedChat(existingChat.id);
        setShowProviderList(false);
      } else {
        createChatMutation.mutate({
          providerEmail: email,
          providerName: name,
        });
      }
    } catch (err: any) {
      console.error('Error starting chat:', err);
      alert(err.message || 'Failed to start chat. Please try again.');
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedChat) return;
    sendMessageMutation.mutate({
      chatId: selectedChat,
      content: message.trim(),
    });
  };

  const handleNegotiate = () => {
    if (!selectedChat || negotiatePrice === basePrice) return;
    const diff = negotiatePrice - basePrice;
    const message = diff > 0 
      ? `I'd like to negotiate the price to ₹${negotiatePrice} (₹${Math.abs(diff)} increase)`
      : `I'd like to negotiate the price to ₹${negotiatePrice} (₹${Math.abs(diff)} discount)`;
    sendMessageMutation.mutate({
      chatId: selectedChat,
      content: message,
    });
    setShowNegotiate(false);
  };

  const handleRequestQuote = () => {
    if (!selectedChat) return;
    sendMessageMutation.mutate({
      chatId: selectedChat,
      content: "Could you please provide a detailed quote for your services?",
    });
    setShowChatOptions(false);
  };

  const handleScheduleMeeting = () => {
    if (!selectedChat) return;
    sendMessageMutation.mutate({
      chatId: selectedChat,
      content: "I'd like to schedule a meeting to discuss the project details. What times work for you?",
    });
    setShowChatOptions(false);
  };

  const handleRequestPortfolio = () => {
    if (!selectedChat) return;
    sendMessageMutation.mutate({
      chatId: selectedChat,
      content: "Could you please share your portfolio or previous work samples?",
    });
    setShowChatOptions(false);
  };

  const handleDeleteChat = () => {
    if (!selectedChat) return;
    deleteChatMutation.mutate(selectedChat);
  };

  return (
    <div className="relative min-h-screen bg-[#030711] text-white">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -left-20 top-0 h-96 w-96 rounded-full bg-purple-600/20 blur-[140px]" />
        <div className="absolute right-0 top-1/4 h-80 w-80 rounded-full bg-purple-500/20 blur-[120px]" />
      </div>
      <Navbar />
      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-white">Messages</h1>
          <p className="mt-2 text-white/70">Chat with providers in real-time</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[350px,1fr] gap-6 h-[calc(100vh-250px)]">
          {/* Sidebar */}
          <div style={{ backgroundColor: '#000000', borderColor: 'rgba(255, 255, 255, 0.1)' }} className="rounded-2xl border overflow-hidden flex flex-col">
            {shouldShowProviderList ? (
              <>
                <div className="p-4 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <h2 style={{ color: '#ffffff' }} className="font-bold">Start New Chat</h2>
                    {chats.length > 0 && (
                      <button
                        onClick={() => setShowProviderList(false)}
                        className="text-sm text-purple-300 hover:text-purple-200 transition"
                      >
                        View chats
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Search className="h-5 w-5 opacity-60" />
                    <input
                      value={providerSearch}
                      onChange={(e) => setProviderSearch(e.target.value)}
                      placeholder="Search providers..."
                      style={{ color: '#ffffff', backgroundColor: '#030711' }}
                      className="flex-1 rounded-lg border border-white/20 px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {filteredProviders.map((provider: any) => (
                    <div
                      key={provider.id}
                      style={{ backgroundColor: '#030711', borderColor: 'rgba(255, 255, 255, 0.1)' }}
                      className="rounded-xl border p-4 hover:border-purple-400/40 transition"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-400 flex items-center justify-center text-white font-bold">
                          {(provider.provider || provider.name)?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 style={{ color: '#ffffff' }} className="font-semibold truncate">{provider.provider}</h3>
                          <p className="text-sm opacity-70 truncate" style={{ color: '#ffffff' }}>{provider.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1" style={{ color: '#fbbf24' }}>
                              <Star className="h-3 w-3 fill-current" />
                              <span className="text-xs" style={{ color: '#ffffff' }}>{provider.rating || "4.8"}</span>
                            </div>
                            <span className="text-xs opacity-60" style={{ color: '#ffffff' }}>•</span>
                            <span className="text-xs opacity-60" style={{ color: '#ffffff' }}>{provider.location || "Remote"}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleStartChat(provider)}
                        disabled={createChatMutation.isPending}
                        className="w-full mt-3 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-400 text-white text-sm font-semibold shadow-md shadow-purple-900/30 transition hover:scale-105 disabled:opacity-50"
                      >
                        {createChatMutation.isPending ? "Starting..." : "Start Chat"}
                      </button>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="p-4 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <h2 style={{ color: '#ffffff' }} className="font-bold">Recent Chats</h2>
                    <button
                      onClick={() => setShowProviderList(true)}
                      className="inline-flex items-center gap-1 text-sm text-purple-300 hover:text-purple-200 transition"
                    >
                      <Plus className="h-4 w-4" />
                      New chat
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                  {chatsLoading ? (
                    <div className="p-4 text-center">
                      <p className="text-sm opacity-60" style={{ color: '#ffffff' }}>Loading chats...</p>
                    </div>
                  ) : chats.length === 0 ? (
                    <div className="p-8 text-center">
                      <MessageSquare className="h-12 w-12 opacity-30 mx-auto mb-4" style={{ color: '#ffffff' }} />
                      <p className="text-sm opacity-70 mb-4" style={{ color: '#ffffff' }}>No chats yet</p>
                      <button
                        onClick={() => setShowProviderList(true)}
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-400 text-white text-sm font-semibold"
                      >
                        Start your first chat
                      </button>
                    </div>
                  ) : (
                    chats.map((chat: any) => (
                      <div
                        key={chat.id}
                        onClick={() => {
                          setSelectedChat(chat.id);
                          setShowProviderList(false);
                        }}
                        style={{
                          backgroundColor: selectedChat === chat.id ? '#030711' : 'transparent',
                          borderColor: 'rgba(255, 255, 255, 0.1)'
                        }}
                        className="rounded-xl border p-3 mb-2 cursor-pointer hover:bg-white/5 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-400 flex items-center justify-center text-white text-sm font-bold">
                            {chat.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 style={{ color: '#ffffff' }} className="font-semibold text-sm truncate">{chat.name}</h3>
                              {chat.unread > 0 && (
                                <span className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full">
                                  {chat.unread}
                                </span>
                              )}
                            </div>
                            <p className="text-xs opacity-70 truncate mt-1" style={{ color: '#ffffff' }}>{chat.lastMessage}</p>
                            <p className="text-xs opacity-50 mt-1" style={{ color: '#ffffff' }}>{chat.time}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>

          {/* Main Chat Area */}
          <div style={{ backgroundColor: '#000000', borderColor: 'rgba(255, 255, 255, 0.1)' }} className="rounded-2xl border flex flex-col overflow-hidden">
            {selectedChat && currentChat ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-400 flex items-center justify-center text-white font-bold">
                        {currentChat.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 style={{ color: '#ffffff' }} className="font-semibold">{currentChat.name}</h3>
                        <p className="text-xs opacity-60" style={{ color: '#ffffff' }}>Online</p>
                      </div>
                    </div>
                    <div className="relative">
                      <button
                        onClick={() => setShowChatOptions(!showChatOptions)}
                        className="p-2 rounded-lg hover:bg-white/10 transition"
                      >
                        <MoreVertical className="h-5 w-5" style={{ color: '#ffffff' }} />
                      </button>
                      {showChatOptions && (
                        <div className="absolute right-0 mt-2 w-48 rounded-xl border border-white/10 bg-[#030711] p-2 shadow-xl z-50">
                          <button
                            onClick={() => {
                              setShowChatOptions(false);
                              setShowDeleteConfirm(true);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition text-left text-sm"
                            style={{ color: '#ffffff' }}
                          >
                            <Trash2 className="h-4 w-4 text-rose-400" />
                            Delete Chat
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messagesLoading ? (
                    <div className="text-center py-8">
                      <p className="text-sm opacity-60" style={{ color: '#ffffff' }}>Loading messages...</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-sm opacity-60" style={{ color: '#ffffff' }}>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((msg: any, idx: number) => {
                      // Use isMe from backend, which correctly identifies user's messages
                      const isMe = msg.isMe === true;
                      return (
                        <div key={msg.id || idx} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                          <div
                            style={{
                              backgroundColor: isMe ? '#7c3aed' : '#030711',
                              borderColor: 'rgba(255, 255, 255, 0.1)'
                            }}
                            className={`rounded-2xl px-4 py-2 max-w-[70%] border`}
                          >
                            {!isMe && (
                              <p className="text-xs font-semibold mb-1 opacity-80" style={{ color: '#ffffff' }}>
                                {msg.sender}
                              </p>
                            )}
                            <p style={{ color: '#ffffff' }} className="text-sm">{msg.content}</p>
                            <p className="text-xs opacity-50 mt-1" style={{ color: '#ffffff' }}>
                              {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Actions */}
                {!showNegotiate && (
                  <div className="px-4 pb-2 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                      {canNegotiatePrice && (
                        <button
                          onClick={() => setShowNegotiate(true)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-purple-400/40 bg-purple-500/20 text-purple-300 text-xs font-semibold whitespace-nowrap hover:bg-purple-500/30 transition"
                        >
                          <DollarSign className="h-3.5 w-3.5" />
                          Negotiate Price
                        </button>
                      )}
                      <button
                        onClick={handleRequestQuote}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/20 bg-white/5 text-white text-xs font-semibold whitespace-nowrap hover:bg-white/10 transition"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        Request Quote
                      </button>
                      <button
                        onClick={handleScheduleMeeting}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/20 bg-white/5 text-white text-xs font-semibold whitespace-nowrap hover:bg-white/10 transition"
                      >
                        <Calendar className="h-3.5 w-3.5" />
                        Schedule Meeting
                      </button>
                      {canRequestPortfolio && (
                        <button
                          onClick={handleRequestPortfolio}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/20 bg-white/5 text-white text-xs font-semibold whitespace-nowrap hover:bg-white/10 transition"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          Request Portfolio
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Negotiate Price Panel */}
                {showNegotiate && (
                  <div className="px-4 py-4 border-b" style={{ backgroundColor: '#030711', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                    <div className="flex items-center justify-between mb-4">
                      <h4 style={{ color: '#ffffff' }} className="font-semibold text-sm">Negotiate Price</h4>
                      <button
                        onClick={() => {
                          setShowNegotiate(false);
                          setNegotiatePrice(basePrice);
                        }}
                        className="p-1 rounded hover:bg-white/10"
                      >
                        <X className="h-4 w-4" style={{ color: '#ffffff' }} />
                      </button>
                    </div>
                    <div className="space-y-4">
                      {/* Base Price Display */}
                      <div className="text-center py-3 rounded-xl border border-white/10" style={{ backgroundColor: '#000000' }}>
                        <p className="text-xs opacity-70 mb-1" style={{ color: '#ffffff' }}>Base Price</p>
                        <p style={{ color: '#c084fc' }} className="text-2xl font-bold">₹{basePrice}</p>
                      </div>

                      {/* Price Adjustment Controls */}
                      <div className="flex flex-col items-center gap-3">
                        <button
                          onClick={() => setNegotiatePrice(negotiatePrice + 100)}
                          className="w-12 h-12 rounded-xl border-2 border-purple-400/40 bg-purple-500/20 flex items-center justify-center hover:bg-purple-500/30 transition"
                          style={{ color: '#ffffff' }}
                        >
                          <span className="text-2xl font-bold">+</span>
                        </button>
                        
                        <div className="text-center py-2">
                          <p className="text-xs opacity-70 mb-1" style={{ color: '#ffffff' }}>Negotiated Price</p>
                          <p style={{ color: negotiatePrice > basePrice ? '#10b981' : negotiatePrice < basePrice ? '#f59e0b' : '#c084fc' }} className="text-3xl font-bold">
                            ₹{negotiatePrice}
                          </p>
                          {negotiatePrice !== basePrice && (
                            <p className="text-xs mt-1" style={{ color: negotiatePrice > basePrice ? '#10b981' : '#f59e0b' }}>
                              {negotiatePrice > basePrice ? `+₹${negotiatePrice - basePrice}` : `-₹${basePrice - negotiatePrice}`}
                            </p>
                          )}
                        </div>

                        <button
                          onClick={() => setNegotiatePrice(Math.max(0, negotiatePrice - 100))}
                          className="w-12 h-12 rounded-xl border-2 border-purple-400/40 bg-purple-500/20 flex items-center justify-center hover:bg-purple-500/30 transition"
                          style={{ color: '#ffffff' }}
                        >
                          <span className="text-2xl font-bold">−</span>
                        </button>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 pt-2">
                        <button
                          onClick={handleNegotiate}
                          disabled={negotiatePrice === basePrice || sendMessageMutation.isPending}
                          className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-500 to-purple-400 text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          Send Negotiation
                        </button>
                        <button
                          onClick={() => {
                            setShowNegotiate(false);
                            setNegotiatePrice(basePrice);
                          }}
                          className="px-4 py-2.5 rounded-lg border border-white/20 bg-white/5 text-white text-sm font-semibold hover:bg-white/10 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                  <div className="flex items-center gap-3">
                    <input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type a message..."
                      style={{ backgroundColor: '#030711', color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.1)' }}
                      className="flex-1 rounded-xl border px-4 py-3 focus:outline-none focus:border-purple-400"
                    />
                    <button
                      type="submit"
                      disabled={!message.trim() || sendMessageMutation.isPending}
                      className="rounded-xl bg-gradient-to-r from-purple-500 to-purple-400 p-3 text-white shadow-lg shadow-purple-900/40 transition hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="h-16 w-16 opacity-30 mx-auto mb-4" style={{ color: '#ffffff' }} />
                  <p style={{ color: '#ffffff' }} className="text-lg font-semibold mb-2">No chat selected</p>
                  <p className="opacity-60 mb-4" style={{ color: '#ffffff' }}>Select a provider to start chatting</p>
                  <button
                    onClick={() => setShowProviderList(true)}
                    className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-purple-400 text-white font-semibold shadow-lg shadow-purple-900/40 transition hover:scale-105"
                  >
                    Start New Chat
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur">
          <div style={{ backgroundColor: '#000000', borderColor: 'rgba(255, 255, 255, 0.1)' }} className="rounded-2xl border p-6 shadow-2xl max-w-md w-full mx-4">
            <h3 style={{ color: '#ffffff' }} className="text-xl font-bold mb-4">Delete Chat?</h3>
            <p className="opacity-70 mb-6" style={{ color: '#ffffff' }}>This will permanently delete this conversation. This action cannot be undone.</p>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDeleteChat}
                disabled={deleteChatMutation.isPending}
                className="flex-1 px-4 py-2 rounded-lg bg-rose-500 text-white font-semibold disabled:opacity-50"
              >
                {deleteChatMutation.isPending ? "Deleting..." : "Delete"}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-white/20 bg-white/5 text-white font-semibold hover:bg-white/10 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ChatPage;
