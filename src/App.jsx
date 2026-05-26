import { useState, useEffect, useMemo, useCallback } from 'react'

function App() {
  // Issue 2: State management bisa lebih baik
  const [todos, setTodos] = useState([])
  const [input, setInput] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    try {
      const saved = localStorage.getItem('todos')
      if (saved) {
        setTodos(JSON.parse(saved))
      }
    } catch {
      setTodos([])
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos))
  }, [todos])

  const addTodo = useCallback(() => {
    if (input.trim() === '') {
      alert('Please enter a todo')
      return
    }

    const newTodo = {
      id: crypto.randomUUID(),
      text: input,
      completed: false,
      createdAt: new Date().toISOString()
    }

    setTodos((prev) => [...prev, newTodo])
    setInput('')
  }, [input])

  // Issue 7: Tidak ada error handling
  const deleteTodo = useCallback((id) => {
    setTodos((prev) => prev.filter(todo => todo.id !== id))
  }, [])

  const toggleTodo = useCallback((id) => {
    setTodos((prev) => prev.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))
  }, [])

  const handleInputChange = useCallback((e) => {
    setInput(e.target.value)
  }, [])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      addTodo()
    }
  }, [addTodo])

  const handleFilterClick = useCallback((e) => {
    setFilter(e.currentTarget.dataset.filter)
  }, [])

  const filteredTodos = useMemo(() => {
    if (filter === 'active') {
      return todos.filter(todo => !todo.completed)
    }
    if (filter === 'completed') {
      return todos.filter(todo => todo.completed)
    }
    return todos
  }, [todos, filter])

  const stats = useMemo(() => ({
    total: todos.length,
    completed: todos.filter(t => t.completed).length,
    active: todos.filter(t => !t.completed).length
  }), [todos])

  // Issue 10: Inline event handler dengan arrow function (re-create setiap render)
  return (
    <div className="app">
      <h1>My Todo List</h1>

      <div className="input-section">
        <label htmlFor="todo-input" className="visually-hidden">
          Todo text
        </label>
        <input
          id="todo-input"
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="What needs to be done?"
        />
        <button onClick={addTodo}>Add</button>
      </div>

      <div className="filter-section">
        <button
          data-filter="all"
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={handleFilterClick}
        >
          All
        </button>
        <button
          data-filter="active"
          className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
          onClick={handleFilterClick}
        >
          Active
        </button>
        <button
          data-filter="completed"
          className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
          onClick={handleFilterClick}
        >
          Completed
        </button>
      </div>

      <div className="todo-list">
        {filteredTodos.length === 0 ? (
          <p className="empty-state">No todos here.</p>
        ) : (
          filteredTodos.map((todo) => (
            <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
                aria-label={todo.text}
              />
              <span>{todo.text}</span>
              <button
                className="delete-btn"
                onClick={() => deleteTodo(todo.id)}
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>

      <div className="stats">
        <p>Total: {stats.total} | Active: {stats.active} | Completed: {stats.completed}</p>
      </div>
    </div>
  )
}

export default App
