
import {TablePropGetter, TableProps, Row, HeaderGroup,} from "react-table";
import { ChevronDownIcon, ChevronUpIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';


type RulesTableProps = {
    headerGroups: Array<HeaderGroup>,
    rows: Row<{}>[];
    getTableProps:  (propGetter?: TablePropGetter<{}> | undefined) => TableProps;
    getTableBodyProps:  (propGetter?: TablePropGetter<{}> | undefined) => TableProps;
    prepareRow: (row: Row<{}>) => void;
};


const RulesTable = ({headerGroups, rows, getTableBodyProps, getTableProps, prepareRow}: RulesTableProps) => {
    const tableHeaderCSS = [{
        "headerClassName": "py-3.5 pl-4 pr-3 uppercase text-left text-sm font-semibold text-gray-900 sm:pl-6",
        "spanClassName": "invisible ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible",
        "chevronClassName": "h-5 w-5",
    },
    {
        "headerClassName": "px-3 py-3.5 uppercase text-left text-sm font-semibold text-gray-900",
        "spanClassName": "ml-2 flex-none rounded bg-gray-200 text-gray-900 group-hover:bg-gray-300",
        "chevronClassName": "h-5 w-5",
    },
    {
        "headerClassName": "px-3 py-3.5 uppercase text-left text-sm font-semibold text-gray-900",
        "spanClassName": "invisible ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible",
        "chevronClassName": "invisible ml-2 h-5 w-5 flex-none rounded text-gray-400 group-hover:visible group-focus:visible",
    },
    {
        "headerClassName": "px-3 py-3.5 uppercase text-left text-sm font-semibold text-gray-900",
        "spanClassName": "invisible ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible",
        "chevronClassName": "invisible ml-2 h-5 w-5 flex-none rounded text-gray-400 group-hover:visible group-focus:visible",
    }];

    return (
        <table className="min-w-full divide-y divide-gray-300" {...getTableProps()}>
            <thead className="bg-gray-50">
                {headerGroups.map((headerGroup, index) =>  {
                    if (index !== 0) {
                        return <tr {...headerGroup.getHeaderGroupProps()}>
                            {headerGroup.headers.map((column) => (
                                <th {...column.getHeaderProps(
                                    column.getSortByToggleProps()
                                )}
                                scope="col"
                                className={tableHeaderCSS[index].headerClassName}>
                                    <div className="group inline-flex">
                                            {column.render("Header")}
                        
                                            <span className={tableHeaderCSS[index].spanClassName}>
                                                {column.isSorted ? (
                                                    column.isSortedDesc ? (
                                                    <ChevronDownIcon className={tableHeaderCSS[index].chevronClassName} aria-hidden="true" />
                                                    ) : (
                                                    <ChevronUpIcon className={tableHeaderCSS[index].chevronClassName} aria-hidden="true" />
                                                    )
                                                ) : (
                                                    <ChevronUpDownIcon />
                                                )}
                                            </span>
                                    </div>
                                </th>
                            ))}
                        </tr> 
                    }   
                })}                                    
            </thead>

            <tbody className="divide-y divide-gray-200 bg-white" {...getTableBodyProps()}>
                        {rows.map((row, i) => {
                        prepareRow(row);
                        return (
                                <tr {...row.getRowProps()}>
                                    {row.cells.map(cell => {
                                        return <td className="whitespace-normal px-3 py-4 text-sm text-gray-600"
                                        {...cell.getCellProps()}>{cell.render("Cell")}</td>;
                                    })}
                                </tr>
                        );
                    })}
            </tbody>
        </table>);

}

export {RulesTable}