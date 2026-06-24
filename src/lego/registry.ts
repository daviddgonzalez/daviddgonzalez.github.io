import type { BuildKey } from "@/content/types";
import { Submarine } from "./builds/Submarine";
import { Receipt } from "./builds/Receipt";
import { Pose } from "./builds/Pose";
import { Tree } from "./builds/Tree";
import { Judge } from "./builds/Judge";
import { Chalkboard } from "./builds/Chalkboard";
import { Meeting } from "./builds/Meeting";
import { BrickStack } from "./builds/BrickStack";

type BuildComponent = React.ComponentType<{ className?: string }>;

const REGISTRY: Record<BuildKey, BuildComponent> = {
  submarine: Submarine,
  receipt: Receipt,
  pose: Pose,
  tree: Tree,
  judge: Judge,
  chalkboard: Chalkboard,
  meeting: Meeting,
  stack: BrickStack,
};

export function getBuild(key: BuildKey): BuildComponent {
  return REGISTRY[key] ?? BrickStack;
}
