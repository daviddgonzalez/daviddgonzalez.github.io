import type { BuildKey } from "@/content/types";
import { LegoComputer } from "./builds/LegoComputer";
import { LegoPhone } from "./builds/LegoPhone";
import { BrickLogo } from "./builds/BrickLogo";
import { BrickStack } from "./builds/BrickStack";

type BuildComponent = React.ComponentType<Record<string, never>>;

const REGISTRY: Record<BuildKey, BuildComponent> = {
  computer: LegoComputer as BuildComponent,
  phone: LegoPhone as BuildComponent,
  brickLogo: BrickLogo as BuildComponent,
  stack: BrickStack as BuildComponent,
};

export function getBuild(key: BuildKey): BuildComponent {
  return REGISTRY[key] ?? BrickStack;
}
