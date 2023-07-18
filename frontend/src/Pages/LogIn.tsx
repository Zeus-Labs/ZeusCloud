import axios from "axios";
import { SyntheticEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { classNames } from "../utils/utils";

type User = {
    email: string
    password: string
}


async function signIn(email: string, password: string): Promise<string> {
    let message = '';
    try {
        // @ts-ignore
        const signInEndpoint = window._env_.REACT_APP_API_DOMAIN + "/api/login";
        var user: User = {
            email: email,
            password: password
        }
        
        const response = await axios.post(signInEndpoint, user,{withCredentials:true})
        console.log(response)
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response && error.response.data) {
                return message = error.response.data
            }
        }
        if (message.length === 0) {
            return message = "Log In failed, Try again later."
        }
    }
    return message;
}

export default function LogIn() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [submissionState, setSubmissionState] = useState({
        loading: false,
        message: ''
    });
    const navigate = useNavigate()

    const handleSubmit = async (e: SyntheticEvent) => {
        e.preventDefault()
        setSubmissionState({
            ...submissionState,
            loading: true,
        });
        const message = await signIn(email, password);
        if (message.length > 0) {
            setSubmissionState({
                message: message,
                loading: false,
            })
        } else {
            navigate("/",{ replace: true })
        }
    }
    return (
        <>
            <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <img
                        className="mx-auto h-10 w-auto"
                        src="/logo192.png"
                        alt="Zeus Cloud"
                    />
                    <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
                        Sign In to your account
                    </h2>
                </div>

                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                                Email address
                            </label>
                            <div className="mt-2">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    onChange={(e) => setEmail(e.target.value)}
                                    value={email}
                                    required
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                                    Password
                                </label>
                            </div>
                            <div className="mt-2">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={submissionState.loading}
                                className={classNames(
                                    submissionState.loading ? 'bg-indigo-300' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
                                    "w-full rounded-md border border-transparent py-2 px-4 text-sm font-medium text-white shadow-sm"
                                )}                            >
                                Sign In
                            </button>
                            <p className="mt-2 max-w-2xl text-sm text-red-600">
                                {submissionState.message}
                            </p>
                        </div>
                    </form>

                    <p className="mt-10 text-center text-sm text-gray-500">
                        Not Registered?{' '}
                        <a href="/signup" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
                            Sign Up Here
                        </a>
                    </p>
                </div>
            </div>
        </>
    )
}
