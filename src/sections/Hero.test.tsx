import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@/theme/ThemeProvider";
import { Hero } from "./Hero";
import { profile } from "@/content/profile";

test("renders identity and CTAs", () => {
  render(<ThemeProvider><Hero /></ThemeProvider>);
  expect(screen.getByRole("heading", { name: profile.name })).toBeInTheDocument();
  expect(screen.getByText(profile.tagline)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /view work/i })).toHaveAttribute("href", "#projects");
});
