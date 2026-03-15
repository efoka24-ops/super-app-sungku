import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import '../styles/index.css'
import { initPushNotifications } from './lib/core/notifications/pushNotifications'

void initPushNotifications()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
