"use client";

import { MouseEventHandler } from "react";

const HamburgerButton = (
    // { handleHamburgerClick }: {handleHamburgerClick: MouseEventHandler}
) => {
    return (
        <div
            // onClick={handleHamburgerClick}
            className="shadow-button-light relative h-[35px] w-[35px] p-[2px] mr-[15px] cursor-pointer transition-shadow duration-300 ease-in-out"
        >
            <button type="button" className=" bg-transparent border-none cursor-pointer" title="Menu">
                <span className="bar bar--1 absolute bg-primary-brand-color h-[2px] left-[6px] right-[6px] top-1/2 transform -translate-y-[6px]"></span>
                <span className="bar bar--2 absolute bg-primary-brand-color h-[2px] left-[6px] right-[6px] top-1/2"></span>
                <span className="bar bar--3 absolute bg-primary-brand-color h-[2px] left-[6px] right-[6px] top-1/2 transform translate-y-[6px]"></span>
            </button>
        </div>
    );
};

export default HamburgerButton;