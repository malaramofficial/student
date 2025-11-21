
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
  return (
    <div className="p-4 md:p-8">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Privacy Policy</CardTitle>
          <CardDescription>Last updated: {new Date().toLocaleDateString()}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <section className="space-y-2">
            <h2 className="text-xl font-semibold font-headline">1. Introduction</h2>
            <p className="text-muted-foreground">
              This is a placeholder for your application's privacy policy. It is
              essential to have a comprehensive privacy policy before publishing
              your app on the Google Play Store or any other platform. This policy
              should inform users about what data you collect, how you use it,
              and their rights regarding that data.
            </p>
          </section>
           <section className="space-y-2">
            <h2 className="text-xl font-semibold font-headline">2. Information We Collect</h2>
            <p className="text-muted-foreground">
              You must detail the information your app collects. This may include:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li><strong>Personal Information:</strong> e.g., name (as collected in-app), email address, etc.</li>
                <li><strong>Usage Data:</strong> e.g., mock test scores, written exam results, progress data (note: this app stores this locally on the user's device).</li>
                <li><strong>Device Information:</strong> e.g., device type, operating system.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold font-headline">3. How We Use Your Information</h2>
            <p className="text-muted-foreground">
              Describe the purposes for which you collect the information, such as:
            </p>
             <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>To provide and maintain our service.</li>
                <li>To personalize the user experience (e.g., greeting by name).</li>
                <li>To track learning progress.</li>
                <li>To improve our application.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold font-headline">4. Data Storage and Security</h2>
            <p className="text-muted-foreground">
              Explain where and how data is stored. For this app, it's important to state: "All user-generated data, such as test results and personal name, is stored locally on the user's device using the browser's localStorage. No personal data is transmitted to or stored on our servers." You must also mention any security measures you take.
            </p>
          </section>
          
          <section className="space-y-2">
            <h2 className="text-xl font-semibold font-headline">5. Legal Disclaimer</h2>
            <p className="text-destructive font-semibold">
              IMPORTANT: This is not legal advice. You must consult with a legal professional to draft a privacy policy that complies with all applicable laws and regulations (like GDPR, CCPA, etc.) and Google Play Store policies. You are solely responsible for your app's compliance.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
