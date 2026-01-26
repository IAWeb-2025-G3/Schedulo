import { Menu } from '@mantine/core';
import { IconUser, IconUserStar } from '@tabler/icons-react';

type Props = {
  currentUser: {
    username: string;
    isAdmin: boolean;
  };
};

export const UserMenuItem = ({ currentUser }: Props) => {
  return (
    <>
      {currentUser.isAdmin && (
        <Menu.Label className="flex gap-2 items-start" c="yellow">
          <IconUserStar size={16} className="flex-shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span>Admin</span>
          </div>
        </Menu.Label>
      )}
      <Menu.Label className="flex gap-2 items-start">
        <IconUser size={16} className="flex-shrink-0 mt-0.5" />
        <div className="flex flex-col gap-0.5">
          <>
            <span>Organizer:</span>
            <span className="break-words">{currentUser.username}</span>
          </>
        </div>
      </Menu.Label>
    </>
  );
};
