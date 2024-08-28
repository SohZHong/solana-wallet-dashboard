"use client";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import HamburgerButton from "./Hamburger";
import ThemeSlider from "./ThemeSlider";

export default function Header(){
    return (
        <header className="">
            <HamburgerButton />
            <div>
                <WalletMultiButton style={{}}/>
                <ThemeSlider />
            </div>
        </header>

    )
}