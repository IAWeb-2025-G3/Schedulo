import { useState } from 'react';
import type { NextPageWithLayout } from '../_app';
import {
  Card,
  Title,
  Text,
  Button,
  TextInput,
  Table,
  ActionIcon,
  Modal,
  Stack,
  Group,
} from '@mantine/core';
import {
  IconEdit,
  IconTrash,
  IconPlus,
  IconEyeOff,
  IconEye,
} from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { trpc } from '~/utils/trpc';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';

type OrganizerFormData = {
  id?: string;
  username: string;
  password: string;
};

const Page: NextPageWithLayout = () => {
  const [opened, setOpened] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<
    Record<string, boolean>
  >({});

  const togglePassword = (id: string) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const utils = trpc.useUtils();
  const { data: organizers, isLoading } =
    trpc.organizer.fetchOrganizers.useQuery();

  const form = useForm<OrganizerFormData>({
    initialValues: {
      username: '',
      password: '',
    },
    validate: {
      username: (value) => (value.length < 1 ? 'Username is required' : null),
      password: (value) => {
        // Password is only required when creating, not when editing
        if (!editingId && value.length < 1) {
          return 'Password is required';
        }
        return null;
      },
    },
  });

  const createOrganizer = trpc.organizer.createOrganizer.useMutation({
    onSuccess: () => {
      notifications.show({
        title: 'Success',
        message: 'Organizer created successfully',
        color: 'green',
      });
      utils.organizer.fetchOrganizers.invalidate();
      form.reset();
      setOpened(false);
    },
    onError: (error) => {
      notifications.show({
        title: 'Error',
        message: error.message,
        color: 'red',
      });
    },
  });

  const updateOrganizer = trpc.organizer.updateOrganizer.useMutation({
    onSuccess: () => {
      notifications.show({
        title: 'Success',
        message: 'Organizer updated successfully',
        color: 'green',
      });
      utils.organizer.fetchOrganizers.invalidate();
      form.reset();
      setOpened(false);
      setEditingId(null);
    },
    onError: (error) => {
      notifications.show({
        title: 'Error',
        message: error.message,
        color: 'red',
      });
    },
  });

  const deleteOrganizer = trpc.organizer.deleteOrganizer.useMutation({
    onSuccess: () => {
      notifications.show({
        title: 'Success',
        message: 'Organizer deleted successfully',
        color: 'green',
      });
      utils.organizer.fetchOrganizers.invalidate();
    },
    onError: (error) => {
      notifications.show({
        title: 'Error',
        message: error.message,
        color: 'red',
      });
    },
  });

  const handleOpenCreate = () => {
    form.reset();
    setEditingId(null);
    setOpened(true);
  };

  const handleOpenEdit = (organizer: {
    id: string;
    username: string;
    password: string;
  }) => {
    form.setValues({
      id: organizer.id,
      username: organizer.username,
      password: '', // Leave empty so user can choose to change it or not
    });
    setEditingId(organizer.id);
    setOpened(true);
  };

  const handleSubmit = (values: OrganizerFormData) => {
    if (editingId) {
      // Only include password if it was changed (not empty)
      const updateData: { id: string; username?: string; password?: string } = {
        id: editingId,
        username: values.username,
      };
      if (values.password && values.password.length > 0) {
        updateData.password = values.password;
      }
      updateOrganizer.mutate(updateData);
    } else {
      createOrganizer.mutate({
        username: values.username,
        password: values.password,
      });
    }
  };

  const handleDelete = (id: string, username: string) => {
    modals.openConfirmModal({
      title: 'Delete Organizer',
      children: (
        <Text size="sm">
          Are you sure you want to delete organizer <strong>{username}</strong>?
          This action cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        deleteOrganizer.mutate({ id });
      },
    });
  };

  return (
    <Stack gap="lg" className="w-full max-w-6xl py-8">
      <Group justify="space-between" align="center">
        <div>
          <Title order={1} mb="xs">
            Organizers
          </Title>
          <Text c="dimmed" size="sm">
            Manage organizers who can create and manage polls
          </Text>
        </div>
        <Button leftSection={<IconPlus size={18} />} onClick={handleOpenCreate}>
          Add Organizer
        </Button>
      </Group>

      <Card withBorder>
        {isLoading ? (
          <Text c="dimmed" ta="center" py="xl">
            Loading organizers...
          </Text>
        ) : organizers && organizers.length > 0 ? (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Username</Table.Th>
                <Table.Th>Password</Table.Th>
                <Table.Th>Created</Table.Th>
                <Table.Th style={{ width: 120 }}>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {organizers.map((organizer) => {
                if (!organizer.id) return null;
                return (
                  <Table.Tr key={organizer.id}>
                    <Table.Td>
                      <Text fw={500}>{organizer.username}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Text c="dimmed" style={{ fontFamily: 'monospace' }}>
                          {visiblePasswords[organizer.id]
                            ? organizer.password
                            : '••••••••'}
                        </Text>
                        <ActionIcon
                          size="sm"
                          variant="subtle"
                          onClick={() => togglePassword(organizer.id!)}
                        >
                          {visiblePasswords[organizer.id] ? (
                            <IconEyeOff size={16} />
                          ) : (
                            <IconEye size={16} />
                          )}
                        </ActionIcon>
                      </Group>
                    </Table.Td>

                    <Table.Td>
                      {organizer.createdAt ? (
                        <Text size="sm" c="dimmed">
                          {new Date(organizer.createdAt).toLocaleDateString()}
                        </Text>
                      ) : (
                        <Text size="sm" c="dimmed">
                          —
                        </Text>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <ActionIcon
                          variant="subtle"
                          color="blue"
                          onClick={() =>
                            handleOpenEdit({
                              id: organizer.id!,
                              username: organizer.username,
                              password: organizer.password,
                            })
                          }
                        >
                          <IconEdit size={18} />
                        </ActionIcon>
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          onClick={() =>
                            handleDelete(organizer.id!, organizer.username)
                          }
                        >
                          <IconTrash size={18} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        ) : (
          <Text c="dimmed" ta="center" py="xl">
            No organizers yet. Click "Add Organizer" to create one.
          </Text>
        )}
      </Card>

      <Modal
        opened={opened}
        onClose={() => {
          setOpened(false);
          setEditingId(null);
          form.reset();
        }}
        title={editingId ? 'Edit Organizer' : 'Add Organizer'}
        centered
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="Username"
              placeholder="Enter username"
              required
              {...form.getInputProps('username')}
            />
            <TextInput
              label="Password"
              type="password"
              placeholder={
                editingId
                  ? 'Leave empty to keep current password'
                  : 'Enter password'
              }
              required={!editingId}
              {...form.getInputProps('password')}
            />
            <Group justify="flex-end" mt="md">
              <Button
                variant="subtle"
                onClick={() => {
                  setOpened(false);
                  setEditingId(null);
                  form.reset();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={createOrganizer.isPending || updateOrganizer.isPending}
              >
                {editingId ? 'Update' : 'Create'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
};

export default Page;
