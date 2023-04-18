import {useEffect } from "react"

  
  export default function RadioComp({id,label,data,defaultChecked=false,setData}:{id:string,label:React.ReactNode,data:string,defaultChecked?:boolean,setData:any}) {
    
    useEffect(()=>{
      defaultChecked && setData(data);
    },[defaultChecked])
    return (
              <div className="flex items-center px-2">
                <input
                  id={id}
                  name="notification-method"
                  type="radio"
                  onChange={(e)=>{
                    setData && setData(e.currentTarget.value)
                  }}
                  value={data}
                  defaultChecked={defaultChecked}
                  className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                />
                <label htmlFor={id} className="ml-3 block text-sm font-medium leading-6 text-gray-900">
                  {label}
                </label>
              </div>
    )
  }
  