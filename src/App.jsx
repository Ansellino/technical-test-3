import { useState, useEffect, useMemo, useCallback } from 'react'

function App() {
  // Issue 2: State management bisa lebih baik
  const [todos, setTodos] = useState([])
  const [input, setInput] = useState('')
  const [filter, setFilter] = useState('all')

  // Issue 3: useEffect tanpa dependency array yang tepat
  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('todos')
    if (saved) {
      setTodos(JSON.parse(saved))
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
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              addTodo()
            }
          }}
          placeholder="What needs to be done?"
        />
        <button onClick={addTodo}>Add</button>
      </div>

      {/* Issue 12: Inline styles (inconsistent dengan CSS file) */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button
          onClick={() => setFilter('all')}
          style={{ background: filter === 'all' ? '#28a745' : '#007bff' }}
        >
          All
        </button>
        <button
          onClick={() => setFilter('active')}
          style={{ background: filter === 'active' ? '#28a745' : '#007bff' }}
        >
          Active
        </button>
        <button
          onClick={() => setFilter('completed')}
          style={{ background: filter === 'completed' ? '#28a745' : '#007bff' }}
        >
          Completed
        </button>
      </div>

      <div className="todo-list">
        {/* Issue 13: Tidak ada handling untuk empty state */}
        {filteredTodos.map((todo) => (
          // Issue 14: Key menggunakan index bisa lebih baik dengan ID
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
        ))}
      </div>

      <div className="stats">
        <p>Total: {stats.total} | Active: {stats.active} | Completed: {stats.completed}</p>
      </div>

      {/* Issue 16: Debug code yang tertinggal */}
      {console.log('Rendering with todos:', todos)}
    </div>
  )
}

export default App
