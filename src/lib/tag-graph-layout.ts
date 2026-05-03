import type { Vector3 } from "three";
import * as THREE from "three";

import type { Project } from "types/project";

export type TagGraphHub = {
  tag: string;
  projectCount: number;
  position: Vector3;
};

export type TagGraphProjectNode = {
  id: string;
  label: string;
  description: string;
  hubTagsOnProject: string[];
  orphanTagsOnProject: string[];
  /** Unique tags from the dataset used for centroid and sidebar. */
  tagsUniqueSorted: readonly string[];
  position: Vector3;
};

export type TagGraphLinks = readonly { fromId: string; toId: string }[];

export type TagGraphLayout = {
  hubs: TagGraphHub[];
  hubTagSet: ReadonlySet<string>;
  hubPositions: Map<string, Vector3>;
  tagProjectCount: Map<string, number>;
  projects: TagGraphProjectNode[];
  links: TagGraphLinks;
};

function fibonacciSpherePoints(count: number, radius: number): Vector3[] {
  const points: Vector3[] = [];
  if (count === 0) return points;
  const golden = (1 + Math.sqrt(5)) / 2;
  for (let i = 0; i < count; i++) {
    const t = (i + 0.5) / count;
    const phi = Math.acos(Math.max(-1, Math.min(1, 1 - 2 * t)));
    const theta = 2 * Math.PI * golden * i;
    const sinPhi = Math.sin(phi);
    const x = radius * sinPhi * Math.cos(theta);
    const y = radius * sinPhi * Math.sin(theta);
    const z = radius * Math.cos(phi);
    points.push(new THREE.Vector3(x, y, z));
  }
  return points;
}

