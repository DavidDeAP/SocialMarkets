import { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
    const [showTicker, setShowTicker] = useState(() => {
        const saved = localStorage.getItem('showTicker');
        return saved !== null ? JSON.parse(saved) : true;
    });

    useEffect(() => {
        localStorage.setItem('showTicker', JSON.stringify(showTicker));
    }, [showTicker]);

    return (
        <SettingsContext.Provider value={{ showTicker, setShowTicker }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => useContext(SettingsContext);
