import { useTheme } from "next-themes";
import { ChangeEvent, useEffect, useState } from "react";
import ToggleSwitch from "./ToggleSwitch";
import DarkModeIcon from "./icons/DarkModeIcon";
import LightModeIcon from "./icons/LightModeIcon";

const ThemeSlider = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const onSlideToggle = (e: ChangeEvent<HTMLInputElement>) => {
    setTheme(e.target.checked ? 'dark' : 'light');
  };

  return (
    <div>
      <ToggleSwitch
        name="themeToggle"
        checked={theme === 'dark'}
        onChange={onSlideToggle}
        optionLabels={['Light', 'Dark']}
        id="themeToggle"
        checkedIcon={<DarkModeIcon className="w-4 h-auto text-black"/>}
        uncheckedIcon={<LightModeIcon className="w-4 h-auto" />}
      />
    </div>
  );
};

export default ThemeSlider;