import React from 'react';
import logo from './logo.svg';
import Nav from "./Nav";
import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  Navigate
} from "react-router-dom";
import './App.css';
import Rules from './Pages/Rules';
import Alerts from './Pages/Alerts';
import Compliance from './Pages/Compliance';
import ComplianceReport from './Components/Compliance/ComplianceReport';
import Settings from './Pages/Settings';


const WithNavbar = () => {
  return (
    <div>
      <Nav />
      <Outlet />
    </div>
  )
}

const App = () => {
  return (
    <div >
      
      <BrowserRouter>
        <Routes>
          <Route element={<WithNavbar />}>
                <Route path="/" element={<Navigate to='/alerts' replace />} />
                <Route path="/rules" element={<Rules />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/compliance" element={<Compliance />} />
                <Route path="/compliance/report/:frameworkId" element={<ComplianceReport />} />
                <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
