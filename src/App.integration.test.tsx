import { render, screen, cleanup } from "@testing-library/react";
import { axe } from "vitest-axe";
import { THEME_STORAGE_KEY } from "@/theme/useTheme";
import App from "./App";

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  cleanup();
});

test.each(["default", "lego"])("renders all sections in %s theme", (theme) => {
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  render(<App />);
  for (const name of [/about/i, /projects/i, /experience/i, /skills/i, /contact/i]) {
    expect(screen.getByRole("heading", { name })).toBeInTheDocument();
  }
});

test("has no axe violations", async () => {
  const { container } = render(<App />);
  expect(await axe(container)).toHaveNoViolations();
});
