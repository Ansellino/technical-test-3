import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import fs from 'node:fs'
import path from 'node:path'
import App from './App'
import { renderApp, seedLocalStorage } from './test/helpers.jsx'
import { xssPayload } from './test/fixtures'

describe('App — Security', () => {
  it('T-06: renders user input as plain text, not HTML (no XSS)', () => {
    const { user } = renderApp()
    user.type(screen.getByLabelText(/todo/i), xssPayload)
    user.click(screen.getByText('Add'))

    expect(screen.getByText(xssPayload)).toBeInTheDocument()
    expect(document.querySelector('img')).toBeNull()
    expect(window.__xss).toBeUndefined()
  })

  it('T-07: does not contain hardcoded API keys in App.jsx', () => {
    const source = fs.readFileSync(
      path.resolve(__dirname, './App.jsx'),
      'utf8'
    )
    expect(source).not.toMatch(/sk-[a-zA-Z0-9]{8,}/)
    expect(source).not.toMatch(/API_KEY\s*=\s*['"`]/)
  })
})

describe('App — Persistence', () => {
  it('T-08: restores todos from localStorage on mount', () => {
    seedLocalStorage([
      { id: 'a', text: 'Persisted todo', completed: false, createdAt: '' },
    ])
    render(<App />)
    expect(screen.getByText('Persisted todo')).toBeInTheDocument()
  })

  it('T-09: persists todos to localStorage when added', () => {
    const { user } = renderApp()
    user.type(screen.getByLabelText(/todo/i), 'Persist me')
    user.click(screen.getByText('Add'))

    const stored = JSON.parse(localStorage.getItem('todos'))
    expect(stored).toHaveLength(1)
    expect(stored[0].text).toBe('Persist me')
  })

  it('T-10: does not crash when localStorage contains malformed JSON', () => {
    localStorage.setItem('todos', '{ not valid json')
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<App />)).not.toThrow()
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0)
  })
})

describe('App — Edge cases & Filter', () => {
  it('T-11: shows empty state when there are no todos', () => {
    render(<App />)
    expect(screen.getByText(/no todos/i)).toBeInTheDocument()
  })

  it('T-12: shows empty state when filter has no matches', () => {
    const { user } = renderApp()
    user.type(screen.getByLabelText(/todo/i), 'Active task')
    user.click(screen.getByText('Add'))

    user.click(screen.getByRole('button', { name: /^completed$/i }))
    expect(screen.getByText(/no todos/i)).toBeInTheDocument()
  })

  it('T-13: filter "Active" hides completed todos', () => {
    const { user } = renderApp()
    user.type(screen.getByLabelText(/todo/i), 'Active task')
    user.click(screen.getByText('Add'))
    user.type(screen.getByLabelText(/todo/i), 'Done task')
    user.click(screen.getByText('Add'))

    user.click(screen.getByRole('checkbox', { name: /Done task/i }))
    user.click(screen.getByRole('button', { name: /^active$/i }))

    expect(screen.getByText('Active task')).toBeInTheDocument()
    expect(screen.queryByText('Done task')).not.toBeInTheDocument()
  })

  it('T-14: filter "Completed" hides active todos', () => {
    const { user } = renderApp()
    user.type(screen.getByLabelText(/todo/i), 'Active task')
    user.click(screen.getByText('Add'))
    user.type(screen.getByLabelText(/todo/i), 'Done task')
    user.click(screen.getByText('Add'))

    user.click(screen.getByRole('checkbox', { name: /Done task/i }))
    user.click(screen.getByRole('button', { name: /^completed$/i }))

    expect(screen.getByText('Done task')).toBeInTheDocument()
    expect(screen.queryByText('Active task')).not.toBeInTheDocument()
  })

  it('T-15: does not add a todo when input is only whitespace', () => {
    const { user } = renderApp()
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

    user.type(screen.getByLabelText(/todo/i), '   ')
    user.click(screen.getByText('Add'))

    expect(screen.queryAllByRole('checkbox')).toHaveLength(0)
    expect(alertSpy).toHaveBeenCalled()
  })

  it('T-16: submits the todo when Enter is pressed', () => {
    const { user } = renderApp()
    user.type(screen.getByLabelText(/todo/i), 'Via Enter{Enter}')
    expect(screen.getByText('Via Enter')).toBeInTheDocument()
  })

  it('T-17: generates unique IDs for todos added in the same tick', () => {
    const { user } = renderApp()
    vi.spyOn(Date, 'now').mockReturnValue(1700000000000)

    user.type(screen.getByLabelText(/todo/i), 'First')
    user.click(screen.getByText('Add'))
    user.type(screen.getByLabelText(/todo/i), 'Second')
    user.click(screen.getByText('Add'))

    const stored = JSON.parse(localStorage.getItem('todos'))
    expect(stored).toHaveLength(2)
    expect(stored[0].id).not.toBe(stored[1].id)
  })
})

describe('App — Accessibility', () => {
  it('T-18: input has an accessible label', () => {
    render(<App />)
    expect(screen.getByLabelText(/todo/i)).toBeInTheDocument()
  })

  it('T-19: each todo checkbox is named by its todo text', () => {
    const { user } = renderApp()
    user.type(screen.getByLabelText(/todo/i), 'Buy milk')
    user.click(screen.getByText('Add'))

    expect(
      screen.getByRole('checkbox', { name: /Buy milk/i })
    ).toBeInTheDocument()
  })
})
