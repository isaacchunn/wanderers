import Link from "next/link"
import Image from "next/image"

export function SiteFooter() {
    return (
        <footer className="border-t">
            <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
                <div className="flex items-center gap-4">
                    <Image
                        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-UxlfakJsdGghf1pf35POgCUZvdShQZ.png"
                        alt="Wanderers Logo"
                        width={32}
                        height={32}
                        className="h-6 w-6"
                    />
                    <p className="text-sm text-muted-foreground">© 2025 Wanderers. All rights reserved.</p>
                </div>
                <nav className="flex gap-4 text-sm font-medium">
                    <Link href="/privacy" className="text-muted-foreground hover:underline underline-offset-4">
                        Privacy
                    </Link>
                    <Link href="/terms" className="text-muted-foreground hover:underline underline-offset-4">
                        Terms
                    </Link>
                </nav>
            </div>
        </footer>
    )
}