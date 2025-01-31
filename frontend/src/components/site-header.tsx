import { Button } from "@/components/ui/button";
import { LandPlot } from "lucide-react";

export function SiteHeader() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ">
            <div className="container flex h-16 items-center mx-auto">
                <div className="flex items-center space-x-2">
                    <LandPlot className="h-6 w-6" />
                    <span className="text-xl font-bold">Wanderers</span>
                </div>
                <nav className="flex flex-1 items-center justify-center space-x-6 text-sm font-bold">
                    <a href="/" className="transition hover:text-foreground/80">
                        Home
                    </a>
                    <a
                        href="#testimonials"
                        className="transition hover:text-foreground/80"
                    >
                        Testimonials
                    </a>
                    <a
                        href="#explore"
                        className="transition hover:text-foreground/80"
                    >
                        Explore
                    </a>
                    <a
                        href="#contact"
                        className="transition hover:text-foreground/80"
                    >
                        Contact
                    </a>
                </nav>
                <div className="flex items-center space-x-2 rounded-full">
                    <Button variant="ghost" size="sm">
                        Log in
                    </Button>
                    <Button size="sm">Sign Up</Button>
                </div>
            </div>
        </header>
    );
}
