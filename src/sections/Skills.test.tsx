import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@/theme/ThemeProvider";
import { Skills } from "./Skills";
import { skills } from "@/content/skills";

test("renders all skill labels", () => {
  render(<ThemeProvider><Skills /></ThemeProvider>);
  for (const s of skills) expect(screen.getByText(s.label)).toBeInTheDocument();
});
