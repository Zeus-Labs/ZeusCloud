import { labelDisplay } from "../Alerts/ResourceMappings";
import { TextWithTooltip, TextWithTooltipIcon } from "./TextWithTooltip";

export interface ResourceDisplayProps {
    text: string;
    type: string;
    maxTruncationLength: number;
    icon?: React.ReactNode;
};

export const ResourceDisplay = ({text, type, maxTruncationLength, icon}: ResourceDisplayProps) => {
    
    var textWithToolTipNode: React.ReactNode; 
    if(icon === null) {
        textWithToolTipNode = <TextWithTooltip key={text} text={text} maxTruncationLength={maxTruncationLength}/>
    } else {
        textWithToolTipNode = <TextWithTooltipIcon key={text} text={text} maxTruncationLength={maxTruncationLength}
            icon={icon} subText={labelDisplay(type)}/>
    }
    return (
        <>
            {textWithToolTipNode}
        </>
    )
}