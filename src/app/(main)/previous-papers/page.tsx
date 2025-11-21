
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileArchive } from 'lucide-react';

export default function PreviousPapersPage() {
  return (
    <div className="flex justify-center items-start p-4 md:p-8 min-h-[calc(100vh-8rem)]">
      <Card className="w-full max-w-2xl bg-transparent border-0 md:border md:bg-card shadow-none md:shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileArchive />
            पिछले वर्ष के पेपर
          </CardTitle>
          <CardDescription>
            यह सुविधा जल्द ही उपलब्ध होगी। यहां आप पिछले वर्षों के परीक्षा पत्र देख और डाउनलोड कर पाएंगे।
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center p-8 bg-muted rounded-lg">
            <h3 className="text-lg font-semibold text-muted-foreground">जल्द आ रहा है...</h3>
            <p className="text-sm text-muted-foreground mt-2">
              हम इस सेक्शन पर काम कर रहे हैं। बने रहें!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
