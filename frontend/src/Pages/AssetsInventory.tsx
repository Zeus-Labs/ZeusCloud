import axios from "axios";
import { log } from "console";
import { useEffect, useRef, useState } from "react";
import { TypeOfExpression } from "typescript";
import assetCategoryMap, { assetToObjects } from "../Components/AssetsInventory/AssetCategoryMap";
import { searchFilterFunction } from "../Components/AssetsInventory/assetUtils";
import { Banner } from "../Components/Shared/Banner";
import { TextInput } from "../Components/Shared/Input";
import SideBarNav from "../Components/Shared/SideBarNav";
import { TableComp, TableRow } from "../Components/Shared/Table";

const navigation = [
    {
        name: 'IAM',
        current: false,
        children: [
            { name: assetCategoryMap.iamGroups, href: '#' },
            { name: assetCategoryMap.iamPolicies, href: '#' },
            { name: assetCategoryMap.iamRoles, href: '#' },
            { name: assetCategoryMap.iamUsers, href: '#' },
        ],
    },
    {
        name: 'Compute',
        current: false,
        children: [
            { name: assetCategoryMap.ec2Instances, href: '#' },
            { name: assetCategoryMap.lambdaFunctions, href: '#' },
        ],
    },
    {
        name: 'Storage',
        current: false,
        children: [
            { name: assetCategoryMap.s3Buckets, href: '#' },
            { name: assetCategoryMap.rdsInstances, href: '#' },
        ],
    },
    {
        name: 'Network',
        current: false,
        children: [
            { name: assetCategoryMap.vpcs, href: '#' },
            { name: assetCategoryMap.internetGateways, href: '#' },
            { name: assetCategoryMap.securityGroups, href: '#' },
            { name: assetCategoryMap.elasticLoadBalancersV2, href: '#' }
        ],
    },
    {
        name: 'Security',
        current: false,
        children: [
            { name: assetCategoryMap.kmsKeys, href: '#' },
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
    const [assetInfo,setAssetInfo] = useState({});
    const [subMenu,setSubMenu] = useState<string>(assetCategoryMap[assetCategory as keyof typeof assetCategoryMap]);

    const [allTableRows,setAllRows] = useState<TableRow[]>([]);
    const [displayedRows,setDisplayedRows] = useState<TableRow[]>([]);

    // For keeping track of the instance of asset categories
    const [assetInstance,setAssetInstance] = useState<any>(null)

    const[ready,setReady] = useState(false);

    const [searchFilter,setSearchFilter] = useState("");

    const searchRef = useRef<HTMLInputElement>(null); 

    useEffect(()=>{
        assetCategory!="" && getAssetInfoData(setAssetInfo,assetCategory);
        assetCategory!="" && setAssetInstance(assetToObjects[assetCategory as keyof typeof assetToObjects]);
        setSubMenu(assetCategoryMap[assetCategory as keyof typeof assetCategoryMap]);
    },[assetCategory])

    useEffect(()=>{
        setAllRows(assetInstance?.getAllRows(assetInfo,setAssetCategory,setSearchFilter));
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
                <div className="flex flex-row mx-auto w-11/12">
                    <div className="flex min-w-[250px] h-screen sticky top-0 ">
                        <SideBarNav navigation={navigation} setAssetCategory={setAssetCategory} subMenu={subMenu} setSearchFilter={setSearchFilter} />
                    </div>
                    {
                        assetInstance!=null &&
                        <div className="flex flex-col items-start ml-4 pt-5 w-full overflow-hidden px-px">
                            <div key={"AssetInput"}>
                                <TextInput
                                    setSearchFilter={setSearchFilter} 
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