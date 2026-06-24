import { ThemeProvider } from "@/theme/ThemeProvider";
import { Nav } from "@/components/Nav";
import { Hero } from "@/sections/Hero";
import { About } from "@/sections/About";
import { Education } from "@/sections/Education";
import { Projects } from "@/sections/Projects";
import { Experience } from "@/sections/Experience";
import { Skills } from "@/sections/Skills";
import { Contact } from "@/sections/Contact";

export default function App() {
  return (
    <ThemeProvider>
      <a id="top" />
      <Nav />
      <main>
        <Hero />
        <About />
        <Education />
        <Projects />
        <Experience />
        <Skills />
        <Contact />
      </main>
    </ThemeProvider>
  );
}
