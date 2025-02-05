import { Button } from "@/components/ui/button";
import {
    MessageSquare,
    Share2,
    FileText,
    ImageIcon,
    Users,
} from "lucide-react";

export default function DiscussionPage() {
    return (
        <div className="flex min-h-screen flex-col">
            {/* Hero Section */}
            <section className="container px-4 py-12 md:py-24 lg:py-32">
                <div className="mx-auto max-w-[980px] text-center">
                    <div className="mb-4 inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                        ✨ Team Communication
                    </div>
                    <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                        Stay connected with{" "}
                        <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                            discussion rooms
                        </span>
                    </h1>
                    <p className="mb-8 text-xl text-muted-foreground sm:text-2xl">
                        Collaborate seamlessly with your travel companions in
                        real-time chat rooms.
                    </p>
                    <Button size="lg" className="text-base">
                        Create Discussion Room
                        <MessageSquare className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </section>

            {/* Chat Preview Section */}
            <section className="container px-4 py-12 md:py-24 lg:py-32">
                <div className="grid gap-12 lg:grid-cols-2">
                    {/* Chat Interface Preview */}
                    <div className="rounded-lg border bg-background p-6">
                        <div className="mb-6 flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map((i) => (
                                        <div
                                            key={i}
                                            className="h-8 w-8 rounded-full border-2 border-background bg-muted"
                                        />
                                    ))}
                                </div>
                                <div>
                                    <h3 className="font-semibold">
                                        Tokyo Trip 2024
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        3 members
                                    </p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm">
                                <Share2 className="mr-2 h-4 w-4" />
                                Invite
                            </Button>
                        </div>
                        <div className="space-y-4">
                            {[
                                {
                                    user: "Alice",
                                    message:
                                        "How about we visit Shibuya on day 1?",
                                },
                                {
                                    user: "Bob",
                                    message:
                                        "Sounds good! We can go to Harajuku after.",
                                },
                                {
                                    user: "Charlie",
                                    message:
                                        "I found a great ramen place nearby!",
                                },
                            ].map((chat, i) => (
                                <div
                                    key={i}
                                    className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-lg ${i % 2 === 0 ? "bg-muted" : "bg-primary text-primary-foreground"} p-3`}
                                    >
                                        <p className="text-sm font-medium">
                                            {chat.user}
                                        </p>
                                        <p className="text-sm">
                                            {chat.message}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <h2 className="text-3xl font-bold tracking-tight">
                                Real-time Communication
                            </h2>
                            <p className="text-lg text-muted-foreground">
                                Keep everyone in the loop with instant messaging
                                and file sharing capabilities.
                            </p>
                        </div>
                        <div className="grid gap-6">
                            {[
                                {
                                    icon: MessageSquare,
                                    title: "Instant Messaging",
                                    description:
                                        "Chat in real-time with all your travel companions.",
                                },
                                {
                                    icon: FileText,
                                    title: "File Sharing",
                                    description:
                                        "Share important documents, tickets, and reservations.",
                                },
                                {
                                    icon: ImageIcon,
                                    title: "Media Sharing",
                                    description:
                                        "Share photos and videos of potential destinations.",
                                },
                            ].map((feature) => (
                                <div
                                    key={feature.title}
                                    className="flex items-start space-x-4 rounded-lg border p-6"
                                >
                                    <feature.icon className="h-6 w-6 text-primary" />
                                    <div>
                                        <h3 className="mb-2 font-semibold">
                                            {feature.title}
                                        </h3>
                                        <p className="text-muted-foreground">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-muted/50 py-12 md:py-24 lg:py-32">
                <div className="container px-4">
                    <div className="mx-auto max-w-[800px] text-center">
                        <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                            Better communication, better trips
                        </h2>
                        <p className="mb-8 text-xl text-muted-foreground">
                            Keep everyone on the same page with our discussion
                            rooms.
                        </p>
                        <Button size="lg" className="text-base">
                            Try It Free
                            <Users className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}
