
// import {TablePropGetter, TableProps, Row, HeaderGroup,} from "react-table";
import { ChevronDownIcon, ChevronUpIcon, ChevronUpDownIcon, ChevronRightIcon } from '@heroicons/react/20/solid';
import {useCallback, useRef, useEffect} from "react";

export interface SortColumnHeader {
    sortStateValue: string,
    setSortStateFn: (value: string) => void,
}

export interface TableColumnHeader  {
    header: React.ReactNode,
    accessor_key: string,
    allowSorting: boolean,
    sortColumnHeader?: SortColumnHeader,
}

// TableRow holds nested component as well as the row data.
export interface TableRow {
    columns: {
        content: React.ReactNode,
        accessor_key: string
        value: string | string[] | boolean | number | Date,
        ignoreComponentExpansion: boolean,
    }[]
    nestedComponent?: React.ReactNode;
    rowId: string;
    openRowState?: boolean;
    handleRowClick?:()=>void;
    setOpenRowStateFn?: () => void;
    selectedRowId?: string | undefined,
}

export interface TableProps   {
    tableFixed: boolean,
    tableColumnHeaders: TableColumnHeader[],
    tableRows?: TableRow[]
    selectedRowId?: string | undefined,
    // List of the table css header styles.
    tableHeaderCSS: any[]; 
};

// TableRowComp returns the table row component.
const TableRowComp = ({rowId, columns, nestedComponent, 
    openRowState,handleRowClick ,setOpenRowStateFn,selectedRowId}: TableRow) => {

    const onClickCallback = useCallback(() => {
        if (nestedComponent && setOpenRowStateFn) {
            setOpenRowStateFn();
        }
    }, [nestedComponent, openRowState]);
    
    const currRow = (
        <tr key={rowId} id={rowId} onClick={handleRowClick} 
            className={(nestedComponent || handleRowClick) ? 'cursor-pointer hover:bg-gray-100' : ''}>
                
                    {columns.map((column, idx) => {
                        if (idx != 0 || !nestedComponent) {
                            return (
                            <td onClick={(column.ignoreComponentExpansion) ? undefined : onClickCallback} key={column.accessor_key+"_cur"} className="break-words whitespace-normal px-3 py-4 text-sm text-gray-600">
                                {column.content}
                            </td>);
                        }


                        if(nestedComponent) {
                            return (
                            <td onClick={(column.ignoreComponentExpansion) ? undefined : onClickCallback} 
                                key={column.accessor_key+"_cur"} className="whitespace-normal px-3 py-4 text-sm text-gray-600">
                                <span key={column.accessor_key+"_span"} className="flex inline-flex items-center">
                                {(
                                    openRowState ? <ChevronDownIcon className="flex-none h-4 w-4" /> : <ChevronRightIcon className="flex-none h-4 w-4" />
                                )}
                                    {column.content}
                                </span>
                            </td>);
                        }
                    })}
        </tr>
    );
       

    // Return current row
    if(!openRowState || !nestedComponent) {
        return currRow;
    }
    return (
        <>
            {currRow}
            {nestedComponent}
        </>
    )
}

const TableComp = ({
    tableFixed,
    tableRows,
    tableColumnHeaders, 
    tableHeaderCSS,
    selectedRowId}: TableProps) => {
    var tableClassName = tableFixed ? "table-fixed min-w-full divide-y divide-gray-300" : "min-w-full divide-y divide-gray-300"

    const tableRef = useRef<HTMLTableElement>(null)
    useEffect(()=>{
        if(selectedRowId){
            const ruleAlertGroupRow = tableRef.current?.querySelector(`#${CSS.escape(selectedRowId)}`)
            ruleAlertGroupRow?.scrollIntoView({ behavior: "smooth",block:"start"})
        }
    },[selectedRowId,tableRows])

    return (
        <table className={tableClassName} ref={tableRef}>
            <thead className="bg-gray-50">
                <tr key={"header_row"}>
                    {tableColumnHeaders.map((tableColumnHeader, index) =>  {
                            if (tableColumnHeader.allowSorting) {

                                // Retrieve sort state variable and set sort variable.
                                var sortStateValue = tableColumnHeader?.sortColumnHeader?.sortStateValue;
                                var setSortState = tableColumnHeader?.sortColumnHeader?.setSortStateFn;
                                
                                const onClickHeaderCallback = () => {                           
                                    if (!sortStateValue || !setSortState) {
                                        return;
                                    }
                                   
                                    if (sortStateValue === "None") {
                                        setSortState("Dec");
                                    } else if (sortStateValue === "Dec") {
                                        setSortState("Inc");
                                    } else {
                                        setSortState("None");
                                    }
                                };

                               var sortComponent = null;  
                               if (sortStateValue === "Inc") {
                                    sortComponent = (<ChevronUpIcon className={tableHeaderCSS[index].chevronClassName} aria-hidden="true" />)
                               } else if (sortStateValue === "Dec") {
                                    sortComponent = (<ChevronDownIcon className={tableHeaderCSS[index].chevronClassName} aria-hidden="true" />)
                               } else {
                                    sortComponent = (<ChevronUpDownIcon className={tableHeaderCSS[index].chevronClassName} aria-hidden="true" />)
                               }

                               return (
                               <th onClick={onClickHeaderCallback} key={tableColumnHeader.accessor_key+"_header"} scope="col" className={tableHeaderCSS[index].headerClassName}>
                                        <div className="group inline-flex">
                                            {tableColumnHeader.header}
                                            <span className={tableHeaderCSS[index].spanClassName}>
                                                {sortComponent}
                                            </span>
                                        </div>
                                </th>)
                            }
                        
                            return( 
                                    <th key={tableColumnHeader.accessor_key+"_header"} scope="col" className={tableHeaderCSS[index].headerClassName}>
                                        <div className="group inline-flex">
                                                {tableColumnHeader.header}
                                        </div>
                                    </th>
                             )})}
                    </tr>                                    
            </thead>

            <tbody className="divide-y divide-gray-200 bg-white" >
                    {tableRows?.map((tableRow, i) => {
                        return (
                            <TableRowComp
                                rowId={tableRow.rowId}
                                key={tableRow.rowId} 
                                columns={tableRow.columns} 
                                nestedComponent={tableRow.nestedComponent}
                                openRowState={tableRow.openRowState}
                                setOpenRowStateFn={tableRow.setOpenRowStateFn} 
                                handleRowClick={tableRow.handleRowClick} />
                        )
                    })}
            </tbody>
        </table>);

}

export {TableComp}