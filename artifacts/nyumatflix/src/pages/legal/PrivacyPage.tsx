import { LegalPage } from "@/components/layout/legal-page";

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <p className="text-muted-foreground">Last updated: January 2025</p>
      <p>NyumatFlix is an open-source streaming aggregator. We collect minimal data necessary to provide our services.</p>
      <h2>Data We Collect</h2>
      <ul>
        <li>Email address (for authentication)</li>
        <li>Watchlist preferences</li>
        <li>Session information</li>
      </ul>
      <h2>How We Use Your Data</h2>
      <p>Your data is used solely to provide and improve the NyumatFlix service. We do not sell or share your data with third parties.</p>
    </LegalPage>
  );
}
