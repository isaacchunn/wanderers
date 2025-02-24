import { useState } from "react";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

interface EmailProps {
    onEmailChange: (emails: string[]) => void;
}
export function EmailInput({ onEmailChange }: Readonly<EmailProps>) {
    const [input, setInput] = useState("");
    const [emails, setEmails] = useState<string[]>([]);

    const isValidEmail = (email: string) => {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(email);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && input.trim()) {
            e.preventDefault();
            if (isValidEmail(input.trim())) {
                setEmails([...emails, input.trim()]);
                onEmailChange([...emails, input.trim()]);
                setInput("");
            } else {
                alert("Please enter a valid email address");
            }
        } else if (e.key === "Backspace" && input === "" && emails.length > 0) {
            e.preventDefault();
            const newEmails = [...emails];
            newEmails.pop();
            setEmails(newEmails);
        }
    };

    const removeEmail = (emailToRemove: string) => {
        setEmails(emails.filter((email) => email !== emailToRemove));
    };
    return (
        <div className="flex flex-wrap items-center gap-2 p-2 border rounded">
            {emails.map((email) => (
                <div
                    key={email}
                    className="flex items-center bg-gray-200 text-gray-700 px-2 py-1 rounded-full"
                >
                    <span>{email}</span>
                    <button
                        onClick={() => removeEmail(email)}
                        className="ml-1 text-gray-500 hover:text-gray-700"
                    >
                        <X size={14} />
                    </button>
                </div>
            ))}
            <Input
                type="text"
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
                placeholder="Add collaborator email and press Enter"
                className="flex-grow border-none focus:ring-0"
            />
        </div>
    );
}
