import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { api } from "@/services/api";
import { Loader2 } from "lucide-react";

export default function ReportIncident() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        setLoading(false);
        setSuccess(true);
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-10 space-y-4 animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-4xl">✅</span>
                </div>
                <h2 className="text-2xl font-bold">Report Submitted Successfully</h2>
                <p className="text-muted-foreground text-center max-w-md">
                    Your report has been received. Our AI is currently analyzing it for severity and authenticity. Blockchain logging is in progress.
                </p>
                <Button onClick={() => setSuccess(false)}>Submit Another</Button>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Report an Incident</h1>
                <p className="text-muted-foreground">Provide details to alert emergency services. AI will prioritize your request.</p>
            </div>

            <Card>
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle>Incident Details</CardTitle>
                        <CardDescription>All fields are required for accurate ML processing.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Incident Type</label>
                            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                                <option>Fire</option>
                                <option>Flood</option>
                                <option>Road Accident</option>
                                <option>Violence</option>
                                <option>Infrastructure Failure</option>
                                <option>Medical Emergency</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <textarea
                                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Describe what is happening detailedly..."
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Location (Lat/Long)</label>
                                <Input placeholder="Automatically detected..." readOnly defaultValue="40.7128, -74.0060" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Time of Day</label>
                                <Input defaultValue="Afternoon" readOnly />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" size="lg" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {loading ? "Analyzing & Submitting..." : "Submit Report"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
