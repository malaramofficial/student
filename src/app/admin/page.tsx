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

const ADMIN_CODE = "772697";

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
      toast({ title: "लॉगिन सफल", description: "आपका स्वागत है, एडमिन!" });
    } else {
      toast({
        variant: "destructive",
        title: "लॉगिन विफल",
        description: "गलत सुरक्षा कोड।",
      });
    }
  };

  const handleTrain = async () => {
    if (!trainingData.trim()) {
      toast({
        variant: "destructive",
        title: "प्रशिक्षण विफल",
        description: "प्रशिक्षण डेटा खाली नहीं हो सकता।",
      });
      return;
    }
    setIsLoading(true);
    setTrainingResponse("");
    try {
      const response = await trainAI({ trainingData });
      if (response.success && response.result) {
        setTrainingResponse(response.result);
        setTrainingData("");
        toast({
          title: "प्रशिक्षण प्रस्तुत किया गया",
          description: "अदिति मैडम को नई जानकारी मिल गई है।",
        });
      } else {
        toast({
          variant: "destructive",
          title: "प्रशिक्षण विफल",
          description: response.error || "एक अज्ञात त्रुटि हुई।",
        });
      }
    } catch (error) {
       toast({
        variant: "destructive",
        title: "प्रशिक्षण विफल",
        description: "एक अप्रत्याशित त्रुटि हुई।",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-8rem)]">
        <Card className="w-full max-w-sm border-2 border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl text-primary">एडमिन लॉगिन</CardTitle>
            <CardDescription>प्रशिक्षण पैनल तक पहुंचने के लिए 6-अंकीय सुरक्षा कोड दर्ज करें।</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">सुरक्षा कोड</Label>
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
              प्रमाणित करें
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <Card className="w-full max-w-4xl mx-auto border-2 border-primary/20 shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary">अदिति मैडम को प्रशिक्षित करें</CardTitle>
          <CardDescription>
            एआई मेंटर के लिए नई जानकारी प्रदान करें। एआई आपके इनपुट से सीखेगा और अपनी समझ की पुष्टि करेगा।
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="training-data" className="text-base">प्रशिक्षण डेटा</Label>
            <Textarea
              id="training-data"
              placeholder="जैसे, 'अदिति लर्निंग प्लेटफॉर्म एक अभिनव डेवलपर द्वारा बनाया गया था जो शिक्षा के प्रति जुनूनी है...'"
              className="min-h-[150px] text-base"
              value={trainingData}
              onChange={(e) => setTrainingData(e.target.value)}
            />
          </div>
          {trainingResponse && (
            <div className="p-4 bg-primary/10 rounded-md border border-primary/30">
              <p className="font-semibold text-primary">अदिति की प्रतिक्रिया:</p>
              <p className="text-sm text-foreground/80">{trainingResponse}</p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleTrain} disabled={isLoading} size="lg">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            अदिति को प्रशिक्षित करें
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
