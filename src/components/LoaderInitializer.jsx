"use client";

import { useEffect } from 'react';
import { useLoaderContext } from '../context/LoaderContext';
import { registerLoaderHandlers } from '../lib/api';

const LoaderInitializer = () => {
  const { showLoader, hideLoader } = useLoaderContext();

  useEffect(() => {
    // Register loader handlers with the API
    registerLoaderHandlers(showLoader, hideLoader);
  }, [showLoader, hideLoader]);

  return null; // This component doesn't render anything
};

export default LoaderInitializer;
