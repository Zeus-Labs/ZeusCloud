import Nav from "./Nav";
import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  useNavigate,
} from "react-router-dom";
import './App.css';
import Rules from './Pages/Rules';
import Alerts from './Pages/Alerts';
import Compliance from './Pages/Compliance';
import ComplianceReport from './Components/Compliance/ComplianceReport';
import Settings from './Pages/Settings';
import { useEffect } from "react";

import { getAccountDetails } from './Components/Settings/ConnectedAccounts';
import AssetsInventory from "./Pages/AssetsInventory";
import Explore from "./Pages/Explore";
import NotFound from "./Pages/404Page";

const WithNavbar = () => {
  return (
    <div>
      <Nav />
      <Outlet />
    </div>
  )
}

const HomeResolver = () => {
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
    parseAndRedirect(); 
  }, [navigate]);

  return <></>
}

const App = () => {
  return (
    <div >
      
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeResolver/>} />
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
  );
}

export default App;
