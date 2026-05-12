import { createContext, useContext, useState, useEffect } from 'react';

/**
 * Contexto para gestionar la configuración global de la interfaz (ej: visibilidad de elementos)
 */
const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
    // Estado para controlar si se muestra o no la barra de precios (Ticker)
    // Se inicializa intentando recuperar la preferencia guardada en el navegador (localStorage)
    const [showTicker, setShowTicker] = useState(() => {
        const saved = localStorage.getItem('showTicker');
        return saved !== null ? JSON.parse(saved) : true;
    });

    // Guardamos la preferencia en el localStorage cada vez que el usuario la cambie
    useEffect(() => {
        localStorage.setItem('showTicker', JSON.stringify(showTicker));
    }, [showTicker]);

    return (
        <SettingsContext.Provider value={{ showTicker, setShowTicker }}>
            {children}
        </SettingsContext.Provider>
    );
};

// Método para usar la configuración en cualquier componente
export const useSettings = () => useContext(SettingsContext);
