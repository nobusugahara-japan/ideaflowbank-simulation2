import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ChakraProvider } from '@chakra-ui/react';
import { GlobalDataProvider } from './GlobalDataContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GlobalDataProvider>
      <ChakraProvider>
        <App />
      </ChakraProvider>
    </GlobalDataProvider>
  </React.StrictMode>
);
reportWebVitals();
