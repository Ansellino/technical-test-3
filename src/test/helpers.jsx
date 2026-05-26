import { render, fireEvent } from '@testing-library/react'
import App from '../App'

export function renderApp() {
  const utils = render(<App />)
  const user = {
    type: (el, text) => {
      const hasEnter = text.endsWith('{Enter}')
      const value = hasEnter ? text.replace('{Enter}', '') : text
      fireEvent.change(el, { target: { value } })
      if (hasEnter) fireEvent.keyDown(el, { key: 'Enter' })
    },
    click: (el) => fireEvent.click(el),
  }
  return { user, ...utils }
}

export function seedLocalStorage(todos) {
  localStorage.setItem('todos', JSON.stringify(todos))
}
