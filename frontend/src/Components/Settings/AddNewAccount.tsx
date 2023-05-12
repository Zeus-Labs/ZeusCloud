import { useState, useEffect } from 'react';
import { classNames } from '../../utils/utils'

import axios from 'axios';
import posthog from 'posthog-js'
import Select,{ StylesConfig } from 'react-select';

interface AccountDetailsSubmission {
    accountName: string;
    connectionMethod: string;
    profile: string;
    awsAccessKeyId: string;
    awsSecretAccessKey: string;
    regionNames: string[];
    vulnerabilityScan: string;
}

async function addAccountDetails({accountName, connectionMethod, profile, awsAccessKeyId, awsSecretAccessKey,regionNames,vulnerabilityScan}: AccountDetailsSubmission): Promise<string> {
    let message = '';
    try {
        // @ts-ignore
        const addAccountDetailsEndpoint = window._env_.REACT_APP_API_DOMAIN + "/api/addAccountDetails";
        var accountDetails = connectionMethod === "profile" ? {
            account_name: accountName,
            connection_method: connectionMethod,
            profile: profile,
            region_names: regionNames,
            vulnerability_scan:vulnerabilityScan
        } : {
            account_name: accountName,
            connection_method: connectionMethod,
            aws_access_key_id: awsAccessKeyId,
            aws_secret_access_key: awsSecretAccessKey,
            region_names: regionNames,
            vulnerability_scan:vulnerabilityScan
        }
        await axios.post(addAccountDetailsEndpoint, accountDetails);
        // @ts-ignore
        posthog.capture(`${window._env_.REACT_APP_ENVIRONMENT} Add Account`,{status:"Successful",environment: window._env_.REACT_APP_ENVIRONMENT})
    } catch (error) {
         // @ts-ignore
        posthog.capture(`${window._env_.REACT_APP_ENVIRONMENT} Add Account`,{status:"Unsuccessful",environment: window._env_.REACT_APP_ENVIRONMENT})
        if (axios.isAxiosError(error)) {
            if (error.response && error.response.data) {
                return message = "Encountered an error in submitting account details: " + error.response.data
            } 
        }
        if (message.length === 0) {
            return message = "Encountered an error in submitting account details"
        }
    }
    return message;
}

export async function getAwsProfiles(): Promise<string[]> {
    // @ts-ignore
    const getAwsProfilesEndpoint = window._env_.REACT_APP_API_DOMAIN + "/api/getAwsProfiles";
    const response = await axios.get(getAwsProfilesEndpoint);   
    
    var awsProfilesList = new Array<string>();
    if (response.data && response.data.aws_profiles) {
        response.data.aws_profiles.forEach((aws_profile: string) => {
            awsProfilesList.push(aws_profile);
        });    
    }
    return awsProfilesList;
}
  

interface AddNewAccountProps   {
    onSubmitCallback: () => void
};

interface RegionOption {
    value: string,
    label: string
}

  const regionStyles: StylesConfig<RegionOption> = {
    control: (provided: Record<string, unknown>, state: any) => ({
      ...provided,
      border: state.isFocused ? "1px solid #6366F1" : "1px solid rgb(209 213 219 / var(--tw-border-opacity))", 
      borderColor: state.isFocused ? "#6366F1" : "rgb(209 213 219 )",
      borderRadius: "6px",
      boxShadow: state.isFocused && "0 0 0 1px #6366F1",       
      "&:hover": {
        borderColor: state.isFocused ? "#6366F1" : "rgb(209 213 219 )",
      }
    })
  };

