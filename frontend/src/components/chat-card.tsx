import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "@/lib/types";
import { X } from "lucide-react";

interface ChatCardProps {
  groupedMessages: Record<string, ChatMessage[]>;
  userId: string;
  isConnectionActive: boolean;
  newMessage: string;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  isMobile: boolean;
  chatboxY: number;
  handleSubmit: (e: React.FormEvent) => void;
  setNewMessage: (message: string) => void;
  setIsChatBoxOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChatCard: React.FC<ChatCardProps> = ({
  groupedMessages,
  userId,
  isConnectionActive,
  newMessage,
  messagesEndRef,
  isMobile,
  chatboxY,
  handleSubmit,
  setNewMessage,
  setIsChatBoxOpen,
}) => {
  return (
    <Card
      className={`absolute transition-all duration-300 ease-in-outs`}
      style={isMobile ? {} : { top: chatboxY }}
    >
      <CardHeader>
        {isMobile ? (
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
        ) : (
          <CardTitle>Chat</CardTitle>
        )}
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
                        {new Date(message.created_at).toLocaleTimeString()}
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
  );
};

export default ChatCard;
