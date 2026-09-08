import { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Backdrop } from './components/Backdrop'
import { Footer } from './components/Footer'
import { MouthWipe } from './components/MouthWipe'
import { Navbar } from './components/Navbar'
import { ThemeProvider } from './context/ThemeProvider'
import { WipeNavigateProvider } from './context/WipeNavigate'
import { SITE } from './data/site'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ProjectsPage } from './pages/ProjectsPage'

export default function App() {
  useEffect(() => {
    document.title = SITE.title
  }, [])

  return (
    <ThemeProvider>
      <WipeNavigateProvider>
        <MouthWipe />
        <Backdrop />
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </WipeNavigateProvider>
    </ThemeProvider>
  )
}
