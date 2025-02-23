import { useState } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface VisibilityProps {
    onVisibilityChange: (visibility: "private" | "public") => void;
}

export function VisibilitySelector({ onVisibilityChange }: VisibilityProps) {
    const [visibility, setVisibility] = useState<"private" | "public">(
        "private"
    );

    const handleVisibilityChange = (value: "public" | "private") => {
        setVisibility(value);
        onVisibilityChange(value);
    };

    return (
        <div className="flex flex-col gap-3">
            <label className="font-medium text-sm text-black">
                Choose &apos;Public&apos; to share your plan with the world!
            </label>
            <RadioGroup
                value={visibility}
                onValueChange={(value: "public" | "private") =>
                    handleVisibilityChange(value)
                }
                className="flex gap-4"
            >
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="private" id="private" />
                    <Label htmlFor="private" className="cursor-pointer">
                        Private
                    </Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="public" id="public" />
                    <Label htmlFor="public" className="cursor-pointer">
                        Public
                    </Label>
                </div>
            </RadioGroup>
        </div>
    );
}
