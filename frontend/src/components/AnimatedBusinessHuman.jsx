import { Component, lazy, Suspense, useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

const HumanScene = lazy(() => import("./HumanScene"));
const reducedQuery = () => window.matchMedia("(prefers-reduced-motion: reduce)");
const subscribeMotion = (update) => {
  const query = reducedQuery();
  query.addEventListener("change", update);
  return () => query.removeEventListener("change", update);
};
const motionSnapshot = () => reducedQuery().matches;

function StillHuman() {
  return <img className="human-poster" src="/models/business-guide.webp" alt="" width="640" height="800" />;
}
class SceneBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <StillHuman /> : this.props.children; }
}

/** Decorative model only. Failure never interrupts authentication or business controls. */
export default function AnimatedBusinessHuman({ modelPath = "/models/business-guide.glb", animation, className = "" }) {
  const host = useRef(null);
  const reduce = useSyncExternalStore(subscribeMotion, motionSnapshot, () => true);
  const [visible, setVisible] = useState(false);
  const [activeTab, setActiveTab] = useState(true);
  const [paused, setPaused] = useState(false);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const handleReady = useCallback(() => setReady(true), []);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: "80px" });
    observer.observe(host.current);
    const sync = () => setActiveTab(!document.hidden);
    document.addEventListener("visibilitychange", sync);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", sync); };
  }, []);
  const animate = !reduce && !paused && visible && activeTab;
  return <div ref={host} className={`business-human ${className}`} data-human-mode={failed || reduce ? "static" : animate ? "animated" : "paused"}>
    <div className="human-stage" data-ready={ready && visible && !failed && !reduce} aria-hidden="true">
      <StillHuman />
      {visible && !reduce && !failed && <SceneBoundary key={modelPath}><Suspense fallback={null}>
        <HumanScene modelPath={modelPath} animation={animation} animate={animate} onReady={handleReady} onFailure={() => setFailed(true)} />
      </Suspense></SceneBoundary>}
    </div>
    {!reduce && !failed && <button type="button" className="scene-toggle" aria-label={paused ? "Play decorative animation" : "Pause decorative animation"} aria-pressed={paused} onClick={() => setPaused(!paused)}>{paused ? "Play motion" : "Pause motion"}</button>}
  </div>;
}
