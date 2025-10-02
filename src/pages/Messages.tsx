import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Paperclip, Image, MoreVertical } from "lucide-react";

interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
}

interface Message {
  id: string;
  sender: "me" | "other";
  content: string;
  time: string;
}

const Messages = () => {
  const [selectedChat, setSelectedChat] = useState<string>("1");
  const [messageInput, setMessageInput] = useState("");

  const chats: Chat[] = [
    {
      id: "1",
      name: "Sarah Johnson",
      avatar: "/placeholder.svg",
      lastMessage: "That sounds great! When can we schedule?",
      time: "2m ago",
      unread: 2,
    },
    {
      id: "2",
      name: "Mike Photography",
      avatar: "/placeholder.svg",
      lastMessage: "I've sent the pricing details",
      time: "1h ago",
      unread: 0,
    },
    {
      id: "3",
      name: "Emma Wilson",
      avatar: "/placeholder.svg",
      lastMessage: "Thank you for the amazing work!",
      time: "3h ago",
      unread: 0,
    },
  ];

  const messages: Message[] = [
    {
      id: "1",
      sender: "other",
      content: "Hi! I'm interested in booking your photography services for next week.",
      time: "10:30 AM",
    },
    {
      id: "2",
      sender: "me",
      content: "Hello! I'd be happy to help. What type of shoot are you looking for?",
      time: "10:32 AM",
    },
    {
      id: "3",
      sender: "other",
      content: "I need professional photos for my Instagram campaign. Do you have availability?",
      time: "10:35 AM",
    },
    {
      id: "4",
      sender: "me",
      content: "Yes! I have slots available. Let me send you my pricing and we can schedule.",
      time: "10:36 AM",
    },
    {
      id: "5",
      sender: "other",
      content: "That sounds great! When can we schedule?",
      time: "10:38 AM",
    },
  ];

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      setMessageInput("");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-bold mb-6">Messages</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-16rem)]">
          {/* Chat List */}
          <div className="lg:col-span-1 border rounded-lg overflow-hidden">
            <div className="p-4 border-b bg-muted/30">
              <Input placeholder="Search conversations..." />
            </div>
            <ScrollArea className="h-full">
              <div className="divide-y">
                {chats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => setSelectedChat(chat.id)}
                    className={`w-full p-4 text-left hover:bg-accent/50 transition-colors ${
                      selectedChat === chat.id ? "bg-accent" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarImage src={chat.avatar} />
                        <AvatarFallback>{chat.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold truncate">{chat.name}</p>
                          <span className="text-xs text-muted-foreground">{chat.time}</span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                      </div>
                      {chat.unread > 0 && (
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                          {chat.unread}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Chat Window */}
          <div className="lg:col-span-2 border rounded-lg flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b flex items-center justify-between bg-muted/30">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback>SJ</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">Sarah Johnson</p>
                  <p className="text-xs text-muted-foreground">Active now</p>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "me" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.sender === "me"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.sender === "me"
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        }`}
                      >
                        {message.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t bg-muted/30">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Paperclip className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Image className="h-5 w-5" />
                </Button>
                <Input
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} size="icon">
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Messages;
