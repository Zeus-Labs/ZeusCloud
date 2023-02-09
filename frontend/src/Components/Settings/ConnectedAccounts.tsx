import { TableComp, TableRow } from '../Shared/Table';
import Modal, { ModalBodyComponent, ModalFooterComponent } from '../Shared/Modal';
import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { classNames } from '../../utils/utils'

import axios from 'axios';


interface account_details {
    account_name: string,
    aws_access_key_id: string,
    aws_secret_access_key: string,
    default_region: string,
    is_scan_running: boolean
}


async function getAccountDetails(setAccountDetailsList: React.Dispatch<React.SetStateAction<account_details[]>>) {
    let message = '';
    try {
        const getAccountDetailsEndpoint = process.env.REACT_APP_API_DOMAIN + "/api/getAccountDetails";
        const response = await axios.get(getAccountDetailsEndpoint);   
        const isScanRunningEndpoint = process.env.REACT_APP_API_DOMAIN + "/api/isScanRunning";
        const responseRunning = await axios.get(isScanRunningEndpoint);
     
        var accountDetailsList = new Array<account_details>();
        response.data.map((curElement: account_details) => {
            accountDetailsList.push({
                account_name: curElement.account_name,
                aws_access_key_id: curElement.aws_access_key_id,
                aws_secret_access_key: curElement.aws_secret_access_key,
                default_region: curElement.default_region,
                is_scan_running: responseRunning.data.status === "RUNNING",
            });
        });
        setAccountDetailsList(accountDetailsList);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response && error.response.data) {
                return message = "Encountered an error getting account details: " + error.response.data
            } 
        }
        if (message.length === 0) {
            return message = "Encountered an error in getting account details"
        }
    }
    return message;
}

async function rescan(): Promise<string> {
    let message = '';
    try {
        const rescanEndpoint = process.env.REACT_APP_API_DOMAIN + "/api/rescan";
        const _ = await axios.post(rescanEndpoint);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response && error.response.data) {
                return message = "Encountered an error in rescanning account: " + error.response.data
            } 
        }
        if (message.length === 0) {
            return message = "Encountered an error in rescanning account"
        }
    }
    return message;
}


interface ScanStatusProps {
    is_scan_running: boolean
    account_name: string
    setAccountDetailsList: React.Dispatch<React.SetStateAction<account_details[]>>
}

const ScanStatus = ({ is_scan_running, account_name, setAccountDetailsList }: ScanStatusProps) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    if (is_scan_running) {
        return <>In Progress</>
    }
    return (
        <>
            <Modal open={modalOpen} setOpen={setModalOpen}>
                <ModalBodyComponent>
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                        Scan Account
                    </Dialog.Title>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        Are you sure you want to trigger a scan of the account {account_name}?
                    </p>
                </ModalBodyComponent>
                <ModalFooterComponent>
                    <div className="flex space-x-2">
                        <button
                            type="button"
                            disabled={loading}
                            className={classNames(
                                loading ? 'bg-indigo-300' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
                                "inline-flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium text-white shadow-sm sm:col-start-2 sm:text-sm"
                            )}
                            onClick={async function () {
                                setLoading(true);
                                await rescan()
                                await getAccountDetails(setAccountDetailsList);
                                setModalOpen(false);
                                setTimeout(() => {setLoading(false)}, 500);
                            }}
                        >
                            Scan
                        </button>
                        <button
                            type="button"
                            className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm"
                            onClick={() => setModalOpen(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </ModalFooterComponent>
            </Modal>
            <button
                type="submit"
                onClick={() => {setModalOpen(true)}}
                className='bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ml-3 inline-flex justify-center rounded-md border border-transparent py-2 px-4 text-sm font-medium text-white shadow-sm'
            >
                Scan
            </button>
        </>
    )
}

interface AccountDetailsDeletion {
    accountName: string;
}

async function deleteAccountDetails({ accountName }: AccountDetailsDeletion): Promise<string> {
    let message = '';
    try {
        const deleteAccountDetailsEndpoint = process.env.REACT_APP_API_DOMAIN + "/api/deleteAccountDetails";
        var accountDetails = {
            account_name: accountName,
        }
        const _ = await axios.post(deleteAccountDetailsEndpoint, accountDetails);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response && error.response.data) {
                return message = "Encountered an error in deleting account details: " + error.response.data
            } 
        }
        if (message.length === 0) {
            return message = "Encountered an error in deleting account details"
        }
    }
    return message;
}

