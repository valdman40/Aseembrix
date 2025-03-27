import React, { useEffect, useState } from 'react';
import api from '../services/api';
import styled from 'styled-components';

// Styled Components
const Container = styled.div`
  max-width: 600px;
  margin: 50px auto;
  padding: 2rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  background-color: #f9f9f9;
`;

const Title = styled.h2`
  color: #4CAF50;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem;
  margin: 0.5rem 0;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const Button = styled.button`
  width: 100%;
  padding: 0.8rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 1rem;

  &:hover {
    background-color: #45a049;
  }
`;

const LogoutButton = styled(Button)`
  background-color: #f44336;
  &:hover {
    background-color: #d32f2f;
  }
`;

const TaskListContainer = styled.ul`
  list-style: none;
  padding: 0;
`;

const TaskContainer = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 1rem;
  margin: 0.5rem 0;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const DeleteButton = styled.button`
  background-color: #f44336;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #d32f2f;
  }
`;

interface Task {
  id: string;
  title: string;
  description: string
}

const TaskRender: React.FC<{ task: Task; handleDeleteTask: (id: string) => void }> = ({ task, handleDeleteTask }) => {
  const { id, title, description } = task;
  return <TaskContainer>
    <div>
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
    <DeleteButton onClick={() => handleDeleteTask(id)}>Delete</DeleteButton>
  </TaskContainer>
}

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  // Fetch tasks from backend
  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks');
      setTasks(response.data.tasks);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch tasks');
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Create a new task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/tasks', { title, description });
      setTasks([...tasks, response.data.task]); // Add new task to state
      setTitle('');
      setDescription('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create task');
    }
  };

  // Delete a task
  const handleDeleteTask = async (taskId: string) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter((task) => task.id !== taskId)); // Remove task from state
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete task');
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <Container>
      <Title>Task List</Title>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleCreateTask}>
        <Input type="text" placeholder="Task Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <Input type="text" placeholder="Task Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
        <Button type="submit">Add Task</Button>
      </form>

      <TaskListContainer>
        {tasks.map((task) => <TaskRender key={task.id} task={task} handleDeleteTask={handleDeleteTask} />)}
      </TaskListContainer>

      <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
    </Container>
  );
};

export default TaskList;
