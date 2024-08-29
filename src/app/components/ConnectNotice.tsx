import WaitIcon from "./icons/WaitIcon"

const ConnectNotice = () => (
    <div className="w-full h-full flex flex-col items-center gap-3">
        <div className="animate-spin duration-[2000]">
            <WaitIcon className="animate-pulse dark:fill-white w-60 h-auto"/>
        </div>
        <span className="font-bold">
            Awaiting Wallet Connection...
        </span>
    </div>
)

export default ConnectNotice