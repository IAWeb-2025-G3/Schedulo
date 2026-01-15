import { useState } from 'react';
import {
  Button,
  PasswordInput,
  Paper,
  Title,
  Text,
  Stack,
  Container,
} from '@mantine/core';
import { NextPageWithLayout } from '~/pages/_app';

const Page: NextPageWithLayout = () => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/password', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        setError('Incorrect password');
        return;
      }

      window.location.href = '/admin';
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container size={420} mt={120}>
      <Title ta="center" mb="sm">
        Password required
      </Title>

      <Text c="dimmed" size="sm" ta="center" mb="lg">
        This page is protected. Enter the password to continue.
      </Text>

      <Paper withBorder shadow="md" p="lg" radius="md">
        <form onSubmit={onSubmit}>
          <Stack>
            <PasswordInput
              label="Password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              required
              autoFocus
            />

            {error && (
              <Text c="red" size="sm">
                {error}
              </Text>
            )}

            <Button type="submit" loading={loading} fullWidth>
              Continue
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};
export default Page;
