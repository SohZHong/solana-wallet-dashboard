const HamburgerIcon = ({ className }) => (
    <svg
        width="800px"
        height="800px"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <g clipPath="url(#clip0_429_11066)">
            <path
                className={className}
                d="M3 6.00092H21M3 12.0009H21M3 18.0009H21"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </g>
        <defs>
            <clipPath id="clip0_429_11066">
                <rect width="24" height="24" fill="white" transform="translate(0 0.000915527)" />
            </clipPath>
        </defs>
    </svg>
);

export default HamburgerIcon;