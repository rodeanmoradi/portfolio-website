import React from 'react'
import ReactDOM from 'react-dom/client'
// CHANGED: Importing from lowercase 'app.jsx' to match your file
import App from './app.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)