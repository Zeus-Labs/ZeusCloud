import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import posthog from 'posthog-js'

// @ts-ignore
if(window._env_.REACT_APP_TELEMETRY_ENABLED!="false"){
  // @ts-ignore
  posthog.init(window._env_.REACT_APP_POSTHOG_API_KEY, 
    // @ts-ignore
    { api_host: window._env_.REACT_APP_POSTHOG_HOST,
      autocapture: false
  })
}

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
