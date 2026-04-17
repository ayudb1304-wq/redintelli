import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100svh-4rem)] flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </Link>
        </Button>
        <LoginForm />
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium underline underline-offset-4 hover:text-foreground">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
