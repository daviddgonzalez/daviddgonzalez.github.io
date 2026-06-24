import { render } from "@testing-library/react";
import { Brick } from "./Brick";
import { Minifigure } from "./Minifigure";

test("Brick renders an aria-hidden svg with the given color", () => {
  const { container } = render(<Brick color="#d01012" studs={3} data-testid="b" />);
  const svg = container.querySelector("svg")!;
  expect(svg).toBeInTheDocument();
  expect(svg).toHaveAttribute("aria-hidden", "true");
  expect(container.querySelector('[fill="#d01012"]')).toBeTruthy();
});

test("Minifigure renders an svg", () => {
  const { container } = render(<Minifigure />);
  expect(container.querySelector("svg")).toBeInTheDocument();
});
