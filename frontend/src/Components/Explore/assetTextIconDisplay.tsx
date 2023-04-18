import { parseArn } from "../AssetsInventory/assetUtils";
import { TextWithTooltipIcon } from "../Shared/TextWithTooltip";
import { AutoCompleteInlineIcon, assetsImageMap } from "./exploreUtils";

type ExploreAssetProps={
    id:string,
    account_id:string,
    category:string,
    value:string
}

export default function AssetTextIconDisplay({assetObj}:{assetObj:ExploreAssetProps}){
    return <TextWithTooltipIcon 
    text={(assetObj.category==="iamRoles" || assetObj.category==="iamUsers") ? parseArn(assetObj.id)[0] : assetObj.id}
    subText={assetObj.account_id}
    icon={<AutoCompleteInlineIcon icon={assetsImageMap[assetObj.category]}/>}
    maxTruncationLength={200}
/>
}