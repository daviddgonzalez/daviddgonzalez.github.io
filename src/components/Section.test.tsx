import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@/theme/ThemeProvider";
import { Section } from "./Section";

test("renders a section with id and children", () => {
  render(<ThemeProvider><Section id="about"><p>hi</p></Section></ThemeProvider>);
  const el = document.getElementById("about");
  expect(el?.tagName).toBe("SECTION");
  expect(screen.getByText("hi")).toBeInTheDocument();
});
