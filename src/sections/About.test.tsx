import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@/theme/ThemeProvider";
import { About } from "./About";
import { profile } from "@/content/profile";

test("renders bio", () => {
  render(<ThemeProvider><About /></ThemeProvider>);
  expect(screen.getByRole("heading", { name: /about/i })).toBeInTheDocument();
  expect(screen.getByText(profile.bio)).toBeInTheDocument();
});