const regionOptions:RegionOption[] = [
    { value: 'All Regions', label: 'All Regions' },
    { value: 'us-east-1', label: 'us-east-1' },
    { value: 'us-east-2', label: 'us-east-2' },
    { value: 'us-west-1', label: 'us-west-1' },
    { value: 'us-west-2', label: 'us-west-2' },
    { value: 'af-south-1', label: 'af-south-1' },
    { value: 'ap-east-1', label: 'ap-east-1' },
    { value: 'ap-south-1', label: 'ap-south-1' },
    { value: 'ap-south-2', label: 'ap-south-2' },
    { value: 'ap-northeast-1', label: 'ap-northeast-1' },
    { value: 'ap-northeast-2', label: 'ap-northeast-2' },
    { value: 'ap-northeast-3', label: 'ap-northeast-3' },
    { value: 'ap-southeast-1', label: 'ap-southeast-1' },
    { value: 'ap-southeast-2', label: 'ap-southeast-2' },
    { value: 'ap-southeast-3', label: 'ap-southeast-3' },
    { value: 'ca-central-1', label: 'ca-central-1' },
    { value: 'eu-central-1', label: 'eu-central-1' },
    { value: 'eu-central-2', label: 'eu-central-2' },
    { value: 'eu-west-1', label: 'eu-west-1' },
    { value: 'eu-west-2', label: 'eu-west-2' },
    { value: 'eu-west-3', label: 'eu-west-3' },
    { value: 'eu-north-1', label: 'eu-north-1' },
    { value: 'eu-south-1', label: 'eu-south-1' },
    { value: 'eu-south-2', label: 'eu-south-2' },
    { value: 'me-south-1', label: 'me-south-1' },
    { value: 'me-central-1', label: 'me-central-1' },
    { value: 'sa-east-1', label: 'sa-east-1' },
  ];


const AddNewAccount = (props: AddNewAccountProps) => {
    const [accountName, setAccountName] = useState("");
    const [connectionMethod, setConnectionMethod] = useState("profile");
    const [profile, setProfile] = useState("");
    const [awsAccessKeyId, setAwsAccessKeyId] = useState("");
    const [awsSecretAccessKey, setAwsSecretAccessKey] = useState("");
    const [regions,setRegions] = useState<Array<RegionOption>>([regionOptions[0]])
    const [vulnerabilityScan, setVulnerabilityScan] = useState("None")

    const [awsProfiles, setAwsProfiles] = useState<string[]>([]);
    const [ready, setReady] = useState(false)

    const [submissionState, setSubmissionState] = useState({
        loading: false,
        message: '',
    });

    // Pull aws profiles
    useEffect(() => {
        async function asyncSetAwsProfiles() {
            const awsProfiles = await getAwsProfiles()
            setAwsProfiles(awsProfiles);
            if (awsProfiles && awsProfiles.length > 0) {
                setProfile(awsProfiles[0])
            }
        }
        asyncSetAwsProfiles();
        setReady(true);
    }, []);

    const { onSubmitCallback } = props;

    const onSubmit = async function() {
        setSubmissionState({
            ...submissionState,
            loading: true,
        });
        const message = regions.length===0
        ? "The Regions dropdown cannot be empty."
        : await addAccountDetails({
            accountName: accountName,
            connectionMethod: connectionMethod,
            profile: profile,
            awsAccessKeyId: awsAccessKeyId,
            awsSecretAccessKey: awsSecretAccessKey,
            regionNames: regions.map(region=>region.value),
            vulnerabilityScan:vulnerabilityScan 
        });
        if (message.length > 0) {
            setSubmissionState({
                ...submissionState,
                message: message,
                loading: false,
            });
        } else {
            onSubmitCallback();
        }
    }

    return (
        <div className="space-y-6 pt-8 sm:space-y-5 sm:pt-10">
            <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">Add a New AWS Account</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Create an IAM role or user and attach the <a className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600" href="https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_job-functions.html#jf_security-auditor">SecurityAudit policy</a>.
                    Then, create a named profile or create an access key for the user. <a className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600" href="https://docs.zeuscloud.io/introduction/get-started">Read here</a> for more detailed instructions.
                </p>
            </div>
            {
                ready && 
                (<>
                    <div className="space-y-6 sm:space-y-5">
                        <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
                            <label htmlFor="account-name" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                                Account Name
                            </label>
                            <div className="mt-1 sm:col-span-2 sm:mt-0">
                                <input
                                    type="text"
                                    name="account-name"
                                    id="account-name"
                                    autoComplete="account-name"
                                    onChange={(event) => setAccountName(event.target.value)}
                                    value={accountName}                    
                                    className="block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:max-w-xs sm:text-sm"
                                />
                            </div>
                        </div>
                        <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
                            <label htmlFor="connection-method" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                                Connection Method
                            </label>
                            <div className="mt-1 sm:col-span-2 sm:mt-0">
                                <select
                                    id="connection-method"
                                    name="connection-method"
                                    onChange = {(event) => setConnectionMethod(event.target.value)}
                                    value = {connectionMethod}
                                    className="block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:max-w-xs sm:text-sm"
                                >
                                    <option value="profile">Named Profile</option>
                                    <option value="access_key">User Access Key</option>
                                </select>
                            </div>
                        </div>
                        {
                            connectionMethod === "access_key" && 
                            <>
                                <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
                                    <label htmlFor="aws-access-key-id" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                                        AWS Access Key ID
                                    </label>
                                    <div className="mt-1 sm:col-span-2 sm:mt-0">
                                        <input
                                            type="text"
                                            name="aws-access-key-id"
                                            id="aws-access-key-id"
                                            autoComplete="aws-access-key-id"
                                            onChange={(event) => setAwsAccessKeyId(event.target.value)}
                                            value={awsAccessKeyId}                    
                                            className="block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:max-w-xs sm:text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
                                    <label htmlFor="aws-access-key-id" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                                        AWS Secret Access Key
                                    </label>
                                    <div className="mt-1 sm:col-span-2 sm:mt-0">
                                        <input
                                            type="password"
                                            name="aws-secret-access-key"
                                            id="aws-secret-access-key"
                                            autoComplete="aws-secret-access-key"
                                            onChange={(event) => setAwsSecretAccessKey(event.target.value)}
                                            value={awsSecretAccessKey}                    
                                            className="block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:max-w-xs sm:text-sm"
                                        />
                                    </div>
                                </div>
                            </>
                        }
                        {
                            connectionMethod === "profile" && 
                            <>
                                <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
                                    <label htmlFor="profile" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                                        Profile
                                    </label>
                                    <div className="mt-1 sm:col-span-2 sm:mt-0">
                                        <select
                                            id="profile"
                                            name="profile"
                                            onChange = {(event) => setProfile(event.target.value)}
                                            value = {profile}
                                            className="block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:max-w-xs sm:text-sm"
                                        >
                                            {awsProfiles.map((profile) => { return <option key={profile}>{profile}</option> })}
                                        </select>
                                    </div>
                                </div>
                            </>
                        }
                        <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
                            <label htmlFor="regions" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                                Regions
                            </label>
                            <div className="mt-1 sm:col-span-2 sm:mt-0">
                                <Select
                                    id="regions"
                                    name="regions"
                                    isMulti = {true}
                                    value={regions}
                                    onChange = {(selected:any)=>{
                                        // Assign All Regions value to the regions state variable when all regions option is selected
                                        selected.find((option:RegionOption) => option.value === "All Regions") 
                                        ? setRegions([regionOptions[0]]) 
                                        : setRegions(selected)
                                    }}
                                    options={regionOptions}
                                    styles={regionStyles}
                                    isOptionDisabled={((option:RegionOption)=> {
                                        if(option.value !== "All Regions" && regions.length==1 && regions[0].value==="All Regions"){
                                            return true
                                        } 
                                        return false
                                    })}
                                    
                                    className="block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:max-w-xs sm:text-sm"
                                />
                            </div>
                        </div>
                        <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
                            <label htmlFor="vulnerabilityScan" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                                Vulnerability Scan
                            </label>
                            <div className="mt-1 sm:col-span-2 sm:mt-0">
                                <select
                                    id="vulnerabilityScan"
                                    name="vulnerabilityScan"
                                    onChange = {(event) => setVulnerabilityScan(event.target.value)}
                                    value = {vulnerabilityScan}
                                    className="block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:max-w-xs sm:text-sm"
                                >
                                    <option>None</option>
                                    <option>Nuclei</option>
                                </select>
                            </div>
                        </div>
                        <div className="pt-5">
                            <div className="flex justify-end">
                                <p className="mt-1 max-w-2xl text-sm text-red-600">
                                    {submissionState.message}
                                </p>
                                <button
                                    type="submit"
                                    disabled={submissionState.loading}
                                    onClick={onSubmit}
                                    className={classNames(
                                        submissionState.loading ? 'bg-indigo-300' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
                                        "ml-3 inline-flex justify-center rounded-md border border-transparent py-2 px-4 text-sm font-medium text-white shadow-sm"
                                    )}
                                >
                                    Add Account
                                </button>
                            </div>
                        </div>
                    </div>
                </>)
            }
        </div>
    )
}

export {AddNewAccount}