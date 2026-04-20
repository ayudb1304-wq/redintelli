import Link from "next/link";

function LogoSvg({ size = 20 }: { size?: number }) {
  return (
    <svg viewBox="0 0 28 28" width={size} height={size}>
      <circle cx="14" cy="14" r="12" fill="none" stroke="currentColor" strokeWidth="1.25" />
      <circle cx="14" cy="14" r="4.5" fill="currentColor" />
      <circle cx="23" cy="8" r="2.2" fill="oklch(0.88 0.2 125)" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-svh">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/88 backdrop-blur-md backdrop-saturate-110">
        <div className="mx-auto flex h-[68px] max-w-[1200px] items-center justify-between px-8">
          <Link href="/" className="inline-flex items-center gap-2.5 font-semibold tracking-tight">
            <LogoSvg />
            <span>RedIntelli</span>
          </Link>
          <nav className="hidden items-center gap-7 md:flex">
            <Link href="/alternatives/gummysearch" className="text-sm text-muted-foreground hover:text-foreground">vs GummySearch</Link>
            <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground">Pricing</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="px-2.5 py-2 text-sm text-muted-foreground hover:text-foreground">
              Log in
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-transform hover:-translate-y-px hover:bg-foreground/90"
            >
              Start free<span>&rarr;</span>
            </Link>
          </div>
        </div>
      </header>
      {children}
      <footer className="border-t bg-secondary/50 py-16">
        <div className="mx-auto max-w-[1200px] px-8">
          <div className="grid gap-12 md:grid-cols-[1.4fr_2fr]">
            <div>
              <Link href="/" className="inline-flex items-center gap-2.5 text-lg font-semibold">
                <LogoSvg />
                <span>RedIntelli</span>
              </Link>
              <p className="mt-3 max-w-[30ch] text-sm text-muted-foreground">
                Reddit audience intelligence for operators who&rsquo;d rather ship than scrape.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="mb-2.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">product</p>
                <div className="flex flex-col gap-1.5">
                  <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground">Pricing</Link>
                  <Link href="/sample/entrepreneur" className="text-sm text-muted-foreground hover:text-foreground">Sample Brief</Link>
                  <Link href="/signup" className="text-sm text-muted-foreground hover:text-foreground">Sign Up</Link>
                  <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">Log In</Link>
                </div>
              </div>
              <div>
                <p className="mb-2.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">alternatives</p>
                <div className="flex flex-col gap-1.5">
                  <Link href="/alternatives/gummysearch" className="text-sm text-muted-foreground hover:text-foreground">vs GummySearch</Link>
                  <Link href="/alternatives/redreach" className="text-sm text-muted-foreground hover:text-foreground">vs Redreach</Link>
                  <Link href="/alternatives/brand24" className="text-sm text-muted-foreground hover:text-foreground">vs Brand24</Link>
                  <Link href="/alternatives/syften" className="text-sm text-muted-foreground hover:text-foreground">vs Syften</Link>
                  <Link href="/alternatives/f5bot" className="text-sm text-muted-foreground hover:text-foreground">vs F5Bot</Link>
                </div>
              </div>
              <div>
                <p className="mb-2.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">subreddits</p>
                <div className="flex flex-col gap-1.5">
                  <Link href="/subreddits/entrepreneur" className="text-sm text-muted-foreground hover:text-foreground">r/entrepreneur</Link>
                  <Link href="/subreddits/saas" className="text-sm text-muted-foreground hover:text-foreground">r/saas</Link>
                  <Link href="/subreddits/startups" className="text-sm text-muted-foreground hover:text-foreground">r/startups</Link>
                  <Link href="/subreddits/indiehackers" className="text-sm text-muted-foreground hover:text-foreground">r/indiehackers</Link>
                  <Link href="/subreddits/marketing" className="text-sm text-muted-foreground hover:text-foreground">r/marketing</Link>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-10 flex flex-col gap-4 border-t pt-8 font-mono text-[11px] tracking-wider text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <span>&copy; {new Date().getFullYear()} RedIntelli</span>
            <span>Made for people who read the whole thread.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
