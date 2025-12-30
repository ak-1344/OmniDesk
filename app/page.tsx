import Link from "next/link"
import { ArrowRight, Lightbulb, Cannabis as Canvas, TerminalIcon, CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex aspect-square size-8 items-center justify-center bg-primary text-primary-foreground">
              <div className="size-4 border-2 border-background" />
            </div>
            <span className="font-bold tracking-tight text-xl">OMNIDESK</span>
          </Link>
          <Button asChild variant="default">
            <Link href="/dashboard">Enter Workspace</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 py-24 md:py-32 text-center">
        <div className="space-y-8">
          <h1 className="text-5xl md:text-6xl lg:text-7xl leading-[1.1] text-balance">
            A calm desk for <span className="italic text-accent">spatial</span> thinking.
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-balance">
            Ideas before tasks. Structure adapts to you. Everything is reversible without guilt.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Button asChild size="lg" className="gap-2 h-12 px-8">
              <Link href="/dashboard">
                Get Started
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-24 border-t border-border/50">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-border/50 hover:border-accent/50 transition-colors">
            <CardContent className="p-6 space-y-4">
              <div className="size-12 bg-accent/10 flex items-center justify-center">
                <Lightbulb className="size-6 text-accent" />
              </div>
              <h3 className="text-xl font-medium">Ideas First</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Not every thought needs to become a task. Ideas exist independently, evolving at their own pace.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover:border-accent/50 transition-colors">
            <CardContent className="p-6 space-y-4">
              <div className="size-12 bg-accent/10 flex items-center justify-center">
                <Canvas className="size-6 text-accent" />
              </div>
              <h3 className="text-xl font-medium">Per-Idea Canvas</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Each idea can have its own spatial workspace. Pan, zoom, connect thoughts, and let structure emerge
                naturally.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover:border-accent/50 transition-colors">
            <CardContent className="p-6 space-y-4">
              <div className="size-12 bg-accent/10 flex items-center justify-center">
                <TerminalIcon className="size-6 text-accent" />
              </div>
              <h3 className="text-xl font-medium">Thought Terminal</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Quickly capture cognitive overflow. A command interface for the moments when you just need to get it out
                of your head.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover:border-accent/50 transition-colors">
            <CardContent className="p-6 space-y-4">
              <div className="size-12 bg-accent/10 flex items-center justify-center">
                <CalendarIcon className="size-6 text-accent" />
              </div>
              <h3 className="text-xl font-medium">Awareness Calendar</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Soft scheduling without pressure. See what's happening without guilt or panic. Time as a guide, not a
                tyrant.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Philosophy */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center border-t border-border/50">
        <div className="space-y-6">
          <h2 className="text-3xl md:text-4xl text-balance">Thinking first. Execution optional.</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            OmniDesk is designed around how the human mind actually works. Ideas precede tasks. Structure emerges from
            exploration. And nothing forces you into premature action.
          </p>
          <div className="pt-8">
            <Button asChild size="lg" variant="outline" className="gap-2 bg-transparent">
              <Link href="/dashboard">
                Enter Your Workspace
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-muted/20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="flex aspect-square size-8 items-center justify-center bg-primary text-primary-foreground">
                <div className="size-4 border-2 border-background" />
              </div>
              <span className="font-bold tracking-tight text-xl">OMNIDESK</span>
            </div>
            <p className="text-sm text-muted-foreground">A calm workspace for spatial thinkers.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
