import { MouseEventHandler } from "react"

interface CustomButtonProperties {
    children: React.ReactNode,
    onClick?: MouseEventHandler<HTMLButtonElement>,
    disabled?: boolean
}

const AppButton = (properties: CustomButtonProperties) => {
    return (
        <button
            className="wallet-adapter-button wallet-adapter-button-trigger"
            disabled={properties.disabled}
            onClick={properties.onClick}
        >
            {properties.children}
        </button>
    )
}

export default AppButton