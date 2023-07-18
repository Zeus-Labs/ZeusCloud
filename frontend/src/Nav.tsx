import { posthog } from 'posthog-js';
import './Nav.css';
import { NavLink, useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { UserContext } from './App';
import axios from 'axios';

const navigation = [
  { name: 'Rules', href: '/rules', current: false },
  { name: 'Alerts', href: '/alerts/misconfiguration', current: true },
  { name: 'Compliance', href: '/compliance', current: false },
  { name: 'Asset Inventory', href: '/asset-inventory', current: false },
  { name: 'Access Explorer', href: '/access-explorer', current: false },
  { name: 'Settings', href: '/settings', current: false },
]

const notLoggedNavigation = [
  { name: 'Login', href: '/login', current: false },
  { name: "Register", href: '/signup', current: false }
]

async function logout(): Promise<string> {
  let message = '';
  try {
    // @ts-ignore
    const logoutEndpoint = window._env_.REACT_APP_API_DOMAIN + "/api/logout";
    await axios.post(logoutEndpoint, null, { withCredentials: true })
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response && error.response.data) {
        return message = error.response.data
      }
    }
    if (message.length === 0) {
      return message = "User not logged in."
    }
  }
  return message;
}

const Nav = () => {
  const userEmail = useContext(UserContext)
  const [submissionState, setSubmissionState] = useState({
    loading: false,
    message: '',
  });
  const navigate = useNavigate()
  const handleLogout = async ()=>{
    setSubmissionState(prev=>({
      ...prev,
      loading: true
    }))
    const message = await logout()

    setSubmissionState({
      loading: false,
      message: message
    })

    if(message.length == 0) {
      navigate("/",{ replace: true })
    }
  }
  return (
    <nav className="bg-neutral-800">
      <>
        <div className="max-w-8xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="relative flex h-16 items-center justify-start">
            <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
              <div className="flex flex-shrink-0 items-center">
                <a href='/' className="text-xl text-white font-semibold">ZeusCloud</a>
              </div>
              <div className="sm:ml-6 flex justify-between w-full">
                <div className="flex space-x-4">
                  {navigation.map((item) => (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      onClick={() => {
                        // @ts-ignore
                        posthog.capture(`${window._env_.REACT_APP_ENVIRONMENT} Viewed ${item.name}`, { environment: window._env_.REACT_APP_ENVIRONMENT })
                      }}
                      className={({ isActive }) => isActive
                        ? "bg-neutral-900 text-white px-3 py-2 rounded-md text-sm font-medium"
                        : "text-neutral-300 hover:bg-neutral-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                      }
                      aria-current={item.current ? 'page' : undefined}
                    >
                      {item.name}
                    </NavLink>
                  ))}
                </div>
                {userEmail!==null &&
                  (userEmail === ""
                    ?
                    <div className="flex space-x-4">
                      {notLoggedNavigation.map((item) => (
                        <NavLink
                          key={item.name}
                          to={item.href}
                          onClick={() => {
                            // @ts-ignore
                            posthog.capture(`${window._env_.REACT_APP_ENVIRONMENT} Viewed ${item.name}`, { environment: window._env_.REACT_APP_ENVIRONMENT })
                          }}
                          className={({ isActive }) => isActive
                            ? "bg-neutral-900 text-white px-3 py-2 rounded-md text-sm font-medium"
                            : "text-neutral-300 hover:bg-neutral-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                          }
                          aria-current={item.current ? 'page' : undefined}
                        >
                          {item.name}
                        </NavLink>
                      ))}
                    </div>
                    :
                    <div className='mx-4'>
                      <button
                        type="submit"
                        disabled={submissionState.loading}
                        onClick={handleLogout}
                        className={
                          submissionState.loading
                            ? "bg-neutral-900 text-white px-3 py-2 rounded-md text-sm font-medium"
                            : "text-neutral-300 hover:bg-neutral-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                        }
                      >
                        Logout
                      </button>
                    </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </>
    </nav>
  )
}

export default Nav;
