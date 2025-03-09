"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage, Itinerary } from "@/lib/types";
import { io } from "socket.io-client";
import { toast } from "sonner";
import { MessageCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NEXT_PUBLIC_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

/* eslint-disable */
export function ChatBox({
  itinerary,
  chatMessages,
  userId,
}: {
  readonly itinerary: Readonly<Itinerary>;
  chatMessages: ChatMessage[] | undefined;
  userId: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(chatMessages ?? []);
  const [newMessage, setNewMessage] = useState("");
  const [roomId, setRoomId] = useState<number>(itinerary.id);
  const [socket, setSocket] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [chatboxY, setChatboxY] = useState(0); // Default chatbox position
  const parentRef = useRef<HTMLDivElement | null>(null);
  const [isConnectionActive, setIsConnectionActive] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isChatBoxOpen, setIsChatBoxOpen] = useState<boolean>(false);
  const [newMessageCount, setNewMessageCount] = useState<number>(0);

  // Socket
  useEffect(() => {
    if (typeof window !== "undefined") {
      const newSocket = io(`${NEXT_PUBLIC_BACKEND_URL}`, {
        reconnection: true, // Enable automatic reconnection
        reconnectionAttempts: 5, // Number of tries before giving up
        reconnectionDelay: 2000, // Time (ms) between attempts
      });

      setSocket(newSocket);

      // Handle connection established
      newSocket.on("connect", () => {
        // console.log("Connected to WebSocket server");
        newSocket.emit("joinRoom", roomId); // Join room after connection
        setIsConnectionActive(true);
      });

      // Listen for incoming messages from the server
      newSocket.on("receiveMessage", (data: ChatMessage | null) => {
        if (data) {
          setMessages((prevMessages) => [...prevMessages, data]);
          if (
            data.chat_message_by_id.toString() !== userId.toString() &&
            !isChatBoxOpen
          ) {
            setNewMessageCount((prevCount) => {
              const updatedCount = prevCount + 1;
              return updatedCount;
            });
          }
        } else {
          toast.error("There was an error when sending your message.");
        }
      });

      newSocket.on("disconnect", () => {
        // toast.error("Connection lost. Reconnecting...");
        setIsConnectionActive(false);
        // Handle reconnection attempt
      });

      newSocket.io.on("reconnect_failed", () => {
        // toast.error("Connection lost. Please refresh the page.");
      });

      // Cleanup when the component unmounts
      return () => {
        newSocket.disconnect();
      };
    }
  }, []);

  // Update chatbox position on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (!parentRef.current) return;

      const parentTop = parentRef.current.getBoundingClientRect().top;
      const offset = 60; // Adjust this value for spacing

      // Keeps the chatbox pinned to the parent div but moves with scroll
      setChatboxY(Math.max(offset, -parentTop + offset));
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Small screen detector
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    // return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Smooth chat scroll down on new chat message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [messages]);

  // Instant chat scroll down on resolution change and chat box open/close
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        block: "nearest",
      });
    }
  }, [isMobile, isChatBoxOpen]);

  // Reset new message count on chatbox open
  useEffect(() => {
    if (isChatBoxOpen) {
      setNewMessageCount(0);
    }
  }, [isChatBoxOpen]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim()) return;
    socket.emit("sendMessage", roomId, userId, newMessage);
    setNewMessage("");
  }

  const groupedMessages = useMemo(() => {
    return messages.reduce((acc, message) => {
      const msgDate = new Date(message.created_at);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      let dateLabel =
        msgDate.toDateString() === today.toDateString()
          ? "Today"
          : msgDate.toDateString() === yesterday.toDateString()
          ? "Yesterday"
          : msgDate.toLocaleDateString("en-GB");

      acc[dateLabel] = acc[dateLabel] || [];
      acc[dateLabel].push(message);
      return acc;
    }, {} as Record<string, typeof messages>);
  }, [messages]);

  return (
    <>
      {!isMobile ? (
        <div ref={parentRef} className="relative">
          <Card
            className={`absolute transition-all duration-300 ease-in-outs`}
            style={{ top: `${chatboxY}px` }}
          >
            <CardHeader>
              <CardTitle>Group Chat</CardTitle>
            </CardHeader>
            <CardContent className="h-80 max-h-80 flex flex-col">
              <ScrollArea className="max-h-80 flex-1 pr-4" type="always">
                <div className="space-y-4 pt-1">
                  {Object.entries(groupedMessages).map(([date, msgs]) => (
                    <div key={date}>
                      {/* Date separator */}
                      <div className="text-center text-xs text-muted-foreground py-2">
                        {date}
                      </div>

                      {/* Render messages for that date */}
                      {msgs.map((message) => (
                        <div
                          key={message.id}
                          className="flex flex-col space-y-1 text-sm"
                        >
                          <div
                            className={`flex items-center gap-2 ${
                              message.chat_message_by_id.toString() ===
                              userId.toString()
                                ? "justify-end"
                                : ""
                            }`}
                          >
                            <span className="font-medium">
                              {message.chat_message_by.username}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(
                                message.created_at
                              ).toLocaleTimeString()}
                            </span>
                          </div>
                          <p
                            className={`text-muted-foreground ${
                              message.chat_message_by_id.toString() ===
                              userId.toString()
                                ? "text-right"
                                : ""
                            }`}
                          >
                            {message.chat_message}
                          </p>
                        </div>
                      ))}
                    </div>
                  ))}
                  {/* Auto scroll marker */}
                  <div ref={messagesEndRef}></div>
                </div>
              </ScrollArea>
              <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
                <Input
                  placeholder={
                    isConnectionActive ? "Type a message..." : "Connecting..."
                  }
                  value={newMessage}
                  disabled={!isConnectionActive}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <Button type="submit" disabled={!isConnectionActive}>
                  Send
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          <button
            className="fixed bottom-5 right-5 bg-blue-500 text-white p-3 rounded-full shadow-md"
            onClick={() => setIsChatBoxOpen(true)}
          >
            <MessageCircle size={24} />
            {newMessageCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {newMessageCount}
              </span>
            )}
          </button>
          {isChatBoxOpen && (
            <div
              className={cn(
                "fixed bottom-5 right-5 w-80 h-96 bg-white shadow-xl rounded-lg flex flex-col transition-all duration-300 ease-in-out",
                isChatBoxOpen
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              )}
              style={{
                transition:
                  "opacity 0.3s ease-in-out, transform 0.3s ease-in-out",
              }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>
                    <div className="flex justify-between items-center rounded-t-lg">
                      <h2 className="text-sm font-semibold">Chat</h2>
                      <button
                        onClick={() => setIsChatBoxOpen(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-80 max-h-80 flex flex-col">
                  <ScrollArea className="max-h-80 flex-1 pr-4" type="always">
                    <div className="space-y-4 pt-1y">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className="flex flex-col space-y-1 text-sm"
                        >
                          <div
                            className={`flex items-center gap-2 ${
                              message.chat_message_by_id.toString() ===
                              userId.toString()
                                ? "justify-end"
                                : ""
                            }`}
                          >
                            <span className="font-medium">
                              {message.chat_message_by.username}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(
                                message.created_at
                              ).toLocaleTimeString()}
                            </span>
                          </div>
                          <p
                            className={`text-muted-foreground ${
                              message.chat_message_by_id.toString() ===
                              userId.toString()
                                ? "text-right"
                                : ""
                            }`}
                          >
                            {message.chat_message}
                          </p>
                        </div>
                      ))}
                      {/* Auto scroll marker */}
                      <div ref={messagesEndRef}></div>
                    </div>
                  </ScrollArea>
                  <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
                    <Input
                      placeholder={
                        isConnectionActive
                          ? "Type a message..."
                          : "Connecting..."
                      }
                      value={newMessage}
                      disabled={!isConnectionActive}
                      onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <Button type="submit" disabled={!isConnectionActive}>
                      Send
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </>
  );
}
