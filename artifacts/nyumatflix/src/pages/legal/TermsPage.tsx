import { LegalPage } from "@/components/layout/legal-page";

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service">
      <p className="text-muted-foreground">Last updated: January 2025</p>
      <p>By using NyumatFlix, you agree to these terms. NyumatFlix is an open-source, free streaming aggregator for personal use.</p>
      <h2>Acceptable Use</h2>
      <p>You agree to use NyumatFlix only for lawful purposes and in accordance with these Terms.</p>
      <h2>Disclaimer</h2>
      <p>NyumatFlix is provided "as is" without warranties of any kind. We aggregate publicly available streaming information only.</p>
    </LegalPage>
  );
}
