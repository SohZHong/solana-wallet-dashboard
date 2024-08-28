"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import LightModeIcon from "./icons/LightModeIcon";
import DarkModeIcon from "./icons/DarkModeIcon";

const ThemeSlider = () => {
  const [mounted, setMounted] = useState(false)
  const {theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if(!mounted) return null

  return (
    <div>
      <button onClick={() => setTheme('light')}><LightModeIcon className="w-7 h-auto"/></button>
      <button onClick={() => setTheme('dark')}><DarkModeIcon className="w-7 h-auto"/></button>
    </div>
  )
};

export default ThemeSlider