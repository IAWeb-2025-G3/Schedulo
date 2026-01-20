import { useState } from 'react';
import {
  Button,
  Paper,
  Title,
  Text,
  Stack,
  Container,
  TextInput,
  PasswordInput,
} from '@mantine/core';
import { NextPageWithLayout } from '~/pages/_app';
import { useRouter } from 'next/router';

const Page: NextPageWithLayout = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        setError('Invalid credentials');
        return;
      }

      window.location.href = '/organize';
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container size={420} mt={120}>
      <Title ta="center" mb="sm">
        Organizer sign-in
      </Title>
      <Text c="dimmed" size="sm" ta="center" mb="lg">
        Enter your organizer username and password.
      </Text>

      <Paper withBorder shadow="md" p="lg" radius="md">
        <form onSubmit={onSubmit}>
          <Stack>
            <TextInput
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.currentTarget.value)}
              required
              autoFocus
            />
            <PasswordInput
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              required
            />

            {error && (
              <Text c="red" size="sm">
                {error}
              </Text>
            )}

            <Button type="submit" loading={loading} fullWidth>
              Sign in
            </Button>

            <Button
              variant="subtle"
              fullWidth
              onClick={() => router.push('/')}
            >
              Cancel
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};

export default Page;
