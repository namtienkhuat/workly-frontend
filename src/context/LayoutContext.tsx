import React, { createContext, useContext, ReactNode, useState, useCallback } from 'react';

type LayoutContextType = {
    leftSidebar: ReactNode | null;
    rightSidebar: ReactNode | null;
    leftSidebarInitialized: boolean;
    rightSidebarInitialized: boolean;
    setLeftSidebar: (content: ReactNode | null) => void;
    setRightSidebar: (content: ReactNode | null) => void;
    resetInitialization: () => void;
};

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider = ({ children }: { children: ReactNode }) => {
    const [leftSidebar, setLeftSidebar] = useState<ReactNode | null>(null);
    const [rightSidebar, setRightSidebar] = useState<ReactNode | null>(null);
    const [leftSidebarInitialized, setLeftSidebarInitialized] = useState(false);
    const [rightSidebarInitialized, setRightSidebarInitialized] = useState(false);

    const handleSetLeftSidebar = useCallback((content: ReactNode | null) => {
        setLeftSidebar(content);
        setLeftSidebarInitialized(true);
    }, []);

    const handleSetRightSidebar = useCallback((content: ReactNode | null) => {
        setRightSidebar(content);
        setRightSidebarInitialized(true);
    }, []);

    const resetInitialization = useCallback(() => {
        setLeftSidebarInitialized(false);
        setRightSidebarInitialized(false);
        setLeftSidebar(null);
        setRightSidebar(null);
    }, []);

    return (
        <LayoutContext.Provider
            value={{
                leftSidebar,
                rightSidebar,
                leftSidebarInitialized,
                rightSidebarInitialized,
                setLeftSidebar: handleSetLeftSidebar,
                setRightSidebar: handleSetRightSidebar,
                resetInitialization,
            }}
        >
            {children}
        </LayoutContext.Provider>
    );
};

export const useLayout = () => {
    const context = useContext(LayoutContext);
    if (!context) throw new Error('useLayout must be used within LayoutProvider');
    return context;
};
