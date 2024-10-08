import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import HamburgerIcon from './icons/HamburgerIcon'
import React from 'react'
import Image from "next/image";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';

const framerSidebarBackground = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0, transition: { delay: 0.2 } },
    transition: { duration: 0.3 },
}

const framerSidebarPanel = {
    initial: { x: '-100%' },
    animate: { x: 0 },
    exit: { x: '-100%' },
    transition: { duration: 0.3 },
}

const framerText = (delay: number) => {
    return {
            initial: { opacity: 0, x: -50 },
            animate: { opacity: 1, x: 0 },
            transition: {
            delay: 0.5 + delay / 10,
        },
    }
}

export interface SidebarProps {
  title: string;
  Icon: React.ReactNode;
  href: string;
}

interface SidebarComponentProps {
  items: SidebarProps[];
}

const Sidebar = ({ items }: SidebarComponentProps) => {
  const [open, setOpen] = useState(false);
  const toggleSidebar = () => setOpen((prev) => !prev);
  const closeSideBar = () => {
      setOpen(false);
  };
  const WalletMultiButtonDynamic = dynamic(
    async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
    { ssr: false }
  );
  return (
      <div>
          <button
              onClick={toggleSidebar}
              className="p-1"
              aria-label="toggle sidebar"
          >
              <HamburgerIcon className="dark:stroke-white stroke-brand-purple w-8 h-auto" />
          </button>
          <AnimatePresence mode="wait" initial={false}>
              {open && (
                  <React.Fragment>
                      <motion.div
                          {...framerSidebarBackground}
                          aria-hidden="true"
                          className="fixed bottom-0 left-0 right-0 top-0 z-40 bg-[rgba(0,0,0,0.1)] backdrop-blur-sm"
                          onClick={closeSideBar}
                      ></motion.div>
                        <motion.div
                            {...framerSidebarPanel}
                            className="fixed top-0 bottom-0 left-0 z-50 w-full h-screen max-w-xs border-r-2 dark:border-zinc-800 dark:bg-zinc-900 shadow-md bg-white"
                            aria-label="Sidebar"
                        >
                            <div className="flex flex-col items-center p-5 border-b-2 dark:border-zinc-800 border-extra-light-grey space-y-5">
                                <div className='w-full flex items-center justify-between'>
                                    <Image
                                        src={"/logo.png"}
                                        alt="SolSets Logo"
                                        height={175}
                                        width={175}
                                    />
                                    <button
                                        onClick={toggleSidebar}
                                        className="p-3 border-2 font-bold dark:border-zinc-800 border-extra-light-grey text-base rounded-xl"
                                        aria-label="close sidebar"
                                    >
                                        Close
                                    </button>
                                </div>
                                <motion.div {...framerText(0)}>
                                    <WalletMultiButtonDynamic style={{width: 'inherit'}} />
                                </motion.div>
                            </div>

                            <ul>
                                {items.map((item, index) => {
                                    const { title, href, Icon } = item;
                                    const isActive = usePathname() === href;
                                    return (
                                        <li className="font-bold p-2" key={title}>
                                            <Link
                                                onClick={closeSideBar}
                                                href={href}
                                                className={`flex items-center gap-5 p-3 rounded transition-all hover:bg-brand-purple dark:hover:text-white hover:text-white ${isActive ? 'dark:text-brand-blue text-brand-purple' : ''}`}
                                            >
                                                <motion.div {...framerText(index)}>{Icon}</motion.div>
                                                <motion.span {...framerText(index)} className="text-left">{title}</motion.span>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </motion.div>
                      
                  </React.Fragment>
              )}
          </AnimatePresence>
      </div>
  );
};

export default Sidebar;