// GlobalDataContext.js
import React, { createContext, useContext, useState } from 'react';

const GlobalDataContext = createContext();

export const GlobalDataProvider = ({ children }) => {
    const [data, setData] = useState([]); // この初期状態は空の配列にしておきます

    return (
        <GlobalDataContext.Provider value={{ data, setData }}>
            {children}
        </GlobalDataContext.Provider>
    );
}

export const useGlobalData = () => {
    return useContext(GlobalDataContext);
}
