"use client";

import { WhisperWizard } from "./WhisperWizard";

export function WhisperForm({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <WhisperWizard />
    </div>
  );
}