import { render } from "@testing-library/react";
import { ThemeProvider } from "@/theme/ThemeProvider";
import { THEME_STORAGE_KEY } from "@/theme/useTheme";
import { DecorationLayer } from "./DecorationLayer";

beforeEach(() => localStorage.clear());

test("renders nothing in default theme", () => {
  localStorage.setItem(THEME_STORAGE_KEY, "default");
  const { container } = render(<ThemeProvider><DecorationLayer /></ThemeProvider>);
  expect(container.querySelector("svg")).toBeNull();
});

test("renders decoration in lego theme", () => {
  localStorage.setItem(THEME_STORAGE_KEY, "lego");
  const { container } = render(<ThemeProvider><DecorationLayer /></ThemeProvider>);
  expect(container.querySelector('[aria-hidden="true"]')).toBeTruthy();
  expect(container.querySelector("svg")).toBeInTheDocument();
});
