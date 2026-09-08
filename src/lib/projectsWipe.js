/** Tiny events so the mouth wipe, hero CTA and nav can share one animation. */
export const PROJECTS_ENTER = 'yin:projects-enter'
export const PROJECTS_EXIT = 'yin:projects-exit'

export function triggerProjectsEnter() {
  window.dispatchEvent(new CustomEvent(PROJECTS_ENTER))
}

export function triggerProjectsExit() {
  window.dispatchEvent(new CustomEvent(PROJECTS_EXIT))
}
