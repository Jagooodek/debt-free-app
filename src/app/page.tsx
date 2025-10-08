import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {TrendingDown, Home, Calendar, ArrowRight} from "lucide-react";
import {SignedIn, SignedOut, SignInButton, SignUpButton, UserButton} from "@clerk/nextjs";
import {auth} from "@clerk/nextjs/server";
import {redirect} from "next/navigation";
import Image from "next/image";

export default async function LandingPage() {

  const {userId} = await auth();
  if (userId) {
    redirect("/dashboard");
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Nav */}
      <nav className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Image src="/icon.svg" alt="Debt-Free Logo" width={40} height={40} className="rounded-lg"/>
            <span className="text-xl font-bold text-foreground">Debt-Free</span>
          </div>
          <div className="flex gap-4">
            <SignedOut>
              <SignInButton>
                <Button variant="ghost" size="lg" className="h-12 text-lg cursor-pointer">
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton>
                <Button size="lg" className="h-12 text-lg cursor-pointer">
                  Sign Up
                </Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton/>
            </SignedIn>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="container mx-auto px-4 pt-12 pb-20">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="outline" className="mb-4 border-primary/20 bg-primary/10 text-primary">
            Track Your Financial Freedom
          </Badge>

          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
            Break Free From{" "}
            <span className="bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
              Debt
            </span>
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Visualize your journey to financial freedom. Track debts, monitor progress, and celebrate every milestone.
          </p>

          <SignUpButton>
            <Button size="lg" className="h-12 text-lg group cursor-pointer">
              Get Started Free
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform"/>
            </Button>
          </SignUpButton>
        </div>

        {/* Demo Card */}
        <Card className="max-w-2xl mx-auto mt-16 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-border backdrop-blur shadow-2xl">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardDescription>Total Debt Remaining</CardDescription>
              <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
                <TrendingDown className="w-3 h-3 mr-1"/>
                32% paid off
              </Badge>
            </div>
            <CardTitle className="text-4xl">127,242.75 PLN</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="bg-slate-900/50 p-4 rounded-xl border border-border">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Credit Card</span>
                <span className="font-semibold text-foreground">12,500 PLN</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-gradient-to-r from-primary via-primary to-emerald-500 h-2 rounded-full transition-all" style={{width: '65%'}}></div>
              </div>
            </div>

            <div className="bg-slate-900/50 p-4 rounded-xl border border-border">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Car Loan</span>
                <span className="font-semibold text-foreground">85,727 PLN</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-gradient-to-r from-chart-2 via-chart-2 to-blue-500 h-2 rounded-full transition-all" style={{width: '40%'}}></div>
              </div>
            </div>

            <div className="bg-slate-900/50 p-4 rounded-xl border border-border">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Other Debts</span>
                <span className="font-semibold text-foreground">29,015 PLN</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-gradient-to-r from-chart-3 via-chart-3 to-purple-500 h-2 rounded-full transition-all" style={{width: '78%'}}></div>
              </div>
            </div>

            <div className="pt-4 border-t border-border grid grid-cols-3 gap-4 text-center">
              <div>
                <CardDescription className="text-xs mb-1">Debt-Free Date</CardDescription>
                <p className="font-semibold text-primary">Mar 2028</p>
              </div>
              <div>
                <CardDescription className="text-xs mb-1">Net Worth</CardDescription>
                <p className="font-semibold text-chart-2">-42,515 PLN</p>
              </div>
              <div>
                <CardDescription className="text-xs mb-1">Monthly Payment</CardDescription>
                <p className="font-semibold text-chart-3">3,200 PLN</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Features */}
      <div className="container mx-auto px-4 pb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-3">Everything You Need</h2>
          <p className="text-muted-foreground">Simple tools to track your debt-free journey</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="bg-slate-800/30 border-border backdrop-blur hover:bg-slate-800/50 transition-all hover:scale-105">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-2">
                <TrendingDown className="w-6 h-6 text-primary"/>
              </div>
              <CardTitle className="text-lg">Real-Time Tracking</CardTitle>
              <CardDescription>
                Monitor all your debts and see progress with every payment you make.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-slate-800/30 border-border backdrop-blur hover:bg-slate-800/50 transition-all hover:scale-105">
            <CardHeader>
              <div className="w-12 h-12 bg-chart-2/10 rounded-xl flex items-center justify-center mb-2">
                <Calendar className="w-6 h-6 text-chart-2"/>
              </div>
              <CardTitle className="text-lg">Debt-Free Projections</CardTitle>
              <CardDescription>
                See exactly when you'll be debt-free based on your payment history.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-slate-800/30 border-border backdrop-blur hover:bg-slate-800/50 transition-all hover:scale-105">
            <CardHeader>
              <div className="w-12 h-12 bg-chart-3/10 rounded-xl flex items-center justify-center mb-2">
                <Home className="w-6 h-6 text-chart-3"/>
              </div>
              <CardTitle className="text-lg">Net Worth Tracking</CardTitle>
              <CardDescription>
                Track debts and assets together to see your complete financial picture.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* CTA */}
      <div className="container mx-auto px-4 pb-20">
        <Card className="max-w-3xl mx-auto bg-gradient-to-r from-primary/10 to-chart-2/10 border-primary/20 backdrop-blur">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-3xl mb-2">Ready to Start Your Journey?</CardTitle>
            <CardDescription className="text-base">
              Join thousands on the path to financial freedom
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center pb-8">
            <SignUpButton>
              <Button size="lg" className="h-12 text-lg cursor-pointer">
                Start Tracking Now
              </Button>
            </SignUpButton>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>© 2025 Debt-Free Tracker. Your journey to financial freedom.</p>
        </div>
      </footer>
    </div>
  );
}