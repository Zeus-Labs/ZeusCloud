
export interface TextInputProps {
    setSearchFilter: (value: string) => void; 
}

export const TextInput = ({ 
        setSearchFilter}: TextInputProps) => {
    
            
    const onChange = (e: React.FormEvent<HTMLInputElement>) => {
        setSearchFilter(e.currentTarget.value);
    }
    
    return (
        <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Rules
            </label>
            <div className="mt-1">
            <input
                onChange={onChange}
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