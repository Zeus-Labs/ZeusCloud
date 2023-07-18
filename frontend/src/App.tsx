import Nav from "./Nav";
import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  useNavigate,
  useLocation,
} from "react-router-dom";
import './App.css';
import Rules from './Pages/Rules';
import Alerts from './Pages/Alerts';
import Compliance from './Pages/Compliance';
import ComplianceReport from './Components/Compliance/ComplianceReport';
import Settings from './Pages/Settings';
import { createContext, useEffect, useState } from "react";

import { getAccountDetails } from './Components/Settings/ConnectedAccounts';
import AssetsInventory from "./Pages/AssetsInventory";
import Explore from "./Pages/Explore";
import NotFound from "./Pages/404Page";
import LogIn from "./Pages/LogIn";
import SignUp from "./Pages/SignUp";
import axios from "axios";

async function getLoggedInUser(setEmail:React.Dispatch<React.SetStateAction<string | null>>): Promise<string> {
  let message = '';
  try {
      // @ts-ignore
      const userEndpoint = window._env_.REACT_APP_API_DOMAIN + "/api/user";
      const response = await axios.get(userEndpoint,{withCredentials:true})
      setEmail(response.data.email)
  } catch (error) {
      setEmail("")
      if (axios.isAxiosError(error)) {
          if (error.response && error.response.data) {
               message = error.response.data
          }
      }
      if (message.length === 0) {
           message = "User not logged in."
      }
  }
  return message;
}

const WithNavbar = () => {
  return (
    <div>
      <Nav />
      <Outlet />
    </div>
  )
}

const HomeResolver = ({setEmail}:{setEmail:React.Dispatch<React.SetStateAction<string | null>>}) => {
  const navigate = useNavigate();
  useEffect(() => {
    async function parseAndRedirect() {
      const accountDetailsList = await getAccountDetails();
      const num_scans_running = accountDetailsList.filter(
        (accountDetails) => accountDetails.scan_status === "READY" || accountDetails.scan_status === "RUNNING" || accountDetails.scan_status === "CARTOGRAPHY_PASSED" || accountDetails.scan_status === "RULES_RUNNING"
      ).length
      if (accountDetailsList.length === 0) {
        navigate('/settings', { replace: true, state: { name: "Add New Account" } });
      } else if (num_scans_running > 0) {
        navigate('/settings', { replace: true, state: { name: "Connected Accounts" } });
      } else {
        navigate('/alerts/misconfiguration', { replace: true });
      }
    }
    getLoggedInUser(setEmail)
    parseAndRedirect(); 
  }, [navigate]);

  return <></>
}

export const UserContext = createContext<string|null>(null)

const App = () => {
  const [userEmail,setUserEmail] = useState<string|null>(null)
  
  useEffect(()=>{
    getLoggedInUser(setUserEmail)
  },[])

  return (
    <UserContext.Provider value={userEmail}>
      <div >
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomeResolver setEmail={setUserEmail} />} />
            <Route path="/login" element={<LogIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route element={<WithNavbar />}>
                  <Route path="/rules" element={<Rules />} />
                  <Route path="/alerts/:ruleCategory" element={<Alerts />} />
                  <Route path="/alerts/:ruleCategory/:rule_uid/:alert_resource_id" element={<Alerts />} />
                  <Route path="/compliance" element={<Compliance />} />
                  <Route path="/compliance/report/:frameworkId" element={<ComplianceReport />} />
                  <Route path="/asset-inventory" element={<AssetsInventory />} />
                  <Route path="/access-explorer" element={<Explore />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<NotFound/>} />
            </Route>
          </Routes>
        </BrowserRouter>
      </div>
    </UserContext.Provider>
  );
}

export default App;
