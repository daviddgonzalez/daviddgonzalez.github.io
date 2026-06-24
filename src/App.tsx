import { ThemeProvider } from "@/theme/ThemeProvider";
import { Nav } from "@/components/Nav";

export default function App() {
  return (
    <ThemeProvider>
      <a id="top" />
      <Nav />
      <main>{/* sections added in later tasks */}</main>
    </ThemeProvider>
  );
}
