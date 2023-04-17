import { useCallback, useEffect, useRef, useState } from "react";
import { Banner } from "../Components/Shared/Banner";
import { TextInput } from "../Components/Shared/Input";
import SideBarNav from "../Components/Shared/SideBarNav/SideBarNav";
import { AutoCompleteInlineIcon, S3ActionList, assetsImageMap, exploreNavMap } from "../Components/Explore/exploreUtils";
import axios from "axios";
import { InlineIcon, parseArn } from "../Components/AssetsInventory/assetUtils";
import { AssetsModalWrapper } from "../Components/AssetsInventory/assetUtils";
import { TextWithTooltipIcon } from "../Components/Shared/TextWithTooltip";
import AssetTextIconDisplay from "../Components/Explore/assetTextIconDisplay";
import { navIndicesToData, navIndicesToItemName } from "../Components/Shared/SideBarNav/sideBarUtils";
import { DisplayGraph } from "../Components/Alerts/AlertsTypes";
import RuleGraph from "../Components/Alerts/RuleGraph";
import { Graph } from "@antv/g6";
import { log } from "console";
import RadioComp from "../Components/Shared/RadioList";
import { SelectFilterDropdown } from "../Components/Shared/Select";
import { TableComp, TableRow } from "../Components/Shared/Table";
import { assetToObjects } from "../Components/AssetsInventory/AssetCategoryMap";
import DisplayEdgeInfo from "../Components/Explore/displayEdgeInfo";

async function getExploreAssetInfo(setExploreAssetInfo: any) {
    try {
        // @ts-ignore
        const exploreAssetsEndpoint = window._env_.REACT_APP_API_DOMAIN + "/api/getExploreAssets";
        const response = await axios.get(exploreAssetsEndpoint);
        let assetInfoData = response.data.map((assetObj: any) => {
            if (assetObj.category === "iamRoles" || assetObj.category === "iamUsers") {
                return {
                    ...assetObj,
                    value: `${parseArn(assetObj.id)[0]}/${assetObj.account_id}`
                }
            } else {
                return {
                    ...assetObj,
                    value: `${assetObj.id}/${assetObj.account_id}`
                }
            }
        })

        setExploreAssetInfo({
            data: assetInfoData,
            error: ''
        });
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
            message = "Error in retrieving rules information."
        }

        setExploreAssetInfo({
            data: [],
            error: message
        });
    }
}

async function getAssetRelationGraph(setGraph: any, resource_type: string, query_type: string, resource_id: string, action_type: string) {
    try {
        // @ts-ignore
        const assetRelationGraphEndpoint = window._env_.REACT_APP_API_DOMAIN + "/api/getAccessExplorerGraph";
        const response = await axios.get(assetRelationGraphEndpoint,
            { params: { resource_type: resource_type, query_type: query_type, resource_id: resource_id, action_type: action_type } });

        setGraph({
            data: response.data,
            error: ''
        })
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
            message = "Error in retrieving rules information."
        }

        setGraph({
            data: [],
            error: message
        });
    }
}

async function getSelectedEdgeInfo(edgeID: number | null,setEdgeInfo:any,srcNode:string,targetNode:string) {
    try {
        if (edgeID == null) {
            setEdgeInfo(
                {
                    data: {},
                    edgeID: edgeID,
                    error: "",
                    source:"",
                    target:""
                }
            )
        }
        // @ts-ignore
        const edgeInfoEndpoint = window._env_.REACT_APP_API_DOMAIN + "/api/getEdgeInfo";
        const response = await axios.get(edgeInfoEndpoint,
            { params: { edge_id:edgeID } });

        setEdgeInfo({
            data: response.data,
            edgeID:edgeID,
            error: '',
            source: srcNode,
            target: targetNode
        })
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
            message = "Error in retrieving rules information."
        }

        setEdgeInfo({
            data: {},
            edgeID:undefined,
            error: "",
            source:"",
            target:""
        });
    }
}

async function getNodeInfoData(setAssetInfo: any, assetCategory: string, id: string) {
    try {
        // @ts-ignore
        const assetCategoryEndpoint = window._env_.REACT_APP_API_DOMAIN + "/api/getAssetInventory";
        const response = await axios.get(assetCategoryEndpoint,
            { params: { asset_category: assetCategory } }
        );
        let assetInfoData = response.data.filter((assetObj: any) => {
            switch (assetCategory) {
                case "iamUsers":
                case "iamRoles":
                    return assetObj.arn === id;
                    break;
                case "s3Buckets":
                    return assetObj.name === id;
                    break;
                case "ec2Instances":
                    return assetObj.instance_id === id;
                    break;
                default:
                    return false;
            }
        });

        setAssetInfo({
            data: assetInfoData,
            error: ''
        });
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
            message = "Error in retrieving rules information."
        }

        setAssetInfo({
            data: [],
            error: message
        });
    }
}

