import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "./ThemeProvider";
import { ThemeToggle } from "./ThemeToggle";

beforeEach(() => localStorage.clear());

test("toggles theme on click", async () => {
  render(<ThemeProvider><ThemeToggle /></ThemeProvider>);
  const btn = screen.getByRole("button", { name: /lego theme/i });
  expect(btn).toHaveAttribute("aria-pressed", "false");
  await userEvent.click(btn);
  expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
});
