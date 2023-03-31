import { ForwardedRef, forwardRef } from "react";

export interface TextInputProps {
    setSearchFilter: (value: string) => void;
    searchFilter: string
    title:string 
}

export const TextInput =({ 
        setSearchFilter, title,searchFilter}: TextInputProps) => {
    
            
    const onChange = (e: React.FormEvent<HTMLInputElement>) => {
        setSearchFilter(e.currentTarget.value);
    }
    
    return (
        <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            {title}
            </label>
            <div className="mt-1">
            <input
                onChange={onChange}
                value={searchFilter}
                type="text"
                name="email"
                id="email"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Search"
            />
            </div>
        </div>
    );
}