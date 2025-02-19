import { Button } from "@/components/ui/button";
import { Calendar, Users, Map } from "lucide-react";
import Image from "next/image";

export default function LandingPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <main className="flex-1">
                {/* Hero Section */}
                <section className="container px-4 py-12 md:py-24 lg:py-32">
                    <div className="mx-auto max-w-[980px] text-center">
                        <div className="mb-4 inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                            ✨ Your next adventure awaits
                        </div>
                        <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                            Plan trips together,{" "}
                            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                                effortlessly
                            </span>
                        </h1>
                        <p className="mb-8 text-xl text-muted-foreground sm:text-2xl">
                            Collaborate with friends and family to create the
                            perfect itinerary. Share ideas, coordinate plans,
                            and make memories together.
                        </p>
                        <Button size="lg" className="text-base">
                            Start Planning
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="ml-2 h-4 w-4"
                            >
                                <line x1="5" y1="12" x2="19" y2="12" />
                                <polyline points="12 5 19 12 12 19" />
                            </svg>
                        </Button>
                    </div>
                </section>

                {/* Features Section */}
                <section className="container px-4 py-12 md:py-24 lg:py-32">
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        <div className="group relative rounded-lg border p-6 hover:shadow-lg transition-all">
                            <Calendar className="mb-5 h-10 w-10 text-primary" />
                            <h3 className="mb-2 text-xl font-bold">
                                Smart Scheduling
                            </h3>
                            <p className="text-muted-foreground">
                                Automatically organize your itinerary with
                                intelligent scheduling suggestions.
                            </p>
                        </div>
                        <div className="group relative rounded-lg border p-6 hover:shadow-lg transition-all">
                            <Users className="mb-5 h-10 w-10 text-primary" />
                            <h3 className="mb-2 text-xl font-bold">
                                Real-time Collaboration
                            </h3>
                            <p className="text-muted-foreground">
                                Work together with your travel companions in
                                real-time to plan the perfect trip.
                            </p>
                        </div>
                        <div className="group relative rounded-lg border p-6 hover:shadow-lg transition-all lg:col-span-1 md:col-span-2 lg:col-span-1">
                            <Map className="mb-5 h-10 w-10 text-primary" />
                            <h3 className="mb-2 text-xl font-bold">
                                Interactive Maps
                            </h3>
                            <p className="text-muted-foreground">
                                Visualize your journey with interactive maps and
                                location suggestions.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Testimonials Section */}
                <section className="bg-muted/50 py-12 md:py-24 lg:py-32">
                    <div className="container px-4">
                        <h2 className="mb-12 text-center text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                            Loved by travelers worldwide
                        </h2>
                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="rounded-lg bg-background p-6 shadow-sm"
                                >
                                    <div className="flex mb-4">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <svg
                                                key={star}
                                                className="h-5 w-5 fill-primary"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                    </div>
                                    <p className="mb-4 text-muted-foreground">
                                        &quot;TravelSync made planning our group trip
                                        so much easier. Everyone could
                                        contribute ideas and we stayed organized
                                        throughout.&quot;
                                    </p>
                                    <div className="flex items-center">
                                        <Image
                                            src="/globe.svg"
                                            alt="User"
                                            width={40}
                                            height={40}
                                            className="mr-3 h-10 w-10 rounded-full"
                                        />
                                        <div>
                                            <p className="font-semibold">
                                                Sarah Johnson
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Travel Enthusiast
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="container px-4 py-12 md:py-24 lg:py-32">
                    <div className="mx-auto max-w-[800px] text-center">
                        <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                            Ready to start planning your next adventure?
                        </h2>
                        <p className="mb-8 text-xl text-muted-foreground">
                            Join thousands of travelers who are already using
                            TravelSync to plan and organize their trips. Start
                            for free today!
                        </p>
                        <Button size="lg" className="text-base">
                            Get Started for Free
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="ml-2 h-4 w-4"
                            >
                                <line x1="5" y1="12" x2="19" y2="12" />
                                <polyline points="12 5 19 12 12 19" />
                            </svg>
                        </Button>
                    </div>
                </section>
            </main>
        </div>
    );
}
