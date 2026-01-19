import tailwindDebugScreens from 'tailwindcss-debug-screens';
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
};

export const plugins = [tailwindDebugScreens];
export default config;
