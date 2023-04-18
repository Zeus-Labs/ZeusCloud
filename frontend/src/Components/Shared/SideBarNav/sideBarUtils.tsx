export type navigationProps={
    name:string,
    data?:string,
    children?:{name:string,data?:string}[]
}

export function navIndicesToItemName(navigation:navigationProps[],{menuIdx,subMenuIdx}:{menuIdx:number,subMenuIdx:number}):string {
    let name:string="";
    name = menuIdx>=0 ? navigation[menuIdx].name : "";

    if(subMenuIdx>=0 && navigation[menuIdx].children!==undefined){
        let children =  navigation[menuIdx].children
        name = children ? children[subMenuIdx].name : name
    }
    return name;
}

export function navIndicesToData(navigation:navigationProps[],{menuIdx,subMenuIdx}:{menuIdx:number,subMenuIdx:number}):string|undefined {
  let data:string|undefined="";
  data = menuIdx>=0 ? navigation[menuIdx].data : "";

  if(subMenuIdx>=0 && navigation[menuIdx].children!==undefined){
      let children =  navigation[menuIdx].children
      data = children ? children[subMenuIdx].data : data
  }
  return data;
}

export function getMenu(subMenu:string, navigation:navigationProps[]):string{
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