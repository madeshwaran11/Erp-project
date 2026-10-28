import { Suspense, useEffect, useMemo } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { useAnimations, useGLTF } from "@react-three/drei";
import { clone } from "three/addons/utils/SkeletonUtils.js";
import { chooseAnimation } from "./scenePolicy";

function ContextGuard({ onFailure }) {
  const gl = useThree((state) => state.gl);
  useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener("webglcontextlost", onFailure);
    return () => canvas.removeEventListener("webglcontextlost", onFailure);
  }, [gl, onFailure]);
  return null;
}

function Character({ modelPath, animation, animate, onReady }) {
  const gltf = useGLTF(modelPath);
  const scene = useMemo(() => {
    const copy = clone(gltf.scene);
    copy.traverse((object) => {
      if (!object.isMesh) return;
      object.material = Array.isArray(object.material) ? object.material.map((m) => m.clone()) : object.material.clone();
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.forEach((material) => {
        if (/short01|fine hair/i.test(material.name)) material.color.set("#372823");
        if (/tailored/i.test(material.name)) material.color.set("#b78aef");
      });
    });
    return copy;
  }, [gltf.scene]);
  const { actions, names } = useAnimations(gltf.animations, scene);
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => { onReady(); }, [onReady]);
  useEffect(() => {
    const name = chooseAnimation(names, animation);
    if (!name) return undefined;
    const action = actions[name];
    action.reset().fadeIn(0.35).play();
    return () => action.stop();
  }, [actions, animation, names]);
  useEffect(() => {
    Object.values(actions).forEach((action) => { if (action) action.paused = !animate; });
    invalidate();
  }, [actions, animate, invalidate]);
  return <primitive object={scene} rotation={[0, -0.12, 0]} position={[0, -0.94, 0]} dispose={null} />;
}
export default function HumanScene({ modelPath, animation, animate, onFailure, onReady }) {
  return <Canvas className="human-canvas" camera={{ position: [0, 0.38, 2.25], fov: 29 }} dpr={[1, 1.5]}
    frameloop={animate ? "always" : "demand"} gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
    fallback={null} onCreated={({ camera }) => {
      camera.lookAt(0, 0.32, 0);
    }}>
    <ContextGuard onFailure={onFailure} />
    <ambientLight intensity={0.75} />
    <hemisphereLight args={["#fff7ff", "#655079", 0.8]} />
    <directionalLight position={[1.5, 3, 4]} intensity={1.65} color="#fff5ec" />
    <directionalLight position={[-2, 1.5, -1]} intensity={3.3} color="#a78bfa" />
    <directionalLight position={[2, 0.5, -1]} intensity={1.5} color="#d8b4fe" />
    <Suspense fallback={null}><Character modelPath={modelPath} animation={animation} animate={animate} onReady={onReady} /></Suspense>
  </Canvas>;
}
