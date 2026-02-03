import { useState } from 'react';
import {
  Button,
  Paper,
  Title,
  Text,
  Stack,
  Container,
  PasswordInput,
  Alert,
  Tooltip,
} from '@mantine/core';
import { NextPageWithLayout } from '~/pages/_app';
import { trpc } from '~/utils/trpc';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/router';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';

const Page: NextPageWithLayout = () => {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data: currentOrganizer, isLoading: isLoadingOrganizer } =
    trpc.organizer.getCurrentOrganizer.useQuery();

  const utils = trpc.useUtils();

  const verifyPassword = trpc.organizer.verifyPassword.useMutation();

  const updateOrganizer = trpc.organizer.updateOrganizer.useMutation({
    onSuccess: () => {
      notifications.show({
        title: 'Success',
        message: 'Password changed successfully!',
        color: 'green',
        icon: <IconCheck />,
      });
      utils.organizer.getCurrentOrganizer.invalidate();
      router.push('/organize');
    },
    onError: (error) => {
      notifications.show({
        title: 'Error',
        message: error.message,
        color: 'red',
        icon: <IconAlertCircle />,
      });
    },
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!currentOrganizer) {
      setError('You must be logged in to change your password');
      return;
    }

    if (!currentPassword) {
      setError('Current password is required');
      return;
    }

    if (!newPassword) {
      setError('New password is required');
      return;
    }

    if (newPassword.length < 1) {
      setError('Password must be at least 1 character long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    // Verify current password
    try {
      await verifyPassword.mutateAsync({
        id: currentOrganizer.id!,
        password: currentPassword,
      });
    } catch {
      setError('Current password is incorrect');
      return;
    }

    updateOrganizer.mutate({
      id: currentOrganizer.id!,
      password: newPassword,
    });
  }

  if (isLoadingOrganizer) {
    return (
      <Container size={420} mt={120}>
        <Text ta="center">Loading...</Text>
      </Container>
    );
  }

  if (!currentOrganizer) {
    return (
      <Container size={420} mt={120}>
        <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red">
          You must be logged in to change your password
        </Alert>
      </Container>
    );
  }

  return (
    <Container size={420} mt={120}>
      <Title ta="center" mb="sm">
        Change Password
      </Title>
      <Text c="dimmed" size="sm" ta="center" mb="lg">
        Update your organizer password.
      </Text>

      <Paper withBorder shadow="md" p="lg" radius="md">
        <form onSubmit={onSubmit}>
          <Stack>
            {error && (
              <Alert icon={<IconAlertCircle size={16} />} color="red">
                {error}
              </Alert>
            )}

            <PasswordInput
              label="Current Password"
              placeholder="Enter your current password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.currentTarget.value)}
            />

            <PasswordInput
              label="New Password"
              placeholder="Enter your new password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.currentTarget.value)}
            />

            <PasswordInput
              label="Confirm New Password"
              placeholder="Confirm your new password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.currentTarget.value)}
            />

            <Tooltip
              color="yellow"
              disabled={
                currentPassword.trim() !== '' &&
                newPassword.trim() !== '' &&
                confirmPassword.trim() !== ''
              }
              label={<Text>Please fill in all password fields!</Text>}
              openDelay={500}
              withArrow
            >
              <Button
                type="submit"
                fullWidth
                loading={updateOrganizer.isPending}
                disabled={
                  !currentPassword.trim() ||
                  !newPassword.trim() ||
                  !confirmPassword.trim() ||
                  updateOrganizer.isPending
                }
              >
                Change Password
              </Button>
            </Tooltip>

            <Button
              variant="subtle"
              fullWidth
              onClick={() => router.push('/organize')}
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
