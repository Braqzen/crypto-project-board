import { useEffect, useMemo, useRef } from "react";
import { Billboard, Text } from "@react-three/drei";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as THREE from "three";

import type { TagGraphLayout, TagGraphProjectNode } from "lib/tag-graph-layout";

function colorFromLabel(label: string): string {
  const h = [...label].reduce((acc, ch) => (acc << 5) - acc + ch.charCodeAt(0), 0);
  const hue = Math.abs(h % 360);
  return `hsl(${hue}, 72%, 58%)`;
}

function DampingOrbitControls() {
  const controlsRef = useRef<OrbitControls | null>(null);
  const { camera, gl } = useThree();

  useEffect(() => {
    const controls = new OrbitControls(camera, gl.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.rotateSpeed = 0.85;
    controls.minDistance = 5;
    controls.maxDistance = 56;
    controlsRef.current = controls;
    return () => controls.dispose();
  }, [camera, gl]);

  useFrame(() => {
    controlsRef.current?.update();
  });

  return null;
}

function buildLinkPositionBuffer(
  layout: TagGraphLayout,
  filter?: (link: TagGraphLinksItem) => boolean,
) {
  const positions: number[] = [];
  const positionsById = new Map<string, THREE.Vector3>();
  for (const h of layout.hubs) positionsById.set(`hub:${h.tag}`, h.position);
  for (const p of layout.projects) positionsById.set(p.id, p.position);

  for (const link of layout.links) {
    if (filter && !filter(link)) continue;
    const a = positionsById.get(link.fromId);
    const b = positionsById.get(link.toId);
    if (!a || !b) continue;
    positions.push(a.x, a.y, a.z, b.x, b.y, b.z);
  }

  if (positions.length === 0) return null;

  const buffer = new Float32Array(positions);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(buffer, 3));
  return geo;
}

type TagGraphLinksItem = { fromId: string; toId: string };

function getHighlightFilter(selected: PickPayload): ((link: TagGraphLinksItem) => boolean) | null {
  if (!selected) return null;
  if (selected.kind === "hub") {
    const hid = `hub:${selected.tag}`;
    return (link: TagGraphLinksItem) => link.toId === hid;
  }
  if (selected.kind === "project") {
    const pid = selected.node.id;
    return (link: TagGraphLinksItem) => link.fromId === pid;
  }
  return null;
}

function MutedLinks({ geometry }: { geometry: THREE.BufferGeometry }) {
  useEffect(() => {
    return () => geometry.dispose();
  }, [geometry]);

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color="#94a3b8" opacity={0.09} transparent depthWrite={false} />
    </lineSegments>
  );
}

function HighlightLinks({ geometry }: { geometry: THREE.BufferGeometry }) {
  useEffect(() => {
    return () => geometry.dispose();
  }, [geometry]);

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color="#f1f5f9" opacity={0.95} transparent depthWrite={false} />
    </lineSegments>
  );
}

export type PickPayload =
  | { kind: "hub"; tag: string }
  | { kind: "project"; node: TagGraphProjectNode }
  | null;

function hubDim(selected: PickPayload, tag: string): boolean {
  if (!selected) return false;
  if (selected.kind === "hub") return selected.tag !== tag;
  if (selected.kind === "project") return !selected.node.tagsUniqueSorted.includes(tag);
  return false;
}

function projectDim(selected: PickPayload, node: TagGraphProjectNode): boolean {
  if (!selected) return false;
  if (selected.kind === "project") return selected.node.id !== node.id;
  if (selected.kind === "hub") return !node.tagsUniqueSorted.includes(selected.tag);
  return false;
}

function hubIsConnected(selected: PickPayload, tag: string): boolean {
  if (!selected) return false;
  if (selected.kind === "hub") return selected.tag === tag;
  if (selected.kind === "project") return selected.node.tagsUniqueSorted.includes(tag);
  return false;
}

function projectIsConnected(selected: PickPayload, node: TagGraphProjectNode): boolean {
  if (!selected) return false;
  if (selected.kind === "project") return selected.node.id === node.id;
  if (selected.kind === "hub") return node.tagsUniqueSorted.includes(selected.tag);
  return false;
}

function hubLabelFontSizes(hubs: TagGraphLayout["hubs"]): Map<string, number> {
  const map = new Map<string, number>();
  if (hubs.length === 0) return map;
  const counts = hubs.map((h) => h.projectCount);
  const minC = Math.min(...counts);
  const maxC = Math.max(...counts);
  const floor = 0.19;
  const ceil = 0.58;
  for (const h of hubs) {
    const span = maxC - minC;
    const t = span <= 0 ? 0.5 : (h.projectCount - minC) / span;
    map.set(h.tag, floor + t * (ceil - floor));
  }
  return map;
}

