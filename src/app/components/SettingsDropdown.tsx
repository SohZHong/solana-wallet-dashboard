"use client";
import {
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownSection,
    DropdownItem
} from "@nextui-org/dropdown";
import SettingIcon from './icons/SettingIcon';
import { Select, SelectItem } from "@nextui-org/select";
import { useTheme } from "next-themes";
import { ChangeEvent, useEffect, useState } from "react";

export default function SettingsDropdown() {
    const { theme, setTheme } = useTheme();
    const [selectedTheme, setSelectedTheme] = useState<string>('system');
    const [selectedLanguage, setSelectedLanguage] = useState('en');
    const [mounted, setMounted] = useState(false);
  
    useEffect(() => {
      setMounted(true);
      if (theme) setSelectedTheme(theme)
    }, []);
  
    if (!mounted) return null;

    const handleThemeChange = (value: string) => {
        setTheme(value);
        setSelectedTheme(value);
    };

    const handleLanguageChange = (value: string) => {
        setSelectedLanguage(value);
        // Perform any additional actions needed for language change
    };

    return (
        <Dropdown closeOnSelect={false}>
            <DropdownTrigger>
                <button className="border rounded p-1">
                    <SettingIcon className="w-7 dark:fill-white fill-black h-auto" />
                </button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Settings">
                <DropdownSection title="Display Language">
                    <DropdownItem key="language">
                        <Select
                            variant="bordered"
                            placeholder="Select Language"
                            selectedKeys={[selectedLanguage]} // Use array for selected keys
                            className="max-w-xs"
                            onChange={(e => handleLanguageChange(e.target.value))}
                        >
                            <SelectItem key="en" value="en">
                                English
                            </SelectItem>
                            {/* <SelectItem key="es" value="es">
                                Spanish
                            </SelectItem>
                            <SelectItem key="fr" value="fr">
                                French
                            </SelectItem> */}
                        </Select>
                    </DropdownItem>
                </DropdownSection>
                <DropdownSection title="Language">
                    <DropdownItem key="theme">
                        <Select
                            variant="bordered"
                            placeholder="Theme"
                            selectedKeys={[selectedTheme]}
                            className="max-w-xs"
                            onChange={(e => handleThemeChange(e.target.value))}
                        >
                            <SelectItem key="light" value="light">
                                Light
                            </SelectItem>
                            <SelectItem key="dark" value="dark">
                                Dark
                            </SelectItem>
                        </Select>
                    </DropdownItem>
                </DropdownSection>
            </DropdownMenu>
        </Dropdown>
    );
}
