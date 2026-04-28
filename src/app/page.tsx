 "use client";

import * as React from "react";
import { LoadingScreen } from "@/components/loading-screen";
import { LandingPage } from "@/components/landing/landing-page";

export default function Home() {
  const [showLoading, setShowLoading] = React.useState(true);

  React.useEffect(() => {
    const id = window.setTimeout(() => setShowLoading(false), 1500);
    return () => window.clearTimeout(id);
  }, []);

  return showLoading ? <LoadingScreen /> : <LandingPage />;
}
