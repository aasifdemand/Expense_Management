import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from "react-router-dom"
import { Provider } from "react-redux"
import { store } from './store/store.jsx'
import { Toaster } from 'react-hot-toast'
import { LocationProvider } from './contexts/LocationContext.jsx'





createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <LocationProvider>
          <App />
          <Toaster />
        </LocationProvider>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)

