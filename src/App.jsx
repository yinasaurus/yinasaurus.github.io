import { About } from './components/About'
import { Backdrop } from './components/Backdrop'
import { Contact } from './components/Contact'
import { GithubActivity } from './components/GithubActivity'
import { Footer } from './components/Footer'
import { Hero } from './components/Hero'
import { Navbar } from './components/Navbar'
import { ProjectsGrid } from './components/ProjectsGrid'
import { TechStack } from './components/TechStack'
import { ThemeProvider } from './context/ThemeProvider'

export default function App() {
  return (
    <ThemeProvider>
      <Backdrop />
      <Navbar />
      <main>
        <Hero />
        <About />
        <TechStack />
        <ProjectsGrid />
        <GithubActivity />
        <Contact />
      </main>
      <Footer />
    </ThemeProvider>
  )
}
