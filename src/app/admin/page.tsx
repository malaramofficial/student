"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { trainAI } from "@/lib/actions";
import { Loader2 } from "lucide-react";

const ADMIN_CODE = "123456";

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [code, setCode] = useState("");
  const [trainingData, setTrainingData] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [trainingResponse, setTrainingResponse] = useState("");
  const { toast } = useToast();

  const handleLogin = () => {
    if (code === ADMIN_CODE) {
      setIsLoggedIn(true);
      toast({ title: "Login Successful", description: "Welcome, Admin!" });
    } else {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Incorrect security code.",
      });
    }
  };

  const handleTrain = async () => {
    if (!trainingData.trim()) {
      toast({
        variant: "destructive",
        title: "Training Failed",
        description: "Training data cannot be empty.",
      });
      return;
    }
    setIsLoading(true);
    setTrainingResponse("");
    const response = await trainAI({ trainingData });
    if (response.success && response.result) {
      setTrainingResponse(response.result);
      setTrainingData("");
      toast({
        title: "Training Submitted",
        description: "Aditi Madam has received the new information.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Training Failed",
        description: response.error || "An unknown error occurred.",
      });
    }
    setIsLoading(false);
  };

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center p-4 min-h-[80vh]">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Admin Login</CardTitle>
            <CardDescription>Enter the 6-digit security code to access the training panel.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Security Code</Label>
              <Input
                id="code"
                type="password"
                placeholder="******"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleLogin}>
              Authenticate
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Train Aditi Madam</CardTitle>
          <CardDescription>
            Provide new information for the AI mentor. The AI will learn from your input and confirm its understanding.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="training-data">Training Data</Label>
            <Textarea
              id="training-data"
              placeholder="e.g., 'The Aditi Learning Platform was created by an innovative developer passionate about education...'"
              className="min-h-[150px]"
              value={trainingData}
              onChange={(e) => setTrainingData(e.target.value)}
            />
          </div>
          {trainingResponse && (
            <div className="p-4 bg-secondary rounded-md border">
              <p className="font-semibold text-secondary-foreground">Aditi's Response:</p>
              <p className="text-sm text-muted-foreground">{trainingResponse}</p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleTrain} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Train Aditi
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
