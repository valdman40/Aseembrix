import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import styled from 'styled-components';
import Input from '../components/StyledInput';
import Card from '../components/StyledCard';
import Button from '../components/StyledButton';
import { getText, setLanguage, Language } from '../i18n/lang';

const Title = styled.h2`
  color: #4CAF50;
`;

const ErrorText = styled.p`
  color: red;
`;

const LinkButton = styled(Button)`
  background-color: transparent;
  color: #4CAF50;
  border: 1px solid #4CAF50;

  &:hover {
    background-color: #e8f5e9;
  }
`;

const LanguageToggle = styled.select`
  margin-top: 1rem;
  padding: 0.5rem;
  font-size: 0.8rem;
`;

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [language, setLang] = useState('en');
  const navigate = useNavigate();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLanguage = e.target.value;
    setLang(selectedLanguage);
    setLanguage(selectedLanguage as Language); // Update the language globally
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login', { username, password });
      localStorage.setItem('token', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      // force a page reload to update the authenticated state
      window.location.href = '/tasks';
    } catch (err: any) {
      setError(err.response?.data?.message || getText('LOGIN_FAILED'));
    }
  };

  return (
    <Card>
      <Title>{getText('LOGIN')}</Title>
      {error && <ErrorText>{error}</ErrorText>}
      <form onSubmit={handleLogin}>
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
        <Button type="submit">{getText('LOGIN')}</Button>
      </form>

      <p>{getText('DONT_HAVE_ACCOUNT')}</p>
      <LinkButton onClick={() => navigate('/register')}>{getText('REGISTER')}</LinkButton>
      <LanguageToggle value={language} onChange={handleLanguageChange}>
        <option value="en">en</option>
        <option value="he">עבר</option>
      </LanguageToggle>
    </Card>
  );
};

export default Login;
