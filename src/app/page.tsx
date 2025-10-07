import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {TrendingDown, Home, Calendar, ArrowRight} from "lucide-react";
import {SignedIn, SignedOut, SignInButton, SignUpButton, UserButton} from "@clerk/nextjs";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Nav */}
      <nav className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-6 h-6 text-emerald-400"/>
            <span className="text-xl font-bold text-white">Debt-Free</span>
          </div>
          <div className="flex gap-4">
            <SignedOut>
              <SignInButton>
                <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-lg h-12 cursor-pointer">
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton>
                <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-lg h-12 cursor-pointer">
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
          <Badge variant="outline" className="mb-4 border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
            Track Your Financial Freedom
          </Badge>

          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
            Break Free From{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
              Debt
            </span>
          </h1>

          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Visualize your journey to financial freedom. Track debts, monitor progress, and celebrate every milestone.
          </p>

          <SignUpButton>
            <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-lg h-12 group cursor-pointer">
              Get Started Free
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform"/>
            </Button>
          </SignUpButton>
        </div>

        {/* Demo Card */}
        <Card
          className="max-w-2xl mx-auto mt-16 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700 backdrop-blur shadow-2xl">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardDescription>Total Debt Remaining</CardDescription>
              <Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                <TrendingDown className="w-3 h-3 mr-1"/>
                32% paid off
              </Badge>
            </div>
            <CardTitle className="text-4xl">127,242.75 PLN</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-300 text-sm">Credit Card</span>
                <span className="text-white font-semibold">12,500 PLN</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-2 rounded-full"
                     style={{width: '65%'}}></div>
              </div>
            </div>

            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-300 text-sm">Car Loan</span>
                <span className="text-white font-semibold">85,727 PLN</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-400 to-blue-500 h-2 rounded-full"
                     style={{width: '40%'}}></div>
              </div>
            </div>

            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-300 text-sm">Other Debts</span>
                <span className="text-white font-semibold">29,015 PLN</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div className="bg-gradient-to-r from-purple-400 to-purple-500 h-2 rounded-full"
                     style={{width: '78%'}}></div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-700 grid grid-cols-3 gap-4 text-center">
              <div>
                <CardDescription className="text-xs mb-1">Debt-Free Date</CardDescription>
                <p className="font-semibold text-emerald-400">Mar 2028</p>
              </div>
              <div>
                <CardDescription className="text-xs mb-1">Net Worth</CardDescription>
                <p className="font-semibold text-blue-400">-42,515 PLN</p>
              </div>
              <div>
                <CardDescription className="text-xs mb-1">Monthly Payment</CardDescription>
                <p className="font-semibold text-purple-400">3,200 PLN</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Features */}
      <div className="container mx-auto px-4 pb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">Everything You Need</h2>
          <p className="text-slate-400">Simple tools to track your debt-free journey</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card
            className="bg-slate-800/30 border-slate-700 backdrop-blur hover:bg-slate-800/50 transition-all hover:scale-105">
            <CardHeader>
              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-2">
                <TrendingDown className="w-6 h-6 text-emerald-400"/>
              </div>
              <CardTitle className="text-lg">Real-Time Tracking</CardTitle>
              <CardDescription>
                Monitor all your debts and see progress with every payment you make.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card
            className="bg-slate-800/30 border-slate-700 backdrop-blur hover:bg-slate-800/50 transition-all hover:scale-105">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-2">
                <Calendar className="w-6 h-6 text-blue-400"/>
              </div>
              <CardTitle className="text-lg">Debt-Free Projections</CardTitle>
              <CardDescription>
                See exactly when you'll be debt-free based on your payment history.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card
            className="bg-slate-800/30 border-slate-700 backdrop-blur hover:bg-slate-800/50 transition-all hover:scale-105">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-2">
                <Home className="w-6 h-6 text-purple-400"/>
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
        <Card
          className="max-w-3xl mx-auto bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border-emerald-500/20 backdrop-blur">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-3xl mb-2">Ready to Start Your Journey?</CardTitle>
            <CardDescription className="text-base">
              Join thousands on the path to financial freedom
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center pb-8">
            <SignUpButton>
              <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-lg h-12 cursor-pointer">
                Start Tracking Now
              </Button>
            </SignUpButton>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8">
        <div className="container mx-auto px-4 text-center text-slate-400 text-sm">
          <p>© 2025 Debt-Free Tracker. Your journey to financial freedom.</p>
        </div>
      </footer>
    </div>
  );
}