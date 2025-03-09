import { useState } from "react";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { checkEmail } from "@/lib/settingsHandler";
import { toast } from "sonner";

interface ErrorResponse {
    message: string;
}

interface EmailProps {
    onEmailChange: (emails: string[]) => void;
}

export function EmailInput({ onEmailChange }: Readonly<EmailProps>) {
    const [input, setInput] = useState("");
    const [emails, setEmails] = useState<string[]>([]);
    const [isChecking, setIsChecking] = useState(false); // To handle the loading state while checking email

    const isValidEmail = (email: string) => {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(email);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    const handleInputKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && input.trim()) {
            e.preventDefault();
            const email = input.trim();

            // Check if the email is valid
            if (!isValidEmail(email)) {
                toast.error("Please enter a valid email address");
                return;
            }

            // Check email availability by making an API call to check if email exists
            setIsChecking(true);
            const result = await checkEmail(email);
            console.log(result);

            const errorData = result as ErrorResponse;
            if (errorData.message === "User not found") {
                toast.error("This email is not registered with Wanderers.");
            } else if (result.isCurrentUser) {
                toast.error("You cannot add yourself as a collaborator");
            } else {
                setEmails([...emails, email]);
                onEmailChange([...emails, email]);
                setInput("");
            }
            setIsChecking(false);
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
                disabled={isChecking} // Disable input while checking
            />
        </div>
    );
}