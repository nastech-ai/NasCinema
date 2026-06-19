import { useEffect, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { verifyMagicLink } from "@/lib/auth-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function VerifyPage() {
  const searchStr = useSearch();
  const [, navigate] = useLocation();
  const [status, setStatus] = useState<"loading" | "success" | "error" | "waiting">("waiting");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(searchStr);
    const token = params.get("token");
    const devLink = params.get("devLink");

    if (devLink) {
      window.location.href = devLink;
      return;
    }

    if (!token) {
      setStatus("waiting");
      return;
    }

    setStatus("loading");
    verifyMagicLink(token).then((result) => {
      if (result.ok) {
        setStatus("success");
        setTimeout(() => navigate("/home"), 1500);
      } else {
        setStatus("error");
        setError(result.error || "Verification failed");
      }
    });
  }, [searchStr]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link href="/" className="inline-block">
            <img src="/logo.svg" alt="NyumatFlix Logo" width={60} height={60} className="mx-auto mb-4" />
          </Link>
        </div>

        <Card className="bg-card/80 backdrop-blur-md border-border/50 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-medium">
              {status === "waiting" && "Check your email"}
              {status === "loading" && "Verifying..."}
              {status === "success" && "Signed in!"}
              {status === "error" && "Verification failed"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {status === "waiting" && (
              <>
                <Mail className="w-12 h-12 mx-auto text-primary" />
                <p className="text-muted-foreground">We sent you a magic link. Check your inbox and click the link to sign in.</p>
                <p className="text-sm text-muted-foreground">The link expires in 10 minutes.</p>
              </>
            )}
            {status === "loading" && <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin" />}
            {status === "success" && (
              <>
                <CheckCircle className="w-12 h-12 mx-auto text-green-500" />
                <p className="text-muted-foreground">You're signed in! Redirecting...</p>
              </>
            )}
            {status === "error" && (
              <>
                <XCircle className="w-12 h-12 mx-auto text-destructive" />
                <p className="text-muted-foreground">{error}</p>
                <Link href="/login" className="text-primary hover:underline text-sm">Try again</Link>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Mail({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  );
}
