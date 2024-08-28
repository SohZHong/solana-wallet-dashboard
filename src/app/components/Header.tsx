"use client";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import ThemeSlider from "./ThemeSlider";
import Image from "next/image";
import DashboardIcon from "./icons/DashboardIcon";
import Sidebar, {SidebarProps} from "./Sidebar";

export default function Header(){

    const sideBarItems: SidebarProps[] = [
        {title: "Dashboard", Icon: <DashboardIcon className="w-7 h-auto stroke-brand-purple dark:stroke-brand-blue"/>, href: "/"},
        {title: "Transaction History", Icon: <DashboardIcon className="w-7 h-auto dark:stroke-brand-blue stroke-brand-purple"/>, href: "/history"}
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
                <WalletMultiButton style={{}}/>
                <ThemeSlider />
            </div>
        </header>

    )
}