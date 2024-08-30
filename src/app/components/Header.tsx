"use client";
import dynamic from 'next/dynamic';
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import ThemeSlider from "./ThemeSlider";
import Image from "next/image";
import DashboardIcon from "./icons/DashboardIcon";
import HistoryIcon from "./icons/HistoryIcon";
import Sidebar, {SidebarProps} from "./Sidebar";
import SettingsDropdown from './SettingsDropdown';

export default function Header(){

    const WalletMultiButtonDynamic = dynamic(
        async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
        { ssr: false }
    );

    const sideBarItems: SidebarProps[] = [
        {title: "Dashboard", Icon: <DashboardIcon className="w-7 h-auto"/>, href: "/"},
        {title: "Transaction History", Icon: <HistoryIcon className="w-7 h-auto"/>, href: "/history"}
    ]

    return (
        <header className="flex flex-row items-center justify-between p-2">
            <div className="flex items-center gap-4">
                <Sidebar 
                    items={sideBarItems}
                />
                <Image 
                    src={"/logo.png"}
                    alt="SolSets Logo"
                    height={175}
                    width={175}
                />
            </div>
            <div className="flex items-center flex-row gap-4">
                {/* <WalletMultiButtonDynamic style={{}}/>
                <ThemeSlider /> */}
                <SettingsDropdown />
            </div>
        </header>

    )
}