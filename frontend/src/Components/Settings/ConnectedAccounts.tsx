import { TableComp, TableRow } from '../Shared/Table';
import Modal, { ModalBodyComponent, ModalFooterComponent } from '../Shared/Modal';
import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { classNames } from '../../utils/utils';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import { stringify } from 'querystring';
import { posthog } from 'posthog-js';

export interface account_details {
    account_name: string,
    connection_method: string,
    profile: string,
    aws_access_key_id: string,
    aws_secret_access_key: string,
    default_region: string,
    last_scan_completed: Date | null,
    is_scan_running: boolean,
    is_rules_running: boolean,
    scan_status: string,
    running_time: number,
}


export async function getAccountDetails(): Promise<account_details[]> {
    // @ts-ignore
    const getAccountDetailsEndpoint = window._env_.REACT_APP_API_DOMAIN + "/api/getAccountDetails";
    const response = await axios.get(getAccountDetailsEndpoint);   
    // @ts-ignore    
    var accountDetailsList = new Array<account_details>();
    response.data.forEach((curElement: account_details) => {
        accountDetailsList.push({
            account_name: curElement.account_name,
            connection_method: curElement.connection_method,
            profile: curElement.profile,
            aws_access_key_id: curElement.aws_access_key_id,
            aws_secret_access_key: curElement.aws_secret_access_key,
            default_region: curElement.default_region,
            last_scan_completed: curElement.last_scan_completed,
            is_scan_running: curElement.scan_status === "RUNNING" || curElement.scan_status === "RULES_RUNNING" || curElement.scan_status === "CARTOGRAPHY_PASSED",
            is_rules_running: curElement.scan_status === "RULES_RUNNING",
            scan_status: curElement.scan_status,
            running_time: curElement.running_time,
        });
    });
    return accountDetailsList;
}

async function rescan(accountName:string): Promise<string> {
    let message = '';
    try {
        // @ts-ignore
        const rescanEndpoint = window._env_.REACT_APP_API_DOMAIN + "/api/rescan";
        await axios.post(rescanEndpoint,{rescanning_account: accountName});
        // @ts-ignore
        posthog.capture(`${window._env_.REACT_APP_ENVIRONMENT} Account Rescanned`,{status:"Successful",environment: window._env_.REACT_APP_ENVIRONMENT})

    } catch (error) {
        // @ts-ignore
        posthog.capture(`${window._env_.REACT_APP_ENVIRONMENT} Account Rescanned`,{status:"Unsuccessful",environment: window._env_.REACT_APP_ENVIRONMENT})

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
    is_scan_running: boolean,
    is_rules_running: boolean,
    running_time: number,
    last_scan_completed: Date | null,
    scan_status: string,
}

const ScanStatus = ({ is_scan_running, is_rules_running, running_time, last_scan_completed, scan_status }: ScanStatusProps) => {
    function runningTimeToPercentage(runningTime: number): string {
        return ((3 + Math.min(670, runningTime)) * 100 / 700.).toFixed(1);
    }
    if (scan_status === "READY") {
        return <>Queued</>
    }
    if (is_rules_running) {
        running_time = 670
    }
    if (is_scan_running) {
        return <>In Progress: {runningTimeToPercentage(running_time)}% completed...</>
    }
    return (
        <div className='flex'>
            <span>
                <img className='w-5 mr-1' src={scan_status=="PASSED" ? "images/check.svg" : "images/cross.svg"} />
            </span>
            <span>
                {`${scan_status=="PASSED" ? "Completed" : "Failed"} ${moment.duration(moment().diff(moment(last_scan_completed))).humanize()} ago`}
            </span>
        </div>
    )
}

interface AccountDetailsDeletion {
    accountName: string;
}

async function deleteAccountDetails({ accountName }: AccountDetailsDeletion): Promise<string> {
    let message = '';
    try {
        // @ts-ignore
        const deleteAccountDetailsEndpoint = window._env_.REACT_APP_API_DOMAIN + "/api/deleteAccountDetails";
        var accountDetails = {
            account_name: accountName,
        }
        await axios.post(deleteAccountDetailsEndpoint, accountDetails);
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

interface TriggerScanProps {
    account_name: string,
    is_scan_running: boolean,
    setAccountDetailsList: React.Dispatch<React.SetStateAction<account_details[]>>
}

const TriggerScan = ({ account_name, is_scan_running, setAccountDetailsList }: TriggerScanProps) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

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
                                await rescan(account_name);
                                setAccountDetailsList(await getAccountDetails());
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
                disabled={is_scan_running}
                onClick={() => {setModalOpen(true)}}
                className='bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ml-3 inline-flex justify-center rounded-md border border-transparent py-2 px-4 text-sm font-medium text-white shadow-sm disabled:opacity-50'
            >
                Scan Account
            </button>
        </>
    )
}

interface RemoveAccountProps {
    account_name: string,
    is_scan_running: boolean,
    setAccountDetailsList: React.Dispatch<React.SetStateAction<account_details[]>>
}

const RemoveAccount = ({ account_name, is_scan_running, setAccountDetailsList }: RemoveAccountProps) => {
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
                        Are you sure you want to remove the account connection from ZeusCloud?
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
                                // @ts-ignore
                                posthog.capture(`${window._env_.REACT_APP_ENVIRONMENT} Account Removed`,{environment: window._env_.REACT_APP_ENVIRONMENT})
                                setAccountDetailsList(await getAccountDetails());
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
                disabled={is_scan_running}
                onClick={() => {setModalOpen(true)}}
                className='bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 ml-3 inline-flex justify-center rounded-md border border-transparent py-2 px-4 text-sm font-medium text-white shadow-sm disabled:opacity-50'
            >
                Remove Account
            </button>
        </>
    )
}

interface AccountActionsProps {
    account_name: string,
    is_scan_running:  boolean,
    setAccountDetailsList: React.Dispatch<React.SetStateAction<account_details[]>>
}

const AccountActions = ({ account_name, is_scan_running, setAccountDetailsList }: AccountActionsProps) => {
    let navigate = useNavigate(); 
  
    return (
        <>
            <TriggerScan account_name={account_name} is_scan_running={is_scan_running} setAccountDetailsList={setAccountDetailsList} />
            <button
                type="submit"
                disabled={is_scan_running}
                onClick={() => {
                    // @ts-ignore
                    posthog.capture(`${window._env_.REACT_APP_ENVIRONMENT} Viewed Results`,{environment: window._env_.REACT_APP_ENVIRONMENT})
                    navigate('/alerts');
                }}
                className='bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ml-3 inline-flex justify-center rounded-md border border-transparent py-2 px-4 text-sm font-medium text-white shadow-sm disabled:opacity-50'
            >
                View Results
            </button>
            <RemoveAccount account_name={account_name} is_scan_running={is_scan_running} setAccountDetailsList={setAccountDetailsList} />
        </>
    )
}


interface ConnectionDetailsProps {
    connection_method: string,
    profile:  string,
}

const ConnectionDetails = ({ connection_method, profile }: ConnectionDetailsProps) => {
    if (connection_method === "profile") {
        return <>Profile: {profile}</>
    } else if (connection_method === "access_key") {
        return <>User Access Key</>
    }

    return <></>

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
        async function asyncSetAccountDetails() {
            setAccountDetailsList(await getAccountDetails());
        }
        asyncSetAccountDetails();
        const timeout = setTimeout(()=>asyncSetAccountDetails(),2000)
        // No need to poll in read-only demo environment
        // @ts-ignore
        if (window._env_.REACT_APP_ENVIRONMENT === "Demo") {
            return
        }
        const interval = setInterval(() => { asyncSetAccountDetails(); }, 10 * 1000);
        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        }
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
                          content: <ConnectionDetails connection_method={accountDetails.connection_method} profile={accountDetails.profile}></ConnectionDetails>,
                          accessor_key: "connection_method",
                          value: accountDetails.connection_method,
                          ignoreComponentExpansion: false,
                      },
                      {
                          content: <ScanStatus is_scan_running={accountDetails.is_scan_running} is_rules_running={accountDetails.is_rules_running} running_time={accountDetails.running_time} last_scan_completed={accountDetails.last_scan_completed} scan_status={accountDetails.scan_status} />,
                          accessor_key: "scan_status",
                          value: accountDetails.is_scan_running,
                          ignoreComponentExpansion: false,
                      },
                      {
                          content: <AccountActions account_name={accountDetails.account_name} is_scan_running={accountDetails.is_scan_running} setAccountDetailsList={setAccountDetailsList} />,
                          accessor_key: "actions",
                          value: accountDetails.account_name,
                          ignoreComponentExpansion: false,
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
        "headerClassName": "w-1/5 px-3 py-3.5 uppercase text-left text-sm font-semibold text-gray-900",
    },
    {
        "headerClassName": "w-1/5 px-3 py-3.5 uppercase text-left text-sm font-semibold text-gray-900",
    },
    {
        "headerClassName": "w-1/5 px-3 py-3.5 uppercase text-left text-sm font-semibold text-gray-900",
    },
    {
        "headerClassName": "w-2/5 px-3 py-3.5 uppercase text-center text-sm font-semibold text-gray-900",
    }];

    const tableColumnHeaders =  
    [
        {
            header: "Account Name",
            accessor_key: "account_name",
            allowSorting: false,
        },
        {
            header: "Connection Details",
            accessor_key: "connection_method",
            allowSorting: false,
        },
        {
            header: "Scan Status",
            accessor_key: "scan_status",
            allowSorting: false,
        },
        {
            header: "Account Actions",
            accessor_key: "account_actions",
            allowSorting: false,
        }
    ];

    return (
        <div className="space-y-6 pt-8 sm:space-y-5 sm:pt-10">
            <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">Connected Accounts</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Manage connected accounts and monitor their scans. Visit the <b>Alerts</b> tab once scans complete!
                </p>
            </div>
            {
                ready && (
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
                )
            }
        </div>
    )
} 

export {ConnectedAccounts}