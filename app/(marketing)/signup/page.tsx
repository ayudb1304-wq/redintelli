import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function SignupPage() {
  return (
    <div className="flex min-h-[calc(100svh-4rem)] flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </Link>
        </Button>
        <SignupForm />
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium underline underline-offset-4 hover:text-foreground">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
