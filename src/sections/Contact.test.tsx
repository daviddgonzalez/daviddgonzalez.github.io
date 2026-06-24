import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@/theme/ThemeProvider";
import { Contact } from "./Contact";
import { profile } from "@/content/profile";

test("renders a mailto link showing the address", () => {
  render(<ThemeProvider><Contact /></ThemeProvider>);
  expect(screen.getByRole("link", { name: profile.socials.email }))
    .toHaveAttribute("href", `mailto:${profile.socials.email}`);
});
