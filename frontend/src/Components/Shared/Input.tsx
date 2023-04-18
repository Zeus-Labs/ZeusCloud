import { ForwardedRef, forwardRef } from "react";

export interface TextInputProps {
    handleChange: (e: React.FormEvent<HTMLInputElement>) => void;
    searchFilter: string
    title:string
    inputHeight?: string 
}

export const TextInput =({ 
        handleChange, title,searchFilter,inputHeight}: TextInputProps) => {
    
    
    return (
        <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            {title}
            </label>
            <div className="mt-1">
            <input
                onChange={handleChange}
                value={searchFilter}
                type="text"
                name="email"
                id="email"
                className={`block w-full ${inputHeight} mb-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                placeholder="Search"
            />
            </div>
        </div>
    );
}