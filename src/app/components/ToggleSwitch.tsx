import React from "react";

interface SwitchProps {
    id?: string,
    name: string,
    checked: boolean,
    onChange: React.ChangeEventHandler<HTMLInputElement>,
    optionLabels: Array<string>,
    small?: boolean,
    disabled?: boolean,
    checkedIcon?: React.ReactNode;
    uncheckedIcon?: React.ReactNode;
}

const ToggleSwitch = ({ id, name, checked, onChange, optionLabels, small, disabled, checkedIcon, uncheckedIcon }: SwitchProps) => {
    return (
        <div className={`relative inline-flex items-center ${small ? 'w-12 h-6' : 'w-16 h-8'}`}>
            <input
                type="checkbox"
                name={name}
                id={id}
                checked={checked}
                onChange={onChange}
                disabled={disabled}
                className="sr-only"
            />
            <label
                htmlFor={id}
                className={`flex items-center cursor-pointer w-full h-full bg-gray-300 rounded-full p-1 transition ease-in-out
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''} 
                    ${checked ? 'bg-brand-purple' : 'bg-gray-300'}`}
            >
                <span
                    className={`absolute h-6 w-6 transform flex items-center justify-center bg-white rounded-full shadow-md transition-transform duration-200
                        ${checked ? 'translate-x-8 bg-black' : ''}`}
                >
                    {checked ? checkedIcon : uncheckedIcon}
                </span>
                <span className="sr-only">{optionLabels[0]}</span>
                <span className="sr-only">{optionLabels[1]}</span>
            </label>
        </div>
    );
};

// Set optionLabels for rendering.
ToggleSwitch.defaultProps = {
    optionLabels: ["Yes", "No"],
};

export default ToggleSwitch;
