// src/theme/theme.js
const lightTheme = {
  colors: {
    primary: '#00AEEF',       // bright sky blue
    primaryGradientStart: '#00C6FB',
    primaryGradientEnd: '#005BEA',
    secondary: '#5C6F91',     // muted blue-gray
    background: '#F9FBFD',    // soft off-white
    surface: '#FFFFFF',
    text: '#1E2A3A',          // dark navy text
    textSecondary: '#6B7C93', // lighter blue-gray
    border: '#E2E8F0',
    error: '#E63946',
    success: '#2ECC71',
  },
  fontSizes: {
    small: 12,
    medium: 16,
    large: 20,
    xlarge: 26,
  },
  spacing: {
    small: 8,
    medium: 16,
    large: 24,
    xlarge: 32,
  },
  // images: {
  //   logo: require('@public/images/GCLogo.png'), // Light theme logo
  //   logoSmall: require('@public/images/GCLogo.png'),
  // }
};


const darkTheme = {
  colors: {
    primary: '#00C6FB',        // bright cyan-blue
    primaryGradientStart: '#009FFD',
    primaryGradientEnd: '#2A2A72',
    secondary: '#8899B0',
    background: '#0D1117',     // near-black blue tone
    surface: '#161B22',
    text: '#E6EDF3',           // soft white
    textSecondary: '#8B9CB2',
    border: '#2D333B',
    error: '#FF6B6B',
    success: '#4ECDC4',
  },
  fontSizes: {
    small: 12,
    medium: 16,
    large: 20,
    xlarge: 26,
  },
  spacing: {
    small: 8,
    medium: 16,
    large: 24,
    xlarge: 32,
  },
  // images: {
  //   logo: require('../../assets/logo.png'), // Dark theme logo
  //   logoSmall: require('../../assets/logo.png'),
  // }
};

const getTheme = (isDarkMode) => (isDarkMode ? darkTheme : lightTheme);

export { lightTheme, darkTheme, getTheme };