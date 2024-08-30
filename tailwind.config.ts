import {nextui} from '@nextui-org/theme';
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/components/(dropdown|pagination|select|table|menu|divider|popover|button|ripple|spinner|listbox|scroll-shadow|checkbox|spacer).js"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        "brand-purple": "#512da8",
        "brand-blue": "#41a8eb",
        "brand-blue-grey": "#b1aedd",
        "brand-grey": "#dcd6ec",
        "brand-violet": "#f5f2ff",
        "white-mode": "e5e5e5",
        "extra-light-grey": "#e1e1e1",
        "brand-gray": "#18181b"
      }
    },
  },
  plugins: [nextui()],
};
export default config;
