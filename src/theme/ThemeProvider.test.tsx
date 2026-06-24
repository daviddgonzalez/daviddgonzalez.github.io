import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "./ThemeProvider";
import { useTheme, THEME_STORAGE_KEY } from "./useTheme";

function Probe() {
  const { theme, toggle, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button onClick={toggle}>toggle</button>
      <button onClick={() => setTheme("lego")}>set-lego</button>
    </div>
  );
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
});

test("defaults to 'default' with no stored value", () => {
  render(<ThemeProvider><Probe /></ThemeProvider>);
  expect(screen.getByTestId("theme")).toHaveTextContent("default");
  expect(document.documentElement.dataset.theme).toBe("default");
});

test("restores a valid stored theme", () => {
  localStorage.setItem(THEME_STORAGE_KEY, "lego");
  render(<ThemeProvider><Probe /></ThemeProvider>);
  expect(screen.getByTestId("theme")).toHaveTextContent("lego");
});

test("falls back to default for invalid stored theme", () => {
  localStorage.setItem(THEME_STORAGE_KEY, "neon");
  render(<ThemeProvider><Probe /></ThemeProvider>);
  expect(screen.getByTestId("theme")).toHaveTextContent("default");
});

test("toggle flips theme and persists", async () => {
  render(<ThemeProvider><Probe /></ThemeProvider>);
  await userEvent.click(screen.getByText("toggle"));
  expect(screen.getByTestId("theme")).toHaveTextContent("lego");
  expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("lego");
  expect(document.documentElement.dataset.theme).toBe("lego");
});

test("setTheme sets explicitly", async () => {
  render(<ThemeProvider><Probe /></ThemeProvider>);
  await userEvent.click(screen.getByText("set-lego"));
  expect(screen.getByTestId("theme")).toHaveTextContent("lego");
});

test("useTheme throws outside provider", () => {
  const spy = vi.spyOn(console, "error").mockImplementation(() => {});
  expect(() => render(<Probe />)).toThrow(/within a ThemeProvider/);
  spy.mockRestore();
});
