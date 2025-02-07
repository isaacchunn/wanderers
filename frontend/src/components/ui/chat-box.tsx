"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { saveMessage } from "../../app/itinerary/actions";

interface Message {
    id: string;
    content: string;
    sender: string;
    timestamp: string;
}

const initialState = null;

export function ChatBox() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    // const [state, formAction] = useFormState(saveMessage, initialState);

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
        <Card className="h-96 w-96 flex flex-col p-0">
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
