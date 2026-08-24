import React, { useState, useEffect, useRef } from 'react';
import API from './api';
import Auth from './Auth';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [tasks, setTasks] = useState([]);
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  
  // Filter, Search & Edit State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [formError, setFormError] = useState('');
  
  const alertedTasks = useRef(new Set());

  // Request browser notification permissions
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await API.get(`/tasks/?priority=${filterPriority}&search=${searchQuery}`);
      setTasks(res.data);
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
    }
  };

  useEffect(() => {
    if (token) fetchTasks();
  }, [token, filterPriority, searchQuery]);

  // Real-time duplicate title warning helper
  const duplicateSuggestion = !editingTaskId && title.trim().length > 0 &&
    tasks.some((t) => t.title.toLowerCase() === title.trim().toLowerCase());

  // Task Reminder Timer
  useEffect(() => {
    if (!token || tasks.length === 0) return;

    const interval = setInterval(() => {
      const now = new Date();
      tasks.forEach((task) => {
        if (!task.start_time || alertedTasks.current.has(task.id)) return;

        const taskStart = new Date(task.start_time);
        const diffInMinutes = (taskStart - now) / 60000;

        if (diffInMinutes <= 2 && diffInMinutes >= -1) {
          alertedTasks.current.add(task.id);
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification(`⏰ Task Starting: ${task.title}`, {
              body: `Priority: ${task.priority.toUpperCase()} | Starts: ${new Date(task.start_time).toLocaleTimeString()}`,
            });
          } else {
            alert(`⏰ REMINDER: Task "${task.title}" is scheduled to start now!`);
          }
        }
      });
    }, 15000);

    return () => clearInterval(interval);
  }, [tasks, token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!title.trim() || !priority || !startTime || !endTime) {
      setFormError('Please fill in all mandatory fields (Title, Priority, Start Time, and End Time).');
      return;
    }

    if (new Date(endTime) <= new Date(startTime)) {
      setFormError('End time must be after Start time.');
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      priority,
      start_time: new Date(startTime).toISOString(),
      end_time: new Date(endTime).toISOString(),
    };

    try {
      if (editingTaskId) {
        await API.put(`/tasks/${editingTaskId}`, payload);
      } else {
        await API.post('/tasks/', payload);
      }
      resetForm();
      fetchTasks();
    } catch (err) {
      setFormError(err.response?.data?.detail || 'An error occurred while saving the task.');
    }
  };

  const startEdit = (task) => {
    setEditingTaskId(task.id);
    setTitle(task.title);
    setDescription(task.description || '');
    setPriority(task.priority);
    setStartTime(task.start_time ? task.start_time.slice(0, 16) : '');
    setEndTime(task.end_time ? task.end_time.slice(0, 16) : '');
    setFormError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setStartTime('');
    setEndTime('');
    setEditingTaskId(null);
    setFormError('');
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await API.delete(`/tasks/${id}`);
      fetchTasks();
    } catch (err) {
      alert('Error deleting task');
    }
  };

  if (!token) return <Auth onLoginSuccess={() => setToken(localStorage.getItem('token'))} />;

  return (
    <div style={{ maxWidth: '800px', margin: '30px auto', padding: '24px', fontFamily: 'Segoe UI, sans-serif', color: '#e0e0e0', background: '#181818', borderRadius: '10px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333', paddingBottom: '16px' }}>
        <h2 style={{ margin: 0, color: '#fff' }}>Task Management System</h2>
        <button onClick={handleLogout} style={{ background: '#e53935', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Logout</button>
      </div>

      {/* Task Create / Edit Form */}
      <form onSubmit={handleSaveTask} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px', background: '#222', padding: '20px', borderRadius: '8px', border: '1px solid #333' }}>
        <h3 style={{ margin: '0 0 4px 0' }}>{editingTaskId ? "✏️ Edit Task" : "➕ Create New Task"}</h3>
        
        {formError && (
          <div style={{ background: '#441414', color: '#ff8585', padding: '10px', borderRadius: '4px', border: '1px solid #ff4444', fontSize: '14px' }}>
            {formError}
          </div>
        )}

        <div>
          <label style={{ fontSize: '13px', color: '#aaa' }}>Task Title *</label>
          <input 
            placeholder="Enter task title" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            required 
            style={{ width: '100%', padding: '10px', marginTop: '4px', background: '#303030', color: '#fff', border: duplicateSuggestion ? '1px solid #ff9800' : '1px solid #444', borderRadius: '4px', boxSizing: 'border-box' }}
          />
          {duplicateSuggestion && (
            <p style={{ margin: '4px 0 0 0', color: '#ffb74d', fontSize: '12px' }}>
              ⚠️ Notice: A task titled "<strong>{title}</strong>" already exists in your tasks.
            </p>
          )}
        </div>

        <div>
          <label style={{ fontSize: '13px', color: '#aaa' }}>Task Description</label>
          <textarea 
            placeholder="Enter task details (optional)" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            style={{ width: '100%', padding: '10px', marginTop: '4px', background: '#303030', color: '#fff', border: '1px solid #444', borderRadius: '4px', minHeight: '60px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '13px', color: '#aaa' }}>Priority *</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value)} required style={{ width: '100%', padding: '9px', marginTop: '4px', background: '#303030', color: '#fff', border: '1px solid #444', borderRadius: '4px' }}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '13px', color: '#aaa' }}>Start Time *</label>
            <input 
              type="datetime-local" 
              value={startTime} 
              onChange={(e) => setStartTime(e.target.value)} 
              required
              style={{ width: '100%', padding: '8px', marginTop: '4px', background: '#303030', color: '#fff', border: '1px solid #444', borderRadius: '4px', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', color: '#aaa' }}>End Time *</label>
            <input 
              type="datetime-local" 
              value={endTime} 
              onChange={(e) => setEndTime(e.target.value)} 
              required
              style={{ width: '100%', padding: '8px', marginTop: '4px', background: '#303030', color: '#fff', border: '1px solid #444', borderRadius: '4px', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
          <button type="submit" style={{ flex: 1, background: editingTaskId ? '#ff9800' : '#4CAF50', color: '#fff', border: 'none', padding: '10px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
            {editingTaskId ? "Update Task" : "Add Task"}
          </button>
          {editingTaskId && (
            <button type="button" onClick={resetForm} style={{ background: '#555', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '5px', cursor: 'pointer' }}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Live Search & Filter Controls */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '30px', alignItems: 'center', background: '#222', padding: '12px 16px', borderRadius: '8px' }}>
        <input 
          type="text"
          placeholder="🔍 Search tasks by title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flex: 2, padding: '9px 12px', background: '#303030', color: '#fff', border: '1px solid #444', borderRadius: '4px' }}
        />
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '13px', color: '#aaa' }}>Priority:</label>
          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} style={{ padding: '8px', background: '#303030', color: '#fff', border: '1px solid #444', borderRadius: '4px' }}>
            <option value="all">All</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
        {tasks.length === 0 ? (
          <p style={{ color: '#777', textAlign: 'center', margin: '30px 0' }}>No tasks found matching your criteria.</p>
        ) : (
          tasks.map((task) => (
            <div key={task.id} style={{ border: '1px solid #333', background: '#222', padding: '16px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h4 style={{ margin: 0, fontSize: '18px', color: '#fff' }}>{task.title}</h4>
                  <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: task.priority === 'high' ? '#7f1d1d' : task.priority === 'medium' ? '#78350f' : '#14532d', color: '#fff', fontWeight: 'bold' }}>
                    {task.priority.toUpperCase()}
                  </span>
                </div>
                {task.description && <p style={{ margin: '8px 0', color: '#aaa', fontSize: '14px' }}>{task.description}</p>}
                
                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#888', marginTop: '8px' }}>
                  <span>🚀 Start: {new Date(task.start_time).toLocaleString()}</span>
                  <span>🏁 End: {new Date(task.end_time).toLocaleString()}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginLeft: '12px' }}>
                <button onClick={() => startEdit(task)} style={{ background: '#2196F3', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Edit</button>
                <button onClick={() => handleDeleteTask(task.id)} style={{ background: '#d32f2f', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}