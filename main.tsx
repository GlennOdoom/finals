import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './Styles/index.css'
//import { AuthContext } from './Contexts/AuthenticationContext'
import { AuthProvider } from './Contexts/AuthenticationContext'


// Initialize user state
const authValue = {
  user: null,
  setUser: () => {}
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)