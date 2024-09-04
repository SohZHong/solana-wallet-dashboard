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
import { useEffect, useState } from "react";

export default function SettingsDropdown() {
    const { theme, setTheme } = useTheme();
    const [selectedTheme, setSelectedTheme] = useState<string>('system');
    const [selectedCurrency, setSelectedCurrency] = useState<string>('');
    const [mounted, setMounted] = useState(false);
  
    useEffect(() => {
      setMounted(true);
      if (theme) setSelectedTheme(theme);
    //   Read currency from localStorage
      const currency = localStorage.getItem('currency');
      setSelectedCurrency(currency ? currency : 'usd');
    }, []);
  
    if (!mounted) return null;

    const handleThemeChange = (value: string) => {
        setTheme(value);
        setSelectedTheme(value);
    };

    const handleCurrencyChange = (value: string) => {
        setSelectedCurrency(value);
        localStorage.setItem('currency', value);
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
                            selectedKeys={[selectedCurrency ? selectedCurrency : "usd"]} // Use array for selected keys
                            className="max-w-xs"
                            onChange={(e => handleCurrencyChange(e.target.value))}
                        >
                            <SelectItem key="usd" value="usd">
                                USD
                            </SelectItem>
                            <SelectItem key="myr" value="myr">
                                MYR
                            </SelectItem>
                            <SelectItem key="sgd" value="sgd">
                                SGD
                            </SelectItem>
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
