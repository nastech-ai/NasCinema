import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendMagicLink } from "@/lib/auth-client";
import { ArrowRight, Mail } from "lucide-react";
import { NeuralNetworkBackground } from "@/components/neural-network-client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devLink, setDevLink] = useState<string | null>(null);
  const [, navigate] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError(null);

    const result = await sendMagicLink(email);

    if (!result.ok) {
      setError(result.error || "Failed to send magic link");
      setLoading(false);
      return;
    }

    if (result.devLink) {
      setDevLink(result.devLink as string);
      setLoading(false);
      return;
    }

    navigate("/login/verify");
  };

  return (
    <div className="relative min-h-screen overflow-hidden pt-12">
      <div className="absolute inset-0 z-0">
        <div className="w-screen h-screen flex flex-col relative opacity-30">
          <NeuralNetworkBackground />
        </div>
      </div>
      <div className="relative z-20 my-16 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-4">
            <Link href="/" className="inline-block">
              <img src="/logo.svg" alt="NyumatFlix Logo" width={80} height={80} className="mx-auto" />
            </Link>
            <div>
              <h1 className="text-3xl font-light text-foreground">Welcome to NyumatFlix</h1>
              <p className="text-muted-foreground mt-2 font-light">Movies and TV Shows for everyone</p>
            </div>
          </div>

          {devLink && (
            <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4 text-center">
              <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-2 font-medium">Dev Mode: Magic Link Ready</p>
              <a href={devLink} className="text-primary underline text-sm break-all">Click here to sign in</a>
            </div>
          )}

          <div className="relative">
            <Card className="bg-card/80 backdrop-blur-md border-border/50 shadow-2xl">
              <CardHeader className="space-y-1 text-center pb-0">
                <CardTitle className="text-xl font-medium text-foreground">Sign in to NyumatFlix</CardTitle>
                <CardDescription className="text-muted-foreground font-light">Enter your email to get started</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-foreground">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <Button type="submit" size="lg" variant="default" disabled={loading} className="w-full">
                    <Mail className="w-4 h-4 mr-2" />
                    {loading ? "Sending..." : "Continue with Email"}
                    {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
                  </Button>
                </form>
                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground font-light">We'll send you a magic link to sign in!</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground font-light">
              By continuing, you agree to our{" "}
              <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
