"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';

const LoaderContext = createContext();

export const useLoaderContext = () => {
  const context = useContext(LoaderContext);
  if (!context) {
    throw new Error('useLoaderContext must be used within a LoaderProvider');
  }
  return context;
};

export const LoaderProvider = ({ children }) => {
  const [loadingStates, setLoadingStates] = useState(new Map());
  const [globalMessage, setGlobalMessage] = useState('Loading...');

  const isLoading = loadingStates.size > 0;

  const showLoader = useCallback((id = 'default', message) => {
    setLoadingStates(prev => {
      const newStates = new Map(prev);
      newStates.set(id, { message: message || globalMessage, timestamp: Date.now() });
      return newStates;
    });
    if (message) {
      setGlobalMessage(message);
    }
  }, [globalMessage]);

  const hideLoader = useCallback((id = 'default') => {
    setLoadingStates(prev => {
      const newStates = new Map(prev);
      newStates.delete(id);
      return newStates;
    });
  }, []);

  const hideAllLoaders = useCallback(() => {
    setLoadingStates(new Map());
  }, []);

  const updateMessage = useCallback((message) => {
    setGlobalMessage(message);
  }, []);

  // Get the most recent loading message
  const currentMessage = Array.from(loadingStates.values())
    .sort((a, b) => b.timestamp - a.timestamp)[0]?.message || globalMessage;

  const value = {
    isLoading,
    currentMessage,
    showLoader,
    hideLoader,
    hideAllLoaders,
    updateMessage,
    loadingCount: loadingStates.size
  };

  return (
    <LoaderContext.Provider value={value}>
      {children}
    </LoaderContext.Provider>
  );
};

export default LoaderContext;
