import React, { useEffect, useState } from 'react';
import api from '../services/api';
import styled from 'styled-components';
import Input from '../components/StyledInput';
import Button from '../components/StyledButton';
import StyledCard from '../components/StyledCard';
import { Task } from '../types/tasks';
import { getText } from '../i18n/lang';

// Styled Components
const TasksCard = styled(StyledCard)`
  max-width: 600px;
  margin: 50px auto;
  background-color: #f9f9f9;
`;

const Title = styled.h2`
  color: #4CAF50;
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

const DeleteButton = styled(Button)`
  background-color: #f44336;
  width: 100px;
  margin-top: 0;
  &:hover {
    background-color: #d32f2f;
  }
`;

const TaskRender: React.FC<{ task: Task; handleDeleteTask: (id: string) => void }> = ({ task, handleDeleteTask }) => {
  const { id, title, description } = task;
  return <TaskContainer>
    <div>
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
    <DeleteButton onClick={() => handleDeleteTask(id)}>{getText('DELETE')}</DeleteButton>
  </TaskContainer>
}

const token = localStorage.getItem('token');

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
      setError(err.response?.data?.message || getText('TASKS_FETCH_FAILED'));
    }
  };

  useEffect(() => {
    if(token){
      fetchTasks();
    }
  }, [token]);

  // Create a new task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/tasks', { title, description });
      setTasks([...tasks, response.data.task]); // Add new task to state
      setTitle('');
      setDescription('');
    } catch (err: any) {
      setError(err.response?.data?.message || getText('TASK_CREATED_FAILED'));
    }
  };

  // Delete a task
  const handleDeleteTask = async (taskId: string) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter((task) => task.id !== taskId)); // Remove task from state
    } catch (err: any) {
      setError(err.response?.data?.message || getText('TASK_DELETE_FAILED'));
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <TasksCard>
      <Title>{getText('TASK_LIST')}</Title>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleCreateTask}>
        <Input type="text" placeholder={getText('TASK_TITLE')} value={title} onChange={(e) => setTitle(e.target.value)} required />
        <Input type="text" placeholder={getText('TASK_DESCRIPTION')} value={description} onChange={(e) => setDescription(e.target.value)} required />
        <Button type="submit">{getText('ADD_TASK')}</Button>
      </form>

      <TaskListContainer>
        {tasks.map((task) => <TaskRender key={task.id} task={task} handleDeleteTask={handleDeleteTask} />)}
      </TaskListContainer>

      <LogoutButton onClick={handleLogout}>{getText('LOGOUT')}</LogoutButton>
    </TasksCard>
  );
};

export default TaskList;
