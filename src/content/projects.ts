import type { Project } from "./types";

// NOTE: repo/demo links are intentionally omitted (not on the résumé). Add a
// `links: { repo: "...", demo: "..." }` to any project to surface its buttons.
export const projects: Project[] = [
  {
    id: "ledgr",
    name: "Ledgr",
    blurb: "Bank of America Code-a-thon finalist. Turns a photo of a receipt into structured ledger data.",
    description:
      "The backend is a FastAPI service that asks Gemma-3, through LiteLLM, to pull receipt fields into JSON, and falls back to EasyOCR with a regex parser when the model isn't confident. Everything lives in one Bun and Turborepo monorepo: a SvelteKit dashboard, a React Native app, and a PostgreSQL database, deployed on Docker and Railway.",
    tech: ["FastAPI", "LiteLLM", "SvelteKit", "React Native", "Bun", "PostgreSQL", "Docker"],
    links: {},
    legoBuild: "receipt",
  },
  {
    id: "mypose",
    name: "MyPose",
    blurb: "Personalized form-checking from video, with a pose model you calibrate to yourself.",
    description:
      "A Siamese network on a PyTorch ST-GCN base learns your own movement, so it judges form against you rather than a generic average. A FastAPI and MediaPipe pipeline pulls 33-point skeletons out of video and stores them in pgvector for fast similarity search, and a C++ module (via pybind11) uses Dynamic Time Warping to line up two motions and flag exactly which joint angles drift.",
    tech: ["PyTorch", "OpenCV", "C++", "FastAPI", "Supabase", "React"],
    links: { demo: "https://my-pose-two.vercel.app/" },
    legoBuild: "pose",
  },
  {
    id: "traceandpace",
    name: "TraceAndPace",
    blurb: "A tree-comparison engine that runs in the browser, written in C++ and compiled to WebAssembly.",
    description:
      "A multithreaded C++ core runs tree operations in parallel while keeping comparisons consistent, then compiles to WebAssembly with Emscripten so the whole thing runs client-side. A condensation algorithm I wrote collapses a million data points down to 50 nodes, which is what keeps the visualization both quick and readable.",
    tech: ["C++", "WebAssembly", "Emscripten", "React", "TypeScript"],
    links: { demo: "https://trace-and-pace.vercel.app/" },
    legoBuild: "tree",
  },
];
