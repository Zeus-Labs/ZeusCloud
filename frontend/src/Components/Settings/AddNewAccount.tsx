import { useState, useEffect } from 'react';
import { classNames } from '../../utils/utils'

import axios from 'axios';
import posthog from 'posthog-js'

interface AccountDetailsSubmission {
    accountName: string;
    connectionMethod: string;
    profile: string;
    awsAccessKeyId: string;
    awsSecretAccessKey: string;
    defaultRegion: string;
    vulnerabilityScan: string;
}

async function addAccountDetails({accountName, connectionMethod, profile, awsAccessKeyId, awsSecretAccessKey, defaultRegion,vulnerabilityScan}: AccountDetailsSubmission): Promise<string> {
    let message = '';
    try {
        // @ts-ignore
        const addAccountDetailsEndpoint = window._env_.REACT_APP_API_DOMAIN + "/api/addAccountDetails";
        var accountDetails = connectionMethod === "profile" ? {
            account_name: accountName,
            connection_method: connectionMethod,
            profile: profile,
            vulnerability_scan:vulnerabilityScan
        } : {
            account_name: accountName,
            connection_method: connectionMethod,
            aws_access_key_id: awsAccessKeyId,
            aws_secret_access_key: awsSecretAccessKey,
            default_region: defaultRegion,
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

const AddNewAccount = (props: AddNewAccountProps) => {
    const [accountName, setAccountName] = useState("");
    const [connectionMethod, setConnectionMethod] = useState("profile");
    const [profile, setProfile] = useState("");
    const [awsAccessKeyId, setAwsAccessKeyId] = useState("");
    const [awsSecretAccessKey, setAwsSecretAccessKey] = useState("");
    const [defaultRegion, setDefaultRegion] = useState("us-east-1");
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
        const message = await addAccountDetails({
            accountName: accountName,
            connectionMethod: connectionMethod,
            profile: profile,
            awsAccessKeyId: awsAccessKeyId,
            awsSecretAccessKey: awsSecretAccessKey,
            defaultRegion: defaultRegion,
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
                                <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
                                    <label htmlFor="default-region" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                                        Default Region
                                    </label>
                                    <div className="mt-1 sm:col-span-2 sm:mt-0">
                                        <select
                                            id="default-region"
                                            name="default-region"
                                            onChange = {(event) => setDefaultRegion(event.target.value)}
                                            value = {defaultRegion}
                                            className="block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:max-w-xs sm:text-sm"
                                        >
                                            <option>us-east-1</option>
                                            <option>us-east-2</option>
                                            <option>us-west-1</option>
                                            <option>us-west-2</option>
                                            <option>af-south-1</option>
                                            <option>ap-east-1</option>
                                            <option>ap-south-1</option>
                                            <option>ap-south-2</option>
                                            <option>ap-northeast-1</option>
                                            <option>ap-northeast-2</option>
                                            <option>ap-northeast-3</option>
                                            <option>ap-southeast-1</option>
                                            <option>ap-southeast-2</option>
                                            <option>ap-southeast-3</option>
                                            <option>ca-central-1</option>
                                            <option>eu-central-1</option>
                                            <option>eu-central-2</option>
                                            <option>eu-west-1</option>
                                            <option>eu-west-2</option>
                                            <option>eu-west-3</option>
                                            <option>eu-north-1</option>
                                            <option>eu-south-1</option>
                                            <option>eu-south-2</option>
                                            <option>me-south-1</option>
                                            <option>me-central-1</option>
                                            <option>sa-east-1</option>
                                        </select>
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
                </>)
            }
        </div>
    )
}

export {AddNewAccount}