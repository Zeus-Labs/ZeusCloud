interface TextWithTooltipProps {
    text: string;
    maxTruncationLength: number;
};

interface TextWithTooltipIconProps extends TextWithTooltipProps{
    icon: React.ReactNode;
    subText?: string
};

export const TextWithTooltip = ({text, maxTruncationLength}: TextWithTooltipProps) => {
    if(text==="arn:aws:iam::315957380126:role/PublicLambdaWithPrivilegeEscala-lambdaRoleC844FDB1-B01XBJX5BT42"){
        console.log(text.length,maxTruncationLength)
    }
    if (text.length < maxTruncationLength) {
        return <div>{text}</div>
    }
    const displayText: string = text.substring(0, maxTruncationLength - 3) + '...'
    return (
        <div className="relative flex flex-col group">
            <div>{displayText}</div>
            <div className="absolute bottom-0 flex flex-col items-center hidden mb-6 group-hover:flex">
                <span className="relative z-10 p-2 text-xs leading-none text-white whitespace-no-wrap bg-black shadow-lg">{text}</span>
                <div className="w-3 h-3 -mt-2 rotate-45 bg-black"></div>
            </div>
        </div>
    )
}


export const TextWithTooltipIcon = ({text, maxTruncationLength, icon,subText}: TextWithTooltipIconProps) => {
    return (
        <div className="flex inline-flex items-center">
            {icon}
            <div className="flex flex-col">
                <TextWithTooltip text={text} maxTruncationLength={maxTruncationLength}/>
                {subText && <div className="text-gray-400">{subText}</div>}
            </div>
        </div>
    )
    // if (text.length < maxTruncationLength) {
    //     return <>{text}</>
    // }
    // const displayText: string = text.substring(0, maxTruncationLength - 3) + '...'
    // return (
    //     <div className="relative flex flex-col group">
    //         {displayText}
    //         <div className="absolute bottom-0 flex flex-col items-center hidden mb-6 group-hover:flex">
    //             <span className="relative z-10 p-2 text-xs leading-none text-white whitespace-no-wrap bg-black shadow-lg">{text}</span>
    //             <div className="w-3 h-3 -mt-2 rotate-45 bg-black"></div>
    //         </div>
    //     </div>
    // )
}