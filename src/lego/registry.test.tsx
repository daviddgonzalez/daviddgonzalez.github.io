import { render } from "@testing-library/react";
import { getBuild } from "./registry";

test("resolves each known build key to an svg component", () => {
  for (const key of ["computer", "phone", "brickLogo", "stack"] as const) {
    const Build = getBuild(key);
    const { container } = render(<Build />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  }
});

test("falls back to BrickStack for unknown keys", () => {
  // @ts-expect-error testing runtime fallback
  const Build = getBuild("nope");
  const { container } = render(<Build />);
  expect(container.querySelector("svg")).toBeInTheDocument();
});
