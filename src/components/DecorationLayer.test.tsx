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

test("plays the assemble drop whenever the lego decoration mounts", () => {
  localStorage.setItem(THEME_STORAGE_KEY, "lego");
  const { container } = render(<ThemeProvider><DecorationLayer /></ThemeProvider>);
  expect(container.querySelector(".brick-drop")).toBeTruthy();
});

test("skips the assemble drop when reduced motion is preferred", () => {
  localStorage.setItem(THEME_STORAGE_KEY, "lego");
  const original = window.matchMedia;
  window.matchMedia = ((query: string) => ({
    matches: true,
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent() {
      return false;
    },
  })) as unknown as typeof window.matchMedia;
  try {
    const { container } = render(<ThemeProvider><DecorationLayer /></ThemeProvider>);
    expect(container.querySelector(".brick-drop")).toBeNull();
    expect(container.querySelector("svg")).toBeInTheDocument();
  } finally {
    window.matchMedia = original;
  }
});
