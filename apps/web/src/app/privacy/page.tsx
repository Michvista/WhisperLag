import { InfoPage } from "@/components/InfoPage";

export default function PrivacyPage() {
  return (
    <InfoPage
      title="Institutional Privacy"
      body="WhisperLag collects no identifying information with your submissions. Whispers are stored anonymously at the database level, and your identity is never linked to the feedback you provide. Data is encrypted in transit and at rest via UNILAG's secure infrastructure."
    />
  );
}