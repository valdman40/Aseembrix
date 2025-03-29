import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import styled from 'styled-components';
import Input from '../components/StyledInput';
import Card from '../components/StyledCard';
import StyledButton from '../components/StyledButton';
import { getText } from '../i18n/lang';

const Title = styled.h2`
  color: #2196F3;
`;

const Button = styled(StyledButton)`
  background-color: #2196F3;
  &:hover {
    background-color: #1e88e5;
  }
`;

const ErrorText = styled.p`
  color: red;
`;

const LinkButton = styled(StyledButton)`
  background-color: transparent;
  color: #2196F3;
  border: 1px solid #2196F3;

  &:hover {
    background-color: #e3f2fd;
  }
`;

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', { username, password });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || getText('REGISTER_FAILED'));
    }
  };

  return (
    <Card>
      <Title>{getText('REGISTER')}</Title>
      {error && <ErrorText>{error}</ErrorText>}
      <form onSubmit={handleRegister}>
        <Input
          placeholder={getText('USERNAME')}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder={getText('PASSWORD')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit">{getText('REGISTER')}</Button>
      </form>

      <LinkButton onClick={() => navigate('/login')}>{getText('BACK_TO_LOGIN')}</LinkButton>
    </Card>
  );
};

export default Register;