function hashStringToUint32(label: string): number {
  let h = 2166136261;
  for (let i = 0; i < label.length; i++) {
    h ^= label.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Deterministic small offset from node id string. */
function jitterFromSeed(seed: string, scale: number): THREE.Vector3 {
  const a = hashStringToUint32(`${seed}a`);
  const b = hashStringToUint32(`${seed}b`);
  const c = hashStringToUint32(`${seed}c`);
  const x = (((a % 1000) / 1000) * 2 - 1) * scale;
  const y = (((b % 1000) / 1000) * 2 - 1) * scale;
  const z = (((c % 1000) / 1000) * 2 - 1) * scale;
  return new THREE.Vector3(x, y, z);
}

function countTagProjects(projects: readonly Project[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const project of projects) {
    for (const tag of project.category) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return counts;
}

/** Every distinct tag in the dataset gets a hub slot, higher global count first. */
export function tagsSortedByProjectCount(tagProjectCount: ReadonlyMap<string, number>): string[] {
  return [...tagProjectCount.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([t]) => t);
}

function sphereRadiusForHubCount(hubCount: number): number {
  if (hubCount <= 0) return 4.15;
  return 3.2 + Math.sqrt(hubCount) * 0.42;
}

function seededUnit(seed: string, salt: string): number {
  return (hashStringToUint32(`${seed}|${salt}`) % 10_061) / 10_061;
}

/** Mean of hub world positions so a project lands between its tag hubs in 3D. */
function meanHubPosition(
  hubTagsOnProject: readonly string[],
  hubPositions: ReadonlyMap<string, THREE.Vector3>,
): THREE.Vector3 {
  const acc = new THREE.Vector3();
  let n = 0;
  for (const tag of hubTagsOnProject) {
    const p = hubPositions.get(tag);
    if (!p) continue;
    acc.add(p);
    n += 1;
  }
  if (n === 0) return acc;
  return acc.multiplyScalar(1 / n);
}

function tangentPlaneBasis(u: THREE.Vector3, seedSalt: string): readonly [THREE.Vector3, THREE.Vector3] {
  const jitter = jitterFromSeed(`${seedSalt}|tp`, 1);
  const helper = u.clone().add(jitter);
  if (helper.lengthSq() < 1e-8) helper.set(1e-6, -1, 7e-6);
  const t = new THREE.Vector3().crossVectors(u, helper).normalize();
  let tAdj = t;
  if (tAdj.lengthSq() < 1e-10) {
    helper.set(1, u.y > 0 ? -1 : 1, u.z > 0 ? -0.02 : 0.02);
    tAdj = new THREE.Vector3().crossVectors(u, helper).normalize();
  }
  const bit = new THREE.Vector3().crossVectors(u, tAdj).normalize();
  return [tAdj, bit];
}

/** Small shift in the tangent plane around `centroid` so identical tag sets diverge slightly. */
function tinyCentroidSeparation(centroid: THREE.Vector3, seed: string, hubSphereRadius: number): THREE.Vector3 {
  if (centroid.lengthSq() < 1e-12) return centroid.clone();
  const radial = centroid.clone().normalize();
  const [tAdj, bit] = tangentPlaneBasis(radial, `${seed}|sep`);
  const amp = hubSphereRadius * (0.02 + seededUnit(seed, "sepAmp") * 0.065);
  const ang = seededUnit(seed, "sepAng") * Math.PI * 2;
  return centroid
    .clone()
    .addScaledVector(tAdj, Math.cos(ang) * amp)
    .addScaledVector(bit, Math.sin(ang) * amp);
}

/** Shift off a hub anchor in its tangent plane so the project label does not sit on the tag text. */
function besideHubAnchor(hubWorld: THREE.Vector3, seed: string, hubSphereRadius: number): THREE.Vector3 {
  if (hubWorld.lengthSq() < 1e-12) return hubWorld.clone();
  const u = hubWorld.clone().normalize();
  const [ta, tb] = tangentPlaneBasis(u, `${seed}|beside`);
  const ang = seededUnit(seed, "besideAng") * Math.PI * 2;
  const bump =
    hubSphereRadius * (0.135 + seededUnit(seed, "besideBump") * 0.095);
  return hubWorld.clone().addScaledVector(ta, Math.cos(ang) * bump).addScaledVector(tb, Math.sin(ang) * bump);
}

function hubAnchorsForKeys(
  keys: readonly string[],
  hubPositions: ReadonlyMap<string, THREE.Vector3>,
): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  for (const k of keys) {
    const p = hubPositions.get(k);
    if (p && p.lengthSq() > 1e-14) pts.push(p);
  }
  return pts;
}

function nudgeAwayFromHubAnchors(
  point: THREE.Vector3,
  anchors: readonly THREE.Vector3[],
  seed: string,
  hubSphereRadius: number,
): THREE.Vector3 {
  const p = point.clone();
  const minSep = hubSphereRadius * 0.14;
  for (let pass = 0; pass < 6; pass++) {
    let hit = false;
    for (let i = 0; i < anchors.length; i++) {
      const hp = anchors[i]!;
      if (p.distanceTo(hp) >= minSep) continue;
      hit = true;
      const salt = `${seed}|nudge|${pass}|${i}`;
      let u = hp.clone().normalize();
      if (u.lengthSq() < 1e-10) u = new THREE.Vector3(1, 0, 0);
      const [ta, tb] = tangentPlaneBasis(u, salt);
      const ang = seededUnit(salt, "ndg") * Math.PI * 2;
      const step = hubSphereRadius * (0.08 + seededUnit(salt, "stp") * 0.1);
      p.addScaledVector(ta, Math.cos(ang) * step);
      p.addScaledVector(tb, Math.sin(ang) * step);
    }
    if (!hit) break;
  }
  return p;
}

function uniqueSortedTagsFromCategory(category: readonly string[]): readonly string[] {
  return [...new Set(category)].sort((a, b) => a.localeCompare(b));
}

export function buildTagGraphLayout(
  projects: readonly Project[],
  options?: { hubSphereRadius?: number; projectInnerRadius?: number },
): TagGraphLayout {
  const tagProjectCount = countTagProjects(projects);
  const hubTags = tagsSortedByProjectCount(tagProjectCount);
  const hubTagSet = new Set(hubTags);

  const hubSphereRadius =
    options?.hubSphereRadius ?? sphereRadiusForHubCount(hubTags.length);
  /** When set: pull each project dot onto that radius along the centroid ray. */
  const projectRadialOverride = options?.projectInnerRadius;

  const hubPositions = new Map<string, Vector3>();
  const spherePoints = fibonacciSpherePoints(hubTags.length, hubSphereRadius);
  hubTags.forEach((tag, i) => {
    hubPositions.set(tag, spherePoints[i] ?? new THREE.Vector3(0, 0, 0));
  });

  const projectNodes: TagGraphProjectNode[] = [];
  const links: { fromId: string; toId: string }[] = [];

  for (const project of projects) {
    const id = `project:${project.name}`;
    const tagsUniqueSorted = uniqueSortedTagsFromCategory(project.category);
    const hubTagsOnProject = project.category.filter((t) => hubTagSet.has(t));
    const orphanTagsOnProject = project.category.filter((t) => !hubTagSet.has(t));

    const position = new THREE.Vector3();
    if (hubTagsOnProject.length > 0) {
      const hubKeys = [...new Set(hubTagsOnProject)];
      const anchors = hubAnchorsForKeys(hubKeys, hubPositions);

      let merged: THREE.Vector3;
      if (hubKeys.length === 1) {
        merged = besideHubAnchor(hubPositions.get(hubKeys[0]!)!, project.name, hubSphereRadius);
      } else {
        const raw = meanHubPosition(hubKeys, hubPositions);
        merged = tinyCentroidSeparation(raw, project.name, hubSphereRadius);
        merged = nudgeAwayFromHubAnchors(merged, anchors, project.name, hubSphereRadius);
      }

      if (projectRadialOverride != null && merged.lengthSq() > 1e-12) {
        merged = merged.normalize().multiplyScalar(projectRadialOverride);
      }
      position.copy(merged);
    } else {
      const h = hashStringToUint32(project.name);
      const theta = (h % 360) * (Math.PI / 180);
      const phi = ((h >>> 8) % 180) * (Math.PI / 180);
      const rho =
        projectRadialOverride ?? hubSphereRadius * (0.25 + seededUnit(project.name, "orph") * 0.52);
      position.setFromSphericalCoords(rho, phi, theta);
    }

    projectNodes.push({
      id,
      label: project.name,
      description: project.description,
      hubTagsOnProject,
      orphanTagsOnProject,
      tagsUniqueSorted,
      position,
    });

    for (const tag of [...new Set(hubTagsOnProject)]) {
      links.push({ fromId: id, toId: `hub:${tag}` });
    }
  }

  const hubs: TagGraphHub[] = hubTags.map((tag) => ({
    tag,
    projectCount: tagProjectCount.get(tag) ?? 0,
    position: hubPositions.get(tag) ?? new THREE.Vector3(),
  }));

  return {
    hubs,
    hubTagSet,
    hubPositions,
    tagProjectCount,
    projects: projectNodes,
    links,
  };
}

export function exclusiveTagsForProject(
  tagProjectCount: ReadonlyMap<string, number>,
  projectTags: readonly string[],
): string[] {
  return projectTags.filter((t) => (tagProjectCount.get(t) ?? 0) === 1);
}
