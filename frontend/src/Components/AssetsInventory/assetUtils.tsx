import { useState } from "react";
import Modal from "../Shared/Modal";
import { TableRow } from "../Shared/Table";


export function stringAfterLastSlash(str: string): string {

    if (str === null) return "None";
    const lastSlashIndex = str.lastIndexOf('/');
    if (lastSlashIndex === -1) {
        return str;
    }

    return str.slice(lastSlashIndex + 1);
}

export function stringBetweenLastTwoSlashes(str: string): string {
    if (str === null) return "None";
    const lastIndex = str.lastIndexOf('/');
    const secondLastIndex = str.lastIndexOf('/', lastIndex - 1);
    if (!lastIndex || !secondLastIndex) return "None"
    return str.substring(secondLastIndex + 1, lastIndex);
}

export const replaceUnderscore = (str: string) => {
    if (str.includes('_')) {
        return str.replace(/_/g, ' ');
    }
    return str;
};

export function parseArn(str: string): string[] {
    let fourthIndex = str.indexOf(':');
    fourthIndex = str.indexOf(':', fourthIndex + 1);
    fourthIndex = str.indexOf(':', fourthIndex + 1);
    fourthIndex = str.indexOf(':', fourthIndex + 1);

    // Find the index of the 5th occurrence of ':'
    let fifthIndex = str.indexOf(':', fourthIndex + 1);

    const subtext = str.substring(fourthIndex + 1, fifthIndex);;
    const text = stringAfterLastSlash(str);
    return [text, subtext];
}

export function parseIAMPolicy(str: string): string[] {
    const text = stringAfterLastSlash(str);
    const subtext = replaceUnderscore(stringBetweenLastTwoSlashes(str));
    return [text, subtext];
}

type InlineIconProps = {
    icon: string,
}

export const InlineIcon = ({ icon }: InlineIconProps) => {
    return <img className="pr-1 mr-1 w-6" src={icon} />
}

export function ToolTipForList({ content, text }: { content: React.ReactNode, text: string }) {
    return <div className="group relative inline-block">
        {text}
        <span className="absolute hidden group-hover:flex -top-2 right-4 box-content
        translate-x-full w-80 max-w-max px-3 pt-2 py-1 bg-black rounded-lg break-words
         text-white text-sm before:content-[''] before:absolute before:top-1/2  before:right-[100%] 
         before:-translate-y-1/2 before:border-8 before:border-y-transparent before:border-l-transparent
          before:border-r-gray-700">{content}</span>
    </div>
}

export function AssetModal({ children, text }: { children: React.ReactNode, text: string }) {
    const [open, setOpen] = useState(false);
    return (
        <div>
            <span className="cursor-pointer underline" onClick={() => setOpen(true)}>{text}</span>
            <Modal open={open} setOpen={setOpen}>
                {children}
            </Modal>
        </div>

    )
}

type ModalWrapperProps = {
    children: React.ReactNode,
    setAssetCategory: React.Dispatch<React.SetStateAction<string>>,
    assetCategory: string,
    setSearchFilter: React.Dispatch<React.SetStateAction<string>>,
    searchFilter: string
}

export function AssetsModalWrapper({ children, setAssetCategory, assetCategory, setSearchFilter, searchFilter }:ModalWrapperProps) {
    return(
        <div className="cursor-pointer w-fit" onClick={()=>{
            setAssetCategory(assetCategory);
            setSearchFilter(searchFilter);
        }}>
            {children}
        </div>
    )
}

export function convertDateFormat(isoDate: string): string {
    const date = new Date(isoDate);
    const day = date.getUTCDate().toString().padStart(2, '0');
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0'); // getMonth() returns 0-based index
    const year = date.getUTCFullYear().toString();

    const formattedDate = `${month}/${day}/${year}`;
    return formattedDate;
}

export function formatDateAgo(isoDate: string): string {
    const currentDate = new Date();
    const targetDate = new Date(isoDate);

    // Calculate the time difference in seconds
    const deltaSeconds = Math.floor((currentDate.getTime() - targetDate.getTime()) / 1000);

    // Calculate the time difference in minutes, hours, and days
    const deltaMinutes = Math.floor(deltaSeconds / 60);
    const deltaHours = Math.floor(deltaMinutes / 60);
    const deltaDays = Math.floor(deltaHours / 24);
    const deltaMonths = Math.floor(deltaDays / 30);
    const deltaYears = Math.floor(deltaMonths / 12);

    // Format the output based on the time difference
    if (deltaSeconds < 60) {
        return "1 minute ago";
    } else if (deltaMinutes < 60) {
        return `${deltaMinutes} minute${deltaMinutes > 1 ? "s" : ""} ago`;
    } else if (deltaHours < 24) {
        return `${deltaHours} hour${deltaHours > 1 ? "s" : ""} ago`;
    } else if (deltaDays < 30) {
        return `${deltaDays} day${deltaDays > 1 ? "s" : ""} ago`;
    } else if (deltaMonths < 12) {
        return `${deltaMonths} month${deltaMonths > 1 ? "s" : ""} ago`;
    } else {
        return `${deltaYears} year${deltaYears > 1 ? "s" : ""} ago`;
    }
}

export const searchFilterFunction = (allRows: Array<TableRow>, filterValue: string): Array<TableRow> => {
    if (filterValue === "") {
        return allRows;
    }

    return allRows.filter(row => {
        for (var col of row.columns) {
            //console.log(`${col.accessor_key} = ${typeof(col.value)}`);

            if ((typeof (col.value) === "string") &&
                col.value.includes(filterValue)) {
                return true;
            }
            else if (col.value instanceof Array &&
                col.value.some(v => v.includes(filterValue))) {
                return true;
            }
        }
    });
}