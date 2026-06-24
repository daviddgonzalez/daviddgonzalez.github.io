import { render, screen } from "@testing-library/react";
import { ProjectCard } from "./ProjectCard";
import type { Project } from "@/content/types";

const p: Project = {
  id: "x", name: "DevDash", blurb: "A dashboard.", description: "...",
  tech: ["React", "Node"], links: { repo: "https://example.com" }, legoBuild: "computer",
};

test("renders project details, tags, link and an svg build", () => {
  const { container } = render(<ProjectCard project={p} />);
  expect(screen.getByRole("heading", { name: "DevDash" })).toBeInTheDocument();
  expect(screen.getByText("React")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /repo/i })).toHaveAttribute("href", "https://example.com");
  expect(container.querySelector("svg")).toBeInTheDocument();
});
