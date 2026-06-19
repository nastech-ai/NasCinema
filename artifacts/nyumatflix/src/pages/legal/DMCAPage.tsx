import { LegalPage } from "@/components/layout/legal-page";

export default function DMCAPage() {
  return (
    <LegalPage title="DMCA Policy">
      <p className="text-muted-foreground">Last updated: January 2025</p>
      <p>NyumatFlix respects intellectual property rights and expects users to do the same.</p>
      <h2>Reporting Infringement</h2>
      <p>If you believe content on NyumatFlix infringes your copyright, please contact us with the following information:</p>
      <ul>
        <li>Description of the copyrighted work</li>
        <li>Location of the infringing material</li>
        <li>Your contact information</li>
        <li>A statement of good faith belief</li>
      </ul>
    </LegalPage>
  );
}
