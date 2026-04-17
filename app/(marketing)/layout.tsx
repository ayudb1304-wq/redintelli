import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-svh">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            RedIntelli
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
              <Link href="/alternatives/gummysearch">GummySearch Alternative</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
              <Link href="/pricing">Pricing</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/signup">Get your first brief free</Link>
            </Button>
          </div>
        </div>
      </header>
      {children}
      <footer className="border-t py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-8 sm:grid-cols-4">
            <div>
              <p className="font-semibold">RedIntelli</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Reddit audience intelligence for founders.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold">Product</p>
              <div className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
                <Link href="/pricing" className="hover:text-foreground">Pricing</Link>
                <Link href="/sample/entrepreneur" className="hover:text-foreground">Sample Brief</Link>
                <Link href="/signup" className="hover:text-foreground">Sign Up</Link>
                <Link href="/login" className="hover:text-foreground">Log In</Link>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold">Alternatives</p>
              <div className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
                <Link href="/alternatives/gummysearch" className="hover:text-foreground">vs GummySearch</Link>
                <Link href="/alternatives/redreach" className="hover:text-foreground">vs Redreach</Link>
                <Link href="/alternatives/brand24" className="hover:text-foreground">vs Brand24</Link>
                <Link href="/alternatives/syften" className="hover:text-foreground">vs Syften</Link>
                <Link href="/alternatives/f5bot" className="hover:text-foreground">vs F5Bot</Link>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold">Subreddits</p>
              <div className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
                <Link href="/subreddits/entrepreneur" className="hover:text-foreground">r/entrepreneur</Link>
                <Link href="/subreddits/saas" className="hover:text-foreground">r/saas</Link>
                <Link href="/subreddits/startups" className="hover:text-foreground">r/startups</Link>
                <Link href="/subreddits/indiehackers" className="hover:text-foreground">r/indiehackers</Link>
                <Link href="/subreddits/marketing" className="hover:text-foreground">r/marketing</Link>
              </div>
            </div>
          </div>
          <div className="mt-10 flex flex-col gap-4 border-t pt-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>&copy; {new Date().getFullYear()} RedIntelli</p>
            <div className="flex gap-6">
              <Link href="/" className="hover:text-foreground">Home</Link>
              <Link href="/pricing" className="hover:text-foreground">Pricing</Link>
              <Link href="/alternatives/gummysearch" className="hover:text-foreground">Alternatives</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
