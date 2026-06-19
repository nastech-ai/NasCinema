import { LegalPage } from "@/components/layout/legal-page";

export default function CookiePolicyPage() {
  return (
    <LegalPage title="Cookie Policy">
      <p className="text-muted-foreground">Last updated: January 2025</p>
      <p>NyumatFlix uses cookies to provide authentication and improve user experience.</p>
      <h2>Types of Cookies</h2>
      <ul>
        <li><strong>Session cookies:</strong> Used for authentication</li>
        <li><strong>Preference cookies:</strong> Used to remember theme preferences</li>
      </ul>
      <h2>Managing Cookies</h2>
      <p>You can control cookies through your browser settings. Disabling session cookies will prevent you from logging in.</p>
    </LegalPage>
  );
}
