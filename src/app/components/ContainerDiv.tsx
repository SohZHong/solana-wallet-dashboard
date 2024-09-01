

const ContainerDiv = ({ children, ...props }: React.PropsWithChildren) => {
    return (
        <div className="lg:p-5 p-3 dark:bg-brand-gray dark:shadow-none shadow-medium rounded-2xl" {...props}>
            {children}
        </div>
    )
}

export default ContainerDiv