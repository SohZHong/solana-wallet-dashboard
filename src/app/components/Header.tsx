"use client";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import ThemeSlider from "./ThemeSlider";
import Image from "next/image";
import DashboardIcon from "./icons/DashboardIcon";
import Sidebar, {SidebarProps} from "./Sidebar";

export default function Header(){

    const sideBarItems: SidebarProps[] = [
        {title: "Dashboard", Icon: <DashboardIcon className="w-7 h-auto border-none fill-brand-purple" />, href: "/"},
        {title: "Transaction History", Icon: <DashboardIcon className="w-7 h-auto fill-brand-purple"/>, href: "/"}
    ]

    return (
        <header className="flex flex-row justify-between">
            <div className="flex gap-2">
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
            <div className="flex flex-row gap-2">
                <WalletMultiButton style={{}}/>
                <ThemeSlider />
            </div>
        </header>

    )
}