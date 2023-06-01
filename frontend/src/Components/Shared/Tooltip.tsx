import { ReactElement } from "react-markdown/lib/react-markdown"

type TooltipProps = {
    text: string,
    reactElement: React.ReactNode
}


export const ReactElementWithTooltip = ({text,reactElement}:TooltipProps)=>{
    return (
        <div className="relative flex flex-col group">
        {reactElement}
        <div className="absolute bottom-0 flex flex-col items-center hidden mb-6 group-hover:flex tooltip">
            {text}
        </div>
    </div>
    )

}