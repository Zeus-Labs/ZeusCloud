import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import posthog from 'posthog-js'

// @ts-ignore
if(window._env_.TELEMETRY_ENABLED!="false"){
  // @ts-ignore
  posthog.init(window._env_.POSTHOG_API_KEY, 
    // @ts-ignore
    { api_host: window._env_.POSTHOG_HOST,
      autocapture: false
  })
}

// posthog.opt_out_capturing()
// posthog.identify("tushar")
// posthog.opt_in_capturing()
//console.log("is opted in = ",posthog.has_opted_out_capturing());

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
