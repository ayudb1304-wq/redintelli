import { DiscoverView } from "@/components/discover/discover-view";

export default function DiscoverPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Discover Subreddits</h1>
        <p className="mt-1 text-muted-foreground">
          Describe your product and we&apos;ll find the most relevant Reddit
          communities for your audience.
        </p>
      </div>
      <DiscoverView />
    </div>
  );
}
