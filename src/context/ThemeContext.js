// import { createContext, useEffect, useState } from 'react';
// import { getTheme } from '../theme/theme.js';

// export const ThemeContext = createContext();

// export const ThemeProvider = ({ children }) => {
//   const [isDarkMode, setIsDarkMode] = useState(false);
//   const [theme, setTheme] = useState(getTheme(false));

//   useEffect(() => {
//     const storedTheme = localStorage.getItem('isDarkMode');
//     if (storedTheme !== null) {
//       try {
//         const darkMode = JSON.parse(storedTheme);
//         setIsDarkMode(darkMode);
//         setTheme(getTheme(darkMode));
//       } catch (error) {
//         console.error('Error parsing theme from localStorage:', error);
//       }
//     }
//   }, []);

//   const toggleTheme = () => {
//     const newIsDarkMode = !isDarkMode;
//     setIsDarkMode(newIsDarkMode);
//     setTheme(getTheme(newIsDarkMode));
//     try {
//       localStorage.setItem('isDarkMode', JSON.stringify(newIsDarkMode));
//     } catch (error) {
//       console.error('Error saving theme to localStorage:', error);
//     }
//   };

//   return (
//     <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
//       {children}
//     </ThemeContext.Provider>
//   );
// };





"use client";
import { createContext, useContext, useEffect, useState } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [theme, setTheme] = useState({
    colors: {
      background: '#ffffff',
      surface: '#f8f9fa',
      card: '#ffffff',
      primary: '#007bff',
      secondary: '#6c757d',
      success: '#28a745',
      error: '#dc3545',
      warning: '#ffc107',
      text: '#212529',
      textSecondary: '#6c757d',
      border: '#dee2e6',
    },
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px',
    },
    borderRadius: {
      sm: '4px',
      md: '8px',
      lg: '12px',
      xl: '16px',
    }
  });

  useEffect(() => {
    const storedTheme = localStorage.getItem('isDarkMode');
    if (storedTheme !== null) {
      try {
        const darkMode = JSON.parse(storedTheme);
        setIsDarkMode(darkMode);
        updateTheme(darkMode);
      } catch (error) {
        console.error('Error parsing theme from localStorage:', error);
      }
    }
  }, []);

  const updateTheme = (isDark) => {
    if (isDark) {
      setTheme({
        colors: {
          background: '#121212',
          surface: '#1e1e1e',
          card: '#2d2d2d',
          primary: '#bb86fc',
          secondary: '#03dac6',
          success: '#4caf50',
          error: '#cf6679',
          warning: '#ff9800',
          text: '#ffffff',
          textSecondary: '#b0b0b0',
          border: '#333333',
        },
        spacing: {
          xs: '4px',
          sm: '8px',
          md: '16px',
          lg: '24px',
          xl: '32px',
        },
        borderRadius: {
          sm: '4px',
          md: '8px',
          lg: '12px',
          xl: '16px',
        }
      });
    } else {
      setTheme({
        colors: {
          background: '#ffffff',
          surface: '#f8f9fa',
          card: '#ffffff',
          primary: '#007bff',
          secondary: '#6c757d',
          success: '#28a745',
          error: '#dc3545',
          warning: '#ffc107',
          text: '#212529',
          textSecondary: '#6c757d',
          border: '#dee2e6',
        },
        spacing: {
          xs: '4px',
          sm: '8px',
          md: '16px',
          lg: '24px',
          xl: '32px',
        },
        borderRadius: {
          sm: '4px',
          md: '8px',
          lg: '12px',
          xl: '16px',
        }
      });
    }
  };

  const toggleTheme = () => {
    const newIsDarkMode = !isDarkMode;
    setIsDarkMode(newIsDarkMode);
    updateTheme(newIsDarkMode);
    try {
      localStorage.setItem('isDarkMode', JSON.stringify(newIsDarkMode));
    } catch (error) {
      console.error('Error saving theme to localStorage:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook for easy access
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};