import { lazy, Suspense, useState } from "react";

// Generated editorial artwork; the original rigged character is retained as an error fallback.
const AnimatedBusinessHuman = lazy(() => import("./AnimatedBusinessHuman"));
export default function HumanArtwork({ variant = "woman" }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <Suspense fallback={null}><AnimatedBusinessHuman /></Suspense>;
  const portrait = variant === "man";
  return <picture className={`human-artwork artwork-${variant}`} aria-hidden="true">
    <source media="(max-width: 800px)" srcSet={`/artwork/business-guide-${variant}-small.webp`} />
    <img src={`/artwork/business-guide-${variant}.webp`} alt="" width={portrait ? 1024 : 1536} height={portrait ? 1536 : 1024} fetchPriority="high" decoding="async" onError={() => setFailed(true)} />
  </picture>;
}
