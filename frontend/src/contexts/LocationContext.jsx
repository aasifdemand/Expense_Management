/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react"

const LocationContext = createContext(null)

export const LocationProvider = ({ children }) => {

    const [currentLoc, setCurrentLoc] = useState(() => {
        const saved = localStorage.getItem('selectedLocation');
        return saved || "OVERALL";
    });


    useEffect(() => {
        localStorage.setItem('selectedLocation', currentLoc);
    }, [currentLoc]);

    return (
        <LocationContext.Provider value={{ currentLoc, setCurrentLoc }}>
            {children}
        </LocationContext.Provider>
    )
}

export const useLocation = () => {
    const context = useContext(LocationContext);
    if (!context) {
        throw new Error('useLocation must be used within a LocationProvider');
    }
    return context;
}