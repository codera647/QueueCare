"use client";

import { getFirebaseConfigSummary } from "../lib/firebase";
import { EmptyState, PageContainer } from "./ui";

export function ConfigRequiredScreen() {
  return (
    <PageContainer>
      <EmptyState
        title="Firebase web config is still needed"
        body={`Add these env vars to run the QueueCare web app: ${getFirebaseConfigSummary().join(", ")}.`}
      />
    </PageContainer>
  );
}