function HubNodes({
  hubs,
  selected,
  onPickHub,
}: {
  hubs: TagGraphLayout["hubs"];
  selected: PickPayload;
  onPickHub: (tag: string) => void;
}) {
  const fontByTag = useMemo(() => hubLabelFontSizes(hubs), [hubs]);

  return hubs.map((h) => {
    const selectedHere = selected?.kind === "hub" && selected.tag === h.tag;
    const connected = hubIsConnected(selected, h.tag);
    const dim = hubDim(selected, h.tag);
    const scale = selectedHere ? 1.22 : connected ? 1.08 : 1;
    const base = selectedHere ? "#f8fafc" : colorFromLabel(h.tag);
    const fontSize =
      (fontByTag.get(h.tag) ?? 0.34) * (selectedHere ? 1.06 : connected && selected ? 1.03 : 1);
    let outlineWidth = fontSize * 0.046;
    if (selectedHere) outlineWidth *= 1.12;
    if (connected && selected && selectedHere !== true) outlineWidth *= 1.08;
    const fillOpacity = !selected ? 1 : connected && !dim ? (selectedHere ? 1 : 0.93) : 0.13;
    return (
      <group key={h.tag} position={[h.position.x, h.position.y, h.position.z]} scale={scale}>
        <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
          <Text
            fontSize={fontSize}
            maxWidth={10}
            anchorX="center"
            anchorY="middle"
            textAlign="center"
            lineHeight={1}
            color={base}
            fillOpacity={fillOpacity}
            outlineWidth={outlineWidth}
            outlineColor={selectedHere ? "#1e293b" : "#151821"}
            outlineOpacity={dim ? 0.22 : selectedHere ? 1 : connected && selected ? 0.93 : 0.88}
            depthOffset={selectedHere ? 6 : connected && selected ? 3 : 0}
            onClick={(event: ThreeEvent<MouseEvent>) => {
              event.stopPropagation();
              onPickHub(h.tag);
            }}
          >
            {h.tag}
          </Text>
        </Billboard>
      </group>
    );
  });
}

function ProjectNodes({
  projects,
  selected,
  onPickProject,
}: {
  projects: TagGraphLayout["projects"];
  selected: PickPayload;
  onPickProject: (node: TagGraphProjectNode) => void;
}) {
  return projects.map((p) => {
    const selectedHere = selected?.kind === "project" && selected.node.id === p.id;
    const connected = projectIsConnected(selected, p);
    const dim = projectDim(selected, p);
    const scale = selectedHere ? 1.18 : connected && selected ? 1.06 : 1;
    const fontSize = selectedHere ? 0.164 : connected && selected && !dim ? 0.142 : 0.126;
    const fillProj = !selected ? 1 : connected && !dim ? 1 : 0.12;
    const outlineProj = dim ? 0.2 : selectedHere ? 1 : connected && selected ? 0.96 : 0.78;
    return (
      <group key={p.id} position={[p.position.x, p.position.y, p.position.z]} scale={scale}>
        <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
          <Text
            fontSize={fontSize}
            maxWidth={3.4}
            anchorX="center"
            anchorY="middle"
            textAlign="center"
            lineHeight={1.06}
            color={selectedHere ? "#ffffff" : connected && selected ? "#f1f5f9" : "#c8d5e4"}
            fillOpacity={fillProj}
            outlineWidth={selectedHere ? 0.024 : 0.014}
            outlineColor="#141826"
            outlineOpacity={outlineProj}
            depthOffset={selectedHere ? 6 : connected && selected ? 3 : 0}
            onClick={(event: ThreeEvent<MouseEvent>) => {
              event.stopPropagation();
              onPickProject(p);
            }}
          >
            {p.label}
          </Text>
        </Billboard>
      </group>
    );
  });
}

function InnerScene({
  layout,
  selected,
  onPick,
}: {
  layout: TagGraphLayout;
  selected: PickPayload;
  onPick: (payload: PickPayload) => void;
}) {
  const mutedGeometry = useMemo(() => buildLinkPositionBuffer(layout), [layout]);
  const highlightGeometry = useMemo(() => {
    const filter = getHighlightFilter(selected);
    if (!filter) return null;
    return buildLinkPositionBuffer(layout, filter);
  }, [layout, selected]);

  return (
    <>
      <color attach="background" args={["#12151f"]} />
      <ambientLight intensity={0.42} />
      <directionalLight position={[10, 12, 6]} intensity={0.85} />
      <directionalLight position={[-8, -4, -10]} intensity={0.28} />

      {mutedGeometry ? <MutedLinks geometry={mutedGeometry} /> : null}
      {highlightGeometry ? <HighlightLinks geometry={highlightGeometry} /> : null}

      <HubNodes
        hubs={layout.hubs}
        selected={selected}
        onPickHub={(tag) => onPick({ kind: "hub", tag })}
      />
      <ProjectNodes
        projects={layout.projects}
        selected={selected}
        onPickProject={(node) => onPick({ kind: "project", node })}
      />

      <DampingOrbitControls />
    </>
  );
}

export type TagGraphSceneProps = {
  layout: TagGraphLayout;
  selected: PickPayload;
  onPick: (payload: PickPayload) => void;
};

export function TagGraphScene({ layout, selected, onPick }: TagGraphSceneProps) {
  return (
    <Canvas
      className="h-full min-h-0 w-full flex-1 touch-none"
      camera={{ position: [0, 2, 16], fov: 50, near: 0.08, far: 160 }}
      gl={{ antialias: true, alpha: false }}
      onPointerMissed={() => onPick(null)}
    >
      <InnerScene layout={layout} selected={selected} onPick={onPick} />
    </Canvas>
  );
}