interface RemoveAccountProps {
    account_name: string
    setAccountDetailsList: React.Dispatch<React.SetStateAction<account_details[]>>
}

const RemoveAccount = ({ account_name, setAccountDetailsList }: RemoveAccountProps) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
  
    return (
        <>
            <Modal open={modalOpen} setOpen={setModalOpen}>
                <ModalBodyComponent>
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                        Remove Account
                    </Dialog.Title>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        Are you sure you want to remove the account connection from IronCloud?
                    </p>
                </ModalBodyComponent>
                <ModalFooterComponent>
                    <div className="flex space-x-2">
                        <button
                            type="button"
                            disabled={loading}
                            className={classNames(
                                loading ? 'bg-rose-300' : 'bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2',
                                "inline-flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium text-white shadow-sm sm:col-start-2 sm:text-sm"
                            )}
                            onClick={async function () {
                                setLoading(true);
                                await deleteAccountDetails({
                                    accountName: account_name
                                });
                                await getAccountDetails(setAccountDetailsList);
                                setModalOpen(false);
                                setTimeout(() => {setLoading(false)}, 500);
                            }}
                        >
                            Remove
                        </button>
                        <button
                            type="button"
                            className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm"
                            onClick={() => setModalOpen(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </ModalFooterComponent>
            </Modal>  
            <button
                type="submit"
                onClick={() => {setModalOpen(true)}}
                className='bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 ml-3 inline-flex justify-center rounded-md border border-transparent py-2 px-4 text-sm font-medium text-white shadow-sm'
            >
                Remove
            </button>
        </>
    )
}

const ConnectedAccounts = () => {
    // accountDetailsList stores account details info pulled from the server
    const [accountDetailsList, setAccountDetailsList] = useState<account_details[]>([]);

    // allRows is a state variable which has all the table rows initially pulled.
    const [allRows, setAllRows] = useState<TableRow[]>([]);
    
    // For initial display of table.
    const [ready, setReady] = useState(false)

    // Pull initial rules information. Only runs the very first render.
    useEffect(() => {
        getAccountDetails(setAccountDetailsList);
    }, []);

    // Set all table rows.
    useEffect(() => {
        var allTableRows = accountDetailsList.map((accountDetails) =>
            {
              return {
                  columns: [
                      {
                          content: accountDetails.account_name,
                          accessor_key: "account_name",
                          value: accountDetails.account_name,
                          ignoreComponentExpansion: false,
                      },
                      {
                          content: <ScanStatus is_scan_running={accountDetails.is_scan_running} account_name={accountDetails.account_name} setAccountDetailsList={setAccountDetailsList} />,
                          accessor_key: "scan_status",
                          value: accountDetails.is_scan_running,
                          ignoreComponentExpansion: false,
                      },
                      {
                          content: <RemoveAccount account_name={accountDetails.account_name} setAccountDetailsList={setAccountDetailsList} />,
                          accessor_key: "remove",
                          value: accountDetails.account_name,
                          ignoreComponentExpansion: true,
                      },
                  ],
                  rowId: accountDetails.account_name,
              }
          }
        );

        setAllRows(allTableRows);
    }, [accountDetailsList]);

    useEffect(() => {
        setTimeout(() => setReady(true), 100)
    }, []);



    const tableHeaderCSS = [{
        "headerClassName": "w-1/2 px-3 py-3.5 uppercase text-left text-sm font-semibold text-gray-900",
    },
    {
        "headerClassName": "w-1/4 px-3 py-3.5 uppercase text-left text-sm font-semibold text-gray-900",
    },
    {
        "headerClassName": "w-1/4 px-3 py-3.5 uppercase text-left text-sm font-semibold text-gray-900",
    }];

    const tableColumnHeaders =  
    [
        {
            header: "Account Name",
            accessor_key: "account_name",
            allowSorting: false,
        },
        {
            header: "Scan Status",
            accessor_key: "scan_status",
            allowSorting: false,
        },
        {
            header: "Remove Account",
            accessor_key: "remove",
            allowSorting: false,
        }
    ];

    if (ready) {
        return (
            <div className="mt-12 flex flex-col">
                <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                                <TableComp
                                    tableFixed={true}
                                    tableColumnHeaders={tableColumnHeaders}
                                    tableHeaderCSS={tableHeaderCSS}
                                    tableRows={allRows}
                                />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
    return <></>
} 

export {ConnectedAccounts}