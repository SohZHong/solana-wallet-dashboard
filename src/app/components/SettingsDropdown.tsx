import {
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownSection,
    DropdownItem
} from "@nextui-org/dropdown";
import SettingIcon from './icons/SettingIcon'
import dynamic from "next/dynamic";

export default function SettingsDropdown(){
    const WalletMultiButtonDynamic = dynamic(
        async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
        { ssr: false }
    );

    return (
        <Dropdown closeOnSelect={false}>
            <DropdownTrigger>
                <button className="border rounded p-1">
                    <SettingIcon className="w-7 dark:fill-white fill-black h-auto" />
                </button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Settings" >
                <DropdownSection title="Settings" showDivider>
                    <DropdownItem key="language">Display Language</DropdownItem>
                    <DropdownItem key="theme">Theme</DropdownItem>
                </DropdownSection>
                <DropdownItem key="wallet">
                    <WalletMultiButtonDynamic className="text-base"/>
                </DropdownItem>
            </DropdownMenu>
        </Dropdown>
    )
}