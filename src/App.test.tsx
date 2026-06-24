import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders the nav brand", () => {
  render(<App />);
  expect(screen.getByText("David Gonzalez")).toBeInTheDocument();
});
