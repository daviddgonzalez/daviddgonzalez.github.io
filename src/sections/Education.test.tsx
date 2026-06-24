import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@/theme/ThemeProvider";
import { Education } from "./Education";
import { education } from "@/content/education";

test("renders school and degree", () => {
  render(<ThemeProvider><Education /></ThemeProvider>);
  expect(screen.getByRole("heading", { name: /education/i })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: education[0].school })).toBeInTheDocument();
  expect(screen.getByText(education[0].degree)).toBeInTheDocument();
});
