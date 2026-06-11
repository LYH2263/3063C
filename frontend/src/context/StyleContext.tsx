import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

interface StyleConfig {
    primaryColor: string;
    fontFamily: string;
    backgroundImage: string | null;
    layoutMode: 'SINGLE' | 'DUAL';
}

interface StyleContextType {
    style: StyleConfig | null;
    refreshStyle: () => Promise<void>;
    applyLocalStylePreview: (newStyle: Partial<StyleConfig>) => void;
}

const StyleContext = createContext<StyleContextType>({
    style: null,
    refreshStyle: async () => { },
    applyLocalStylePreview: () => { },
});

export const StyleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [style, setStyle] = useState<StyleConfig | null>(null);

    const applyCSSVariables = (cfg: StyleConfig) => {
        const root = document.documentElement;
        root.style.setProperty('--color-primary', cfg.primaryColor);
        root.style.setProperty('--font-family', cfg.fontFamily);

        if (cfg.backgroundImage) {
            root.style.setProperty('--background-image', `url(${cfg.backgroundImage})`);
        } else {
            root.style.setProperty('--background-image', 'none');
        }
    };

    const refreshStyle = async () => {
        try {
            const res: any = await api.get('/styles/active');
            const activeStyle = res.data;
            setStyle(activeStyle);
            applyCSSVariables(activeStyle);
        } catch (err) {
            console.error('Failed to load active style', err);
            // Fallback vars already exist in index.css
        }
    };

    const applyLocalStylePreview = (newStyle: Partial<StyleConfig>) => {
        if (!style) return;
        const merged = { ...style, ...newStyle };
        setStyle(merged as StyleConfig);
        applyCSSVariables(merged as StyleConfig);
    };

    useEffect(() => {
        refreshStyle();
    }, []);

    return (
        <StyleContext.Provider value={{ style, refreshStyle, applyLocalStylePreview }}>
            {children}
        </StyleContext.Provider>
    );
};

export const useStyle = () => useContext(StyleContext);
