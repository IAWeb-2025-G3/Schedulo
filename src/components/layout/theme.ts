import { createTheme, MantineColorsTuple } from '@mantine/core';

const primary: MantineColorsTuple = [
  '#f1f1ff',
  '#e0dff2',
  '#bfbdde',
  '#9b98ca',
  '#7d79b9',
  '#6a66af',
  '#605cac',
  '#504c97',
  '#464388',
  '#3b3979',
];

export const defaultTheme = createTheme({
  primaryColor: 'primary',
  colors: {
    primary,
  },
  components: {
    Badge: {
      classNames: {
        root: '!capitalize',
      },
      defaultProps: {
        radius: 'md',
      },
    },
  },
});

export const educationTheme = createTheme({
  defaultGradient: {
    deg: 180,
    from: '#ffca64',
    to: '#ffb01b',
  },
  primaryColor: 'education',
  colors: {
    education: [
      '#fff8e1',
      '#ffefcc',
      '#ffdd9b',
      '#ffca64',
      '#ffba38',
      '#ffb01b',
      '#ffab09',
      '#e39500',
      '#ca8500',
      '#af7100',
    ],
  },
  components: {
    Button: {
      classNames: {
        root: 'transition-all ease-in-out hover:scale-105',
      },
    },
  },
});
