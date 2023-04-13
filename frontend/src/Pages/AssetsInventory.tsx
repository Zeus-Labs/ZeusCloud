import axios from "axios";
import { useEffect, useRef, useState } from "react";
import assetCategoryMap, { assetToObjects } from "../Components/AssetsInventory/AssetCategoryMap";
import { searchFilterFunction } from "../Components/AssetsInventory/assetUtils";
import { Banner } from "../Components/Shared/Banner";
import { TextInput } from "../Components/Shared/Input";
import SideBarNav from "../Components/Shared/SideBarNav/SideBarNav";
import { TableComp, TableRow } from "../Components/Shared/Table";
import { navIndicesToItemName} from "../Components/Shared/SideBarNav/sideBarUtils";

const navigation = [
    {
        name: 'IAM',
        children: [
            { name: assetCategoryMap.iamGroups},
            { name: assetCategoryMap.iamPolicies},
            { name: assetCategoryMap.iamRoles},
            { name: assetCategoryMap.iamUsers},
        ],
    },
    {
        name: 'Compute',
        children: [
            { name: assetCategoryMap.ec2Instances},
            { name: assetCategoryMap.lambdaFunctions},
        ],
    },
    {
        name: 'Storage',
        children: [
            { name: assetCategoryMap.s3Buckets},
            { name: assetCategoryMap.rdsInstances},
        ],
    },
    {
        name: 'Network',
        children: [
            { name: assetCategoryMap.vpcs},
            { name: assetCategoryMap.internetGateways},
            { name: assetCategoryMap.securityGroups},
            { name: assetCategoryMap.elasticLoadBalancersV2}
        ],
    },
    {
        name: 'Security',
        children: [
            { name: assetCategoryMap.kmsKeys},
        ],
    },
]
async function getAssetInfoData(setAssetInfo:any, assetCategory: string) {    
    try {
        // @ts-ignore
        const assetCategoryEndpoint = window._env_.REACT_APP_API_DOMAIN + "/api/getAssetInventory";
        const response = await axios.get(assetCategoryEndpoint, 
            { params: { asset_category: assetCategory } }
        );
        let assetInfoData = [];

        setAssetInfo({
            data: response.data,
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


const AssetsInventory = () => {
    const [assetCategory, setAssetCategory] = useState<string>("iamUsers");
    const [navIndices,setNavIndices]=useState({menuIdx: 0,subMenuIdx:3});
    const [assetInfo,setAssetInfo] = useState<any>({});
    const [subMenu,setSubMenu] = useState<string>(assetCategoryMap[assetCategory as keyof typeof assetCategoryMap]);

    const [allTableRows,setAllRows] = useState<TableRow[]>([]);
    const [displayedRows,setDisplayedRows] = useState<TableRow[]>([]);

    // For keeping track of the instance of asset categories
    const [assetInstance,setAssetInstance] = useState<any>(null)

    const[ready,setReady] = useState(false);

    const [searchFilter,setSearchFilter] = useState("");

    const searchRef = useRef<HTMLInputElement>(null); 

    const handleSearchChange = (e: React.FormEvent<HTMLInputElement>) => {
        setSearchFilter(e.currentTarget.value);
    }

    useEffect(()=>{
        const itemName = navIndicesToItemName(navigation,navIndices);
        setAssetCategory(Object.keys(assetCategoryMap).filter((k)=>assetCategoryMap[k as keyof typeof assetCategoryMap]===itemName)[0]);
    },[navIndices])

    useEffect(()=>{
        assetCategory!="" && getAssetInfoData(setAssetInfo,assetCategory);
        assetCategory!="" && setAssetInstance(assetToObjects[assetCategory]);
        setSubMenu(assetCategoryMap[assetCategory as keyof typeof assetCategoryMap]);
    },[assetCategory])

    useEffect(()=>{
        assetInfo.data ? setAllRows(assetInstance?.getAllRows(assetInfo,setAssetCategory,setSearchFilter)) : setAllRows([]);
    },[assetInfo])

    useEffect(()=>{
        if(allTableRows){
            setDisplayedRows(()=>{
                return searchFilterFunction(allTableRows,searchFilter);
            })
        }
        
    },[allTableRows,searchFilter])

    useEffect(() => {
        setTimeout(() => setReady(true), 100)
    }, []);


    return (
        <div className="min-h-full">
            <Banner bannerHeader='Asset Inventory' bannerDescription='Browse assets discovered in your cloud environments.' />
            <div className="px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4">
                <div className="flex flex-row pt-4 mx-auto w-11/12">
                    <div className="flex min-w-[250px] h-screen sticky py-2 top-0 ">
                        <SideBarNav navigation={navigation} setNavIndices={setNavIndices} subMenu={subMenu} setSearchFilter={setSearchFilter} />
                    </div>
                    {
                        assetInstance!=null &&
                        <div className="flex flex-col py-2 items-start ml-4 w-full overflow-hidden px-px">
                            <div key={"AssetInput"}>
                                <TextInput
                                    handleChange={handleSearchChange} 
                                    title={assetCategoryMap[assetCategory as keyof typeof assetCategoryMap]}
                                    searchFilter={searchFilter}
                                />
                            </div>
                            <div className="mt-8 mb-4 overflow-scroll w-full shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                                <TableComp 
                                    tableFixed={true}
                                    tableColumnHeaders={assetInstance?.tableColumnHeaders}
                                    tableHeaderCSS={assetInstance?.tableHeaderCSS}
                                    tableRows={displayedRows}
                                />
                            </div>
                        </div>
                        
                    }
                    
                </div>
            </div>
        </div>

    );
}

export default AssetsInventory