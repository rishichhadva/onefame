import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, User, Briefcase } from "lucide-react";
import Navbar from "@/components/Navbar";
import { cn } from "@/lib/utils";

const Signup = () => {
  const [userType, setUserType] = useState<"influencer" | "provider">("influencer");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Signup logic will be implemented with Supabase
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4 bg-gradient-hero">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-primary">
                <Sparkles className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
            <CardDescription>
              Choose your account type and get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Account Type Selection */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                type="button"
                onClick={() => setUserType("influencer")}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all",
                  userType === "influencer"
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-border hover:border-primary/50"
                )}
              >
                <User className={cn(
                  "h-6 w-6",
                  userType === "influencer" ? "text-primary" : "text-muted-foreground"
                )} />
                <span className={cn(
                  "text-sm font-medium",
                  userType === "influencer" ? "text-primary" : "text-muted-foreground"
                )}>
                  Influencer
                </span>
              </button>
              <button
                type="button"
                onClick={() => setUserType("provider")}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all",
                  userType === "provider"
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-border hover:border-primary/50"
                )}
              >
                <Briefcase className={cn(
                  "h-6 w-6",
                  userType === "provider" ? "text-primary" : "text-muted-foreground"
                )} />
                <span className={cn(
                  "text-sm font-medium",
                  userType === "provider" ? "text-primary" : "text-muted-foreground"
                )}>
                  Service Provider
                </span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                />
              </div>
              <Button type="submit" className="w-full" variant="hero">
                Create Account
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default Signup;
