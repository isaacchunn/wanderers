import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import {
    Calendar,
    Users,
    Map,
    Bell,
    CheckCircle2,
    ArrowRight,
    Star,
} from "lucide-react";
import { LandPlot } from "lucide-react";

export default function LandingPage() {
    return (
        <div className="flex flex-col h-screen items-center">
            <SiteHeader />
            {/* Hero Section */}
            <section className="container flex flex-col items-center justify-center gap-4 py-24 text-center md:py-32">
                <div className="space-y-4">
                    <Badge
                        className="h-6 rounded-full px-3 text-sm"
                        variant="secondary"
                    >
                        ✨ Your next adventure awaits
                    </Badge>
                    <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                        Plan trips together,{" "}
                        <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                            effortlessly
                        </span>
                    </h1>
                    <p className="mx-auto max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
                        Collaborate with friends and family to create the
                        perfect itinerary. Share ideas, coordinate plans, and
                        make memories together.
                    </p>
                </div>
                <div className="flex gap-4">
                    <Button size="lg">
                        Start Planning
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    {/* <Button variant="outline" size="lg">
                        Watch Demo
                    </Button> */}
                </div>
                <div className="mt-12 w-full overflow-hidden rounded-lg border bg-gradient-to-b from-background/10 to-background/50 shadow-xl">
                    <Image
                        src="/placeholder.svg?height=600&width=1200"
                        width={1200}
                        height={600}
                        alt="App screenshot"
                        className="w-full"
                    />
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="container py-24">
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                <Calendar className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold">
                                Smart Scheduling
                            </h3>
                            <p className="text-muted-foreground">
                                Automatically organize your itinerary with
                                intelligent scheduling suggestions.
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                <Users className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold">
                                Real-time Collaboration
                            </h3>
                            <p className="text-muted-foreground">
                                Work together with your travel companions in
                                real-time to plan the perfect trip.
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                <Map className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold">
                                Interactive Maps
                            </h3>
                            <p className="text-muted-foreground">
                                Visualize your journey with interactive maps and
                                location suggestions.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Testimonials Section */}
            <section id="testimonials" className="border-t bg-muted/50">
                <div className="container py-24">
                    <h2 className="mb-12 text-center text-3xl font-bold tracking-tight">
                        Loved by travelers worldwide
                    </h2>
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <Card key={i}>
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-1 text-yellow-500">
                                        {Array(5)
                                            .fill(0)
                                            .map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className="h-4 w-4 fill-current"
                                                />
                                            ))}
                                    </div>
                                    <blockquote className="mt-4">
                                        "TravelSync made planning our group trip
                                        so much easier. Everyone could
                                        contribute ideas and we stayed organized
                                        throughout."
                                    </blockquote>
                                    <div className="mt-4 flex items-center gap-3">
                                        <Image
                                            src="/placeholder.svg?height=40&width=40"
                                            width={40}
                                            height={40}
                                            alt="User avatar"
                                            className="rounded-full"
                                        />
                                        <div>
                                            <div className="font-semibold">
                                                Sarah Johnson
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                Travel Enthusiast
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="border-t">
                <div className="container py-24 text-center">
                    <h2 className="mb-4 text-3xl font-bold tracking-tight">
                        Ready to start planning your next adventure?
                    </h2>
                    <p className="mx-auto mb-8 max-w-[42rem] text-muted-foreground">
                        Join thousands of travelers who are already using
                        TravelSync to plan and organize their trips. Start for
                        free today!
                    </p>
                    <div className="flex justify-center gap-4">
                        <Button size="lg">
                            Get Started for Free
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                        {/* <Button variant="outline" size="lg">
                            Contact Sales
                        </Button> */}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t py-12">
                <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
                    <div className="flex items-center gap-2">
                        <LandPlot className="h-6 w-6" />
                        <span className="text-xl font-bold">Wanderers</span>
                    </div>
                    <p className="text-center text-sm text-muted-foreground">
                        © {new Date().getFullYear()} Wanderers. All rights
                        reserved.
                    </p>
                    <div className="flex gap-4">
                        <Button variant="ghost" size="sm">
                            Privacy
                        </Button>
                        <Button variant="ghost" size="sm">
                            Terms
                        </Button>
                    </div>
                </div>
            </footer>
        </div>
    );
}
