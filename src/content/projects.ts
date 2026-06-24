import type { Project } from "./types";

// NOTE: repo/demo links are intentionally omitted (not on the résumé). Add a
// `links: { repo: "...", demo: "..." }` to any project to surface its buttons.
export const projects: Project[] = [
  {
    id: "ledgr",
    name: "Ledgr",
    blurb: "Bank of America Code-a-thon finalist — receipts to ledger via a vision-LLM pipeline.",
    description:
      "An async FastAPI backend uses LiteLLM to prompt Gemma-3 for structured JSON extraction of receipt data, with an EasyOCR + custom regex parser as fallback. The frontend is a unified Bun/Turborepo monorepo: a SvelteKit web dashboard, a React Native mobile client, and a PostgreSQL database, deployed via Docker and Railway.",
    tech: ["FastAPI", "LiteLLM", "SvelteKit", "React Native", "Bun", "PostgreSQL", "Docker"],
    links: {},
    legoBuild: "phone",
  },
  {
    id: "mypose",
    name: "MyPose",
    blurb: "Personalized biomechanical evaluation with a calibrated Siamese pose model.",
    description:
      "A user-calibrated Siamese network on a PyTorch ST-GCN base maps individual kinematic manifolds for personalized biomechanical evaluation. An async FastAPI + MediaPipe pipeline extracts 33-node skeletal graphs into pgvector for fast spatial-temporal search, and a C++/pybind11 module uses Dynamic Time Warping to align sequences and isolate joint-angle deviations.",
    tech: ["PyTorch", "OpenCV", "C++", "FastAPI", "Supabase", "React"],
    links: { demo: "https://my-pose-two.vercel.app/" },
    legoBuild: "computer",
  },
  {
    id: "traceandpace",
    name: "TraceAndPace",
    blurb: "Browser tree-comparison engine in C++/WebAssembly handling a million data points.",
    description:
      "A multithreaded C++ backend performs concurrent tree operations while ensuring comparison validity, compiled to WebAssembly via Emscripten for the browser. A custom node-condensation algorithm reduces 1,000,000 data points into 50 recursive nodes for fast, legible visualization.",
    tech: ["C++", "WebAssembly", "Emscripten", "React", "TypeScript"],
    links: { demo: "https://trace-and-pace.vercel.app/" },
    legoBuild: "stack",
  },
];
