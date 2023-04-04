import { Disclosure } from '@headlessui/react'
import { useEffect, useState } from 'react'
import assetCategoryMap from '../AssetsInventory/AssetCategoryMap'

type SideBarProps = {
    navigation: {
      name: string,
      current: boolean,
      children?: {name: string, href:string}[]
    }[],
    setAssetCategory? : any,
    subMenu? : string,
    setSearchFilter? : React.Dispatch<React.SetStateAction<string>>
}

function classNames(...classes:any[]) {
    return classes.filter(Boolean).join(' ')
}
  
  export default function SideBarNav({navigation,setAssetCategory,subMenu="",setSearchFilter}:SideBarProps) {
    const [selectedSubItem,setSelectedSub] = useState<string>(subMenu);
    const [openedMenu,setOpenedMenu] = useState(getMenu(subMenu));
    const [isMenuClosed,setMenuClosed] = useState<boolean>(false);

      function getMenu(subMenu:string):string{
        for(let menu of navigation){
          if(menu.children)
            for(let sub of menu.children){
              if(sub.name===subMenu) {
                return menu.name;
              }
            }
        }
        return ""
    }

    useEffect(()=>{
      if(subMenu===selectedSubItem){
        setSearchFilter && setSearchFilter("");         
      }
      setSelectedSub(subMenu);
      setOpenedMenu(getMenu(subMenu));
      setMenuClosed(false);                               // for programmatic opening of menu
    },[subMenu])


    function handleSubClick(itemName:string){
      setSelectedSub(itemName);
      // Retreiving asset category value from sub item name
      setAssetCategory(Object.keys(assetCategoryMap).filter((k)=>assetCategoryMap[k as keyof typeof assetCategoryMap]===itemName)[0]);
    }

    return (
      <div className="flex flex-grow flex-col overflow-y-auto bg-white pt-5 pb-4">
        
        <div className="flex flex-grow flex-col border border-gray-200">
          <nav className="flex-1 space-y-1 bg-white px-2" aria-label="Sidebar">
            {navigation.map((item) =>
              !item.children ? (
                <div key={item.name}>
                  <a
                    href="#"
                    className={classNames(
                      item.current
                        ? 'bg-gray-100 text-gray-900'
                        : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                      'group flex w-full items-center rounded-md py-2 pl-2 text-sm font-medium'
                    )}
                  >
                    {item.name}
                  </a>
                </div>
              ) : (
                <Disclosure as="div" key={item.name} defaultOpen={item.name===openedMenu && true} className="space-y-1">
                  {({ open,close }) => {
                    
                    return (<>
                      <Disclosure.Button
                        className={classNames(
                          item.current
                            ? 'bg-gray-100 text-gray-900'
                            : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                          'group flex w-full items-center rounded-md py-3 pl-2 pr-1 text-left text-sm font-medium focus:outline-none '
                        )}
                        onClick={()=>{
                          if(item.name===openedMenu){
                            setMenuClosed(true);         
                          }
                        }}
                      >
                        <span className="flex-1">{item.name}</span>
                        <svg
                          className={classNames(
                            ((item.name===openedMenu && !isMenuClosed)||open) ? 'rotate-90 text-gray-400' : 'text-gray-300',
                            'ml-3 h-5 w-5 flex-shrink-0 transform transition-colors duration-150 ease-in-out group-hover:text-gray-400'
                          )}
                          viewBox="0 0 20 20"
                          aria-hidden="true"
                        >
                          <path d="M6 6L14 10L6 14V6Z" fill="currentColor" />
                        </svg>
                      </Disclosure.Button>
                      {((item.name===openedMenu && !isMenuClosed)||open) &&
                        <Disclosure.Panel static className="space-y-1">
                          {item.children?.map((subItem) => (
                            <div
                              key={subItem.name}
                              className={classNames(
                                (selectedSubItem===subItem.name) ? "bg-gray-100 text-gray-900" : "",
                                "group flex w-full items-center cursor-pointer rounded-md py-2 pl-11 pr-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                )}
                              onClick={()=>handleSubClick(subItem.name)}
                            >
                              {subItem.name}
                            </div>
                          ))}
                        </Disclosure.Panel>
                      }
                    </>)
                  }}
                </Disclosure>
              )
            )}
          </nav>
        </div>
      </div>
    )
  }