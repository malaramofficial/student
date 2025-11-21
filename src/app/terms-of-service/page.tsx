
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsOfServicePage() {
  return (
    <div className="p-4 md:p-8">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Terms of Service</CardTitle>
          <CardDescription>Last updated: {new Date().toLocaleDateString()}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <section className="space-y-2">
                <h2 className="text-xl font-semibold font-headline">1. Agreement to Terms</h2>
                <p className="text-muted-foreground">
                This is a placeholder for your Terms of Service. By using your
                application, users are agreeing to these terms. It's a legal
                agreement between you and your users.
                </p>
            </section>

            <section className="space-y-2">
                <h2 className="text-xl font-semibold font-headline">2. Use of the Service</h2>
                <p className="text-muted-foreground">
                Define the permitted and prohibited uses of your app. For example,
                you might state that users agree not to use the app for any illegal
                purpose or to misuse the AI services (e.g., generating harmful
                content).
                </p>
            </section>

            <section className="space-y-2">
                <h2 className="text-xl font-semibold font-headline">3. Intellectual Property</h2>
                <p className="text-muted-foreground">
                State that the application and its original content (excluding
                user-generated content), features, and functionality are and will
                remain the exclusive property of you and its licensors.
                </p>
            </section>

            <section className="space-y-2">
                <h2 className="text-xl font-semibold font-headline">4. Disclaimers and Limitation of Liability</h2>
                <p className="text-muted-foreground">
                You should include a disclaimer that the service is provided "as is"
                and that you make no warranties regarding its reliability or
                accuracy. You should also limit your liability for any damages that
                arise from the use of your app.
                </p>
          </section>

            <section className="space-y-2">
                <h2 className="text-xl font-semibold font-headline">5. Legal Disclaimer</h2>
                <p className="text-destructive font-semibold">
                IMPORTANT: This is not legal advice. The content on this page is for
                informational purposes only. You must consult with a qualified legal
                professional to create legally binding Terms of Service for your
                specific situation and jurisdiction. You are solely responsible for
                your app's legal compliance.
                </p>
            </section>
        </CardContent>
      </Card>
    </div>
  );
}
