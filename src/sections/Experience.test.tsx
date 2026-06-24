import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@/theme/ThemeProvider";
import { Experience } from "./Experience";
import { profile } from "@/content/profile";

test("renders roles and a resume link", () => {
  render(<ThemeProvider><Experience /></ThemeProvider>);
  expect(screen.getByRole("heading", { name: /experience/i })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /résumé|resume/i })).toHaveAttribute("href", profile.resumeUrl);
});