type ExploreAssetProps = {
    id: string,
    account_id: string,
    category: string,
    value: string
}



export default function Explore() {
    const [searchFilter, setSearchFilter] = useState<string>("");
    const emptyAsset = {
        id: "",
        account_id: "",
        category: "",
        value: ""
    };
    const [asset, setAsset] = useState<ExploreAssetProps>(emptyAsset);
    const [exploreAssetsInfo, setExploreAssetsInfo] = useState<{ data: ExploreAssetProps[], error: string }>({ data: [], error: "" });


    const initDisplayGraph: { data: DisplayGraph, error: string } = {
        data: {
            node_info: {},
            adjacency_list: {}
        },
        error: ""
    }
    const [graph, setGraph] = useState(initDisplayGraph)


    const [filteredAssets, setFilteredAssets] = useState<ExploreAssetProps[]>([]);

    const [isSelected, setSelected] = useState(false);    // is search dropdown option selected

    const [queryType, setQueryType] = useState("");
    const defaultActionStr = S3ActionList[0];
    const [actionStr, setActionStr] = useState(defaultActionStr);

    const initNodeInfo = { data: [], error: "" }
    const [selectedNodeInfo, setNodeInfo] = useState(initNodeInfo);
    const [allTableRows, setAllRows] = useState<TableRow[]>([]);
    const [assetInstance, setAssetInstance] = useState<any>(null);     // clicked node asset instance

    const initEdgeInfo:{
        data:{[property:string]:string},
        edgeID: number|null|undefined,
        error:string,
        source: string,
        target: string
    } = {
        data: {},
        edgeID: undefined,
        error: "",
        source:"",
        target:""
    }
    const [selectedEdgeInfo, setEdgeInfo] = useState(initEdgeInfo)

    const tableScrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        getExploreAssetInfo(setExploreAssetsInfo);
    }, [])

    // useEffect(() => {
    //     console.log("graph=", graph);
    // }, [graph])


    useEffect(() => {
        setNodeInfo(initNodeInfo);
        setEdgeInfo(initEdgeInfo);
        if (asset.category === "s3Buckets") {
            queryType !== "" && actionStr !== "" && getAssetRelationGraph(setGraph, asset.category, queryType, asset.id, actionStr)
        }
        else {
            queryType !== "" && getAssetRelationGraph(setGraph, asset.category, queryType, asset.id, actionStr)
        }
    }, [queryType, actionStr])

    useEffect(() => {

        if (searchFilter !== "" && exploreAssetsInfo.data.length > 0 && !isSelected) {
            const filteredObjects = exploreAssetsInfo.data.filter(assetObj => assetObj.value.toLowerCase().includes(searchFilter.toLowerCase()));
            setFilteredAssets(filteredObjects);
        } else {
            setFilteredAssets([]);
        }

    }, [searchFilter, exploreAssetsInfo, isSelected])

    useEffect(() => {
        (assetInstance && selectedNodeInfo.data.length > 0) ? setAllRows(assetInstance?.getAllRows(selectedNodeInfo)) : setAllRows([]);
    }, [selectedNodeInfo, assetInstance])

    useEffect(() => {
        (selectedEdgeInfo.edgeID!==undefined || allTableRows.length > 0) && tableScrollRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [allTableRows, tableScrollRef,selectedEdgeInfo])

    const handleSearchChange = (e: React.FormEvent<HTMLInputElement>) => {
        setSearchFilter(e.currentTarget.value);
        // setSelected(false);
        // setAsset(emptyAsset);
    }
    const graphEventListner = useCallback((graph: Graph) => {
        graph.on('node:mouseenter', (e: any) => {
            graph.setItemState(e.item, 'hover', true);
        });
        graph.on('node:mouseleave', (e: any) => {
            graph.setItemState(e.item, 'hover', false);
        });

        graph.on('edge:mouseenter', (e: any) => {
            graph.setItemState(e.item, 'hover', true);
        });
        graph.on('edge:mouseleave', (e: any) => {
            graph.setItemState(e.item, 'hover', false);
        });

        graph.on('node:click', (e) => {
            const node = e.item?.getModel();
            setEdgeInfo(initEdgeInfo);
            for (let assetObj of exploreAssetsInfo.data) {
                if (assetObj.id === node?.display_id) {
                    setAssetInstance(assetToObjects[assetObj.category])
                    getNodeInfoData(setNodeInfo, assetObj.category, node?.display_id);
                    break;
                }
            }
        })
        graph.on('edge:click', (e) => {
            const edge = e.item?.getModel();
            let srcNode
            let targetNode
            setNodeInfo(initNodeInfo);
            if (e.item && 'getSource' in e.item){
                 srcNode = e.item?.getSource().getModel()
                 targetNode = e.item?.getTarget().getModel()
            }
            console.log(srcNode,targetNode)
            getSelectedEdgeInfo(edge?.edge_id as number|null,setEdgeInfo,srcNode?.display_id as string,targetNode?.display_id as string)
        })
    }, [exploreAssetsInfo])

    return (
        <div className="min-h-full">
            <Banner bannerHeader='Explore' bannerDescription='Browse assets discovered in your cloud environments.' />
            <div className="px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4">
                <div className="flex flex-col mx-auto w-11/12">
                    <div className="flex flex-row justify-between items-center">
                        <div className="relative w-4/12">
                            <TextInput
                                handleChange={handleSearchChange}
                                title={"Resource"}
                                searchFilter={searchFilter}
                                inputHeight={isSelected ? "h-12" : ""}
                            />
                            {isSelected &&
                                <div className="absolute flex bottom-2.5 top-7 left-1 right-1 bg-white">
                                    <div className="searchCustomDisplay pl-1 text-sm overflow-x-scroll overflow-y-hidden w-[90%]">
                                        <AssetTextIconDisplay assetObj={asset} />
                                    </div>
                                    <div className="grow flex items-center justify-center">
                                        <button type="button" onClick={() => {
                                            setSelected(false);
                                            setAsset(emptyAsset);
                                            setAssetInstance(null);
                                            setQueryType("");
                                            setActionStr(defaultActionStr);
                                            setGraph(initDisplayGraph);
                                            setNodeInfo(initNodeInfo);
                                        }}
                                            className="inline-flex items-center p-0.5 border border-transparent rounded-full bg-gray-200">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="black" viewBox="0 0 24 24" stroke="black">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                            }
                            {filteredAssets.length > 0 &&
                                <div className="autoCompleteDiv">
                                    <ul>
                                        {filteredAssets.map((assetObj, idx) =>
                                            <li key={assetObj.id} className="p-2.5 cursor-pointer hover:bg-gray-50 border-b border-gray-100">
                                                <div className="text-sm"
                                                    onClick={() => {
                                                        setSearchFilter("");
                                                        setAsset(assetObj);
                                                        setSelected(true);
                                                    }}>
                                                    <AssetTextIconDisplay assetObj={assetObj} />
                                                </div>
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            }
                        </div>

                        <div className="flex flex-row w-1/2 justify-evenly pt-3 pl-2">
                            {asset.category === "s3Buckets"
                                ? <RadioComp
                                    id="s3Buckets"
                                    data="reachableAction"
                                    label={<div className="flex items-center">
                                        <span>Show Inbound Paths Using</span>
                                        <div className="mx-2 min-w-[230px]">
                                            <SelectFilterDropdown
                                                setFilter={setActionStr}
                                                selectedFilterValue={actionStr}
                                                filterOptions={S3ActionList}
                                            />
                                        </div>
                                    </div>}
                                    setData={setQueryType}
                                    defaultChecked={true}
                                />
                                : exploreNavMap[asset.category].map((nav, idx) =>
                                    <RadioComp
                                        id={idx.toString()}
                                        data={nav.data || ""}
                                        label={nav.name}
                                        setData={setQueryType}
                                        defaultChecked={idx === 0}
                                    />
                                )}
                        </div>

                    </div>

                    <div className="flex flex-col items-start pt-5 w-full overflow-hidden px-px">

                        <div className="mt-1 mb-4 overflow-scroll w-full min-h-[400px] flex flex-col shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                            {
                                (graph.data.node_info && Object.keys(graph.data.node_info).length > 0) &&
                                <RuleGraph ruleGraph={graph.data} graphEventListner={graphEventListner} />
                            }
                        </div>
                    </div>

                    <div ref={tableScrollRef} className="mt-8 mb-4" >
                            <DisplayEdgeInfo edgeInfo={selectedEdgeInfo} />
                        {assetInstance !== null && allTableRows.length > 0 &&
                            <div  className="mt-3 overflow-scroll w-full shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                                <TableComp
                                    tableFixed={true}
                                    tableColumnHeaders={assetInstance?.tableColumnHeaders}
                                    tableHeaderCSS={assetInstance?.tableHeaderCSS}
                                    tableRows={allTableRows}
                                />
                            </div>
                        }
                    </div>
                    
                </div>
            </div>
        </div>
    )
}
