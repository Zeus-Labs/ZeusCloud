import axios from "axios";
import { useEffect, useState } from "react"
import { ReactElementWithTooltip } from "../Shared/Tooltip";

type CrownElementProps = {
    isCrownJewel: boolean,
    nodeId: number
}

async function setCrownJewel(nodeId: number,isCrownJewel: boolean,setIsClicked:any){
    try {
        // @ts-ignore
        const crownJewelEndpoint = window._env_.REACT_APP_API_DOMAIN + "/api/setCrownJewel";
        console.log(`node id = ${nodeId}`)
        await axios.post(crownJewelEndpoint,null,
            {params: {node_id: nodeId,is_crown_jewel: isCrownJewel}}
        )
    }
    catch (error) {
       
        let message = '';
        if (axios.isAxiosError(error)) {
            if (error.response && error.response.data) {
                message = "Error: " + error.response.data
            } else {
                message = "Oops! Encountered an error..."
            }
        } else {
            message = `Error in setting the is_crown_jewel value for node ${nodeId}`
        }
        console.log(message)

        setIsClicked((prev:boolean) => !prev)
    }
}

export default function CrownElement({isCrownJewel,nodeId}:CrownElementProps){
    const [crownJewelState,setCrownJewelState] = useState(isCrownJewel)

    const handleClick = ()=>{
        setCrownJewelState(prev => !prev)
        setCrownJewel(nodeId,!crownJewelState,setCrownJewelState)
    }
    useEffect(()=>{
        setCrownJewelState(isCrownJewel)
    },[isCrownJewel])
    return (
        <ReactElementWithTooltip 
            text={(crownJewelState) ? "Unmark crown jewel" : "mark as crown jewel"}
            reactElement = {
                <div id="crown-icon" className="w-7 cursor-pointer" onClick={handleClick}>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g id="SVGRepo_bgCarrier" strokeWidth={3}></g>
                    <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                    <g id="SVGRepo_iconCarrier"> 
                        <path d="M12.8306 3.443C12.6449 3.16613 12.3334 3 12.0001 3C11.6667 3 11.3553 3.16613 11.1696 3.443L7.38953 9.07917L2.74781 3.85213C2.44865 3.51525 1.96117 3.42002 1.55723 3.61953C1.15329 3.81904 0.932635 4.26404 1.01833 4.70634L3.70454 18.5706C3.97784 19.9812 5.21293 21 6.64977 21H17.3504C18.7872 21 20.0223 19.9812 20.2956 18.5706L22.9818 4.70634C23.0675 4.26404 22.8469 3.81904 22.4429 3.61953C22.039 3.42002 21.5515 3.51525 21.2523 3.85213L16.6106 9.07917L12.8306 3.443Z" 
                        fill={(crownJewelState) ? "grey" : "transparent"}  stroke="black"></path> 
                    </g>
                </svg>
                </div>
            }
        />
        
    )
}