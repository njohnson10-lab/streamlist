import React, { useState } from 'react';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [tasks, setTasks] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

  // Handle adding a new stream item
  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim() === '') return;
    
    const newTask = {
      id: Date.now(),
      text: inputValue,
      completed: false
    };
    
    setTasks([...tasks, newTask]);
    setInputValue(''); // Clears input after submit
  };

  // Handle deleting an item
  const handleDelete = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  // Handle completing an item
  const handleComplete = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  // Handle starting the edit process
  const startEdit = (task) => {
    setEditingId(task.id);
    setEditValue(task.text);
  };

  // Handle saving the edited item
  const saveEdit = (id) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, text: editValue } : task
    ));
    setEditingId(null);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      {/* Navigation System */}
      <nav style={{ marginBottom: '20px', paddingBottom: '10px', borderBottom: '2px solid #ccc' }}>
        <button onClick={() => setCurrentView('home')} style={{ marginRight: '10px' }}>
          <span className="material-icons" style={{ verticalAlign: 'middle' }}>home</span> Home
        </button>
        <button onClick={() => setCurrentView('streamlist')}>
          <span className="material-icons" style={{ verticalAlign: 'middle' }}>list</span> My StreamList
        </button>
      </nav>

      {/* Main Content Area */}
      {currentView === 'home' ? (
        <div>
          <h1>Welcome to StreamList</h1>
          <p>Navigate to "My StreamList" to manage your viewing queue.</p>
        </div>
      ) : (
        <div>
          <h2>Manage Your StreamList</h2>
          
          <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
            <input 
              type="text" 
              value={inputValue} 
              onChange={(e) => setInputValue(e.target.value)} 
              placeholder="Add a new movie or show..."
              style={{ padding: '5px', width: '300px' }}
            />
            <button type="submit" style={{ marginLeft: '10px' }}>
              <span className="material-icons" style={{ verticalAlign: 'middle' }}>add_circle</span> Add
            </button>
          </form>

          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {tasks.map(task => (
              <li key={task.id} style={{ 
                margin: '10px 0', 
                padding: '10px', 
                border: '1px solid #444',
                textDecoration: task.completed ? 'line-through' : 'none',
                backgroundColor: task.completed ? '#1b5e20' : '#222',
                color: '#ffffff',
                borderRadius: '5px'
              }}>
                
                {editingId === task.id ? (
                  <span>
                    <input 
                      type="text" 
                      value={editValue} 
                      onChange={(e) => setEditValue(e.target.value)} 
                    />
                    <button onClick={() => saveEdit(task.id)}>Save</button>
                  </span>
                ) : (
                  <span style={{ fontSize: '18px' }}>{task.text}</span>
                )}

                <div style={{ marginTop: '10px' }}>
                  <button onClick={() => handleComplete(task.id)} style={{ marginRight: '5px' }}>
                    <span className="material-icons" style={{ verticalAlign: 'middle' }}>done</span>
                  </button>
                  <button onClick={() => startEdit(task)} style={{ marginRight: '5px' }}>
                    <span className="material-icons" style={{ verticalAlign: 'middle' }}>edit</span>
                  </button>
                  <button onClick={() => handleDelete(task.id)}>
                    <span className="material-icons" style={{ verticalAlign: 'middle' }}>delete</span>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;