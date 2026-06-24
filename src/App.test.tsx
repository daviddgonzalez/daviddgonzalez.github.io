import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders the nav brand", () => {
  render(<App />);
  expect(screen.getAllByText("David Gonzalez").length).toBeGreaterThan(0);
});
