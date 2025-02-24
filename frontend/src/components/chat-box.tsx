"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { saveMessage } from "@/app/itinerary/[id]/actions";
import { Itinerary } from "@/lib/types";

interface Message {
    id: string;
    content: string;
    sender: string;
    timestamp: string;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ChatBox({ itinerary }: { itinerary: Readonly<Itinerary> }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const formData = new FormData();
        formData.append("message", newMessage);

        const result = await saveMessage(formData);
        if (result) {
            setMessages([...messages, result]);
            setNewMessage("");
        }
    }

    return (
        <Card className="h-auto w-auto flex flex-col">
            <CardHeader>
                <CardTitle>Group Chat</CardTitle>
            </CardHeader>
            <CardContent className="h-80 max-h-80 flex flex-col">
                <ScrollArea className="max-h-80 flex-1 pr-4 overflow-y-scroll scroll-m-1">
                    <div className="space-y-4 pt-1y">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className="flex flex-col space-y-1 text-sm"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">
                                        {message.sender}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(
                                            message.timestamp
                                        ).toLocaleTimeString()}
                                    </span>
                                </div>
                                <p className="text-muted-foreground">
                                    {message.content}
                                </p>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
                <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
                    <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <Button type="submit">Send</Button>
                </form>
            </CardContent>
        </Card>
    );
}
