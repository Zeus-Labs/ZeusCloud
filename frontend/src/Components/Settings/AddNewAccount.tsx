import { useState } from 'react';
import { classNames } from '../../utils/utils'

import axios from 'axios';

interface AccountDetailsSubmission {
    accountName: string;
    awsAccessKeyId: string;
    awsSecretAccessKey: string;
    defaultRegion: string;
}


async function addAccountDetails({accountName, awsAccessKeyId, awsSecretAccessKey, defaultRegion}: AccountDetailsSubmission): Promise<string> {
    let message = '';
    try {
        const addAccountDetailsEndpoint = process.env.REACT_APP_API_DOMAIN + "/api/addAccountDetails";
        var accountDetails = {
            account_name: accountName,
            aws_access_key_id: awsAccessKeyId,
            aws_secret_access_key: awsSecretAccessKey,
            default_region: defaultRegion,
        }
        const _ = await axios.post(addAccountDetailsEndpoint, accountDetails);
    } catch (error) {
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
  

interface AddNewAccountProps   {
    onSubmitCallback: () => void
};

const AddNewAccount = (props: AddNewAccountProps) => {
    const [accountName, setAccountName] = useState("");
    const [awsAccessKeyId, setAwsAccessKeyId] = useState("");
    const [awsSecretAccessKey, setAwsSecretAccessKey] = useState("");
    const [defaultRegion, setDefaultRegion] = useState("us-east-1");

    const [submissionState, setSubmissionState] = useState({
        loading: false,
        message: '',
    });

    const { onSubmitCallback } = props;

    const onSubmit = async function() {
        setSubmissionState({
            ...submissionState,
            loading: true,
        });
        const message = await addAccountDetails({
            accountName: accountName,
            awsAccessKeyId: awsAccessKeyId,
            awsSecretAccessKey: awsSecretAccessKey,
            defaultRegion: defaultRegion,
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
                    Create an IAM user. 
                    Add the <a className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600" href="https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_job-functions.html#jf_security-auditor">Security Audity policy</a> to 
                    it. <a className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600" href="https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html">Create an access key</a> for the user.
                </p>
            </div>
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
    )
}

export {AddNewAccount}