import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function UserGuidePage() {
    return (
        <div className="container max-w-4xl py-10 space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard">
                        <ArrowLeft className="size-4" />
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">User Guide</h1>
            </div>

            <div className="prose prose-zinc dark:prose-invert max-w-none space-y-12">
                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold border-b pb-2">Getting Started</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Welcome to <strong>OmniDesk</strong>, a calm workspace for spatial thinkers.
                        Everything is reversible, and structure adapts to you. To begin, simply navigate to the Dashboard to get a high-level view of your workspace.
                    </p>
                </section>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Dashboard Overview</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm text-muted-foreground">
                            <p>The Dashboard is your command center.</p>
                            <ul className="list-disc pl-4 space-y-1">
                                <li><strong>Greeting:</strong> Personalized welcome.</li>
                                <li><strong>Quick Stats:</strong> Overview of tasks, ideas, queries.</li>
                                <li><strong>Recent Activity:</strong> Snapshot of your work.</li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Ideas First</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm text-muted-foreground">
                            <p>Capture thoughts freely before they become tasks.</p>
                            <ul className="list-disc pl-4 space-y-1">
                                <li><strong>Create:</strong> Click "New Idea" to start.</li>
                                <li><strong>Canvas:</strong> Spatial workspace for each idea.</li>
                                <li><strong>Convert:</strong> Turn ideas into tasks when ready.</li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Task Management</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm text-muted-foreground">
                            <p>Manage execution effectively.</p>
                            <ul className="list-disc pl-4 space-y-1">
                                <li><strong>Kanban:</strong> Drag-and-drop workflow.</li>
                                <li><strong>Subtasks:</strong> Break down complex items.</li>
                                <li><strong>Priorities:</strong> Focus on what matters.</li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Calendar & Events</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm text-muted-foreground">
                            <p>Maintain awareness without pressure.</p>
                            <ul className="list-disc pl-4 space-y-1">
                                <li><strong>Weekly View:</strong> See your week at a glance.</li>
                                <li><strong>Events:</strong> Track deadlines and meetings.</li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold border-b pb-2">Settings</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Customize your experience. Update your profile, manage domains (areas of life), and customize your Kanban columns to match your personal workflow.
                    </p>
                </section>
            </div>
        </div>
    );
}
