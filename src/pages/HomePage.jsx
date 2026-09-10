import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { About } from '../components/About'
import { Contact } from '../components/Contact'
import { GithubActivity } from '../components/GithubActivity'
import { Hero } from '../components/Hero'
import { TechStack } from '../components/TechStack'

export function HomePage() {
  const location = useLocation()

  useEffect(() => {
    const id = location.hash.replace('#', '')
    if (!id) return
    const node = document.getElementById(id)
    node?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [location.hash])

  return (
    <>
      <Hero />
      <About />
      <TechStack />
      <GithubActivity />
      <Contact />
    </>
  )
}
