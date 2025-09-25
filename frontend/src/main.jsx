import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from "react-router-dom"
import { AuthProvider } from './contexts/AuthContext.jsx'
import { ThemeProvider } from '@mui/material'
import { CssVarsProvider } from "@mui/material/styles";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CssVarsProvider defaultMode="light">
      <AuthProvider>

        <BrowserRouter>
          <App />
        </BrowserRouter>

      </AuthProvider>
    </CssVarsProvider>
  </StrictMode>,
)

