// const GlobalLoader = ({
//   isVisible = false,
//   message = "Loading...",
//   size = "medium",
//   className = ""
// }) => {
//   if (!isVisible) return null;

// "use client";

// import React from 'react';
// import { useLoaderContext } from '../context/LoaderContext';

// const GlobalLoader = ({
//   size = "medium",
//   className = ""
// }) => {
//   const { isLoading, currentMessage } = useLoaderContext();

//   if (!isLoading) return null}
// }


"use client";

import React from 'react';
import { useLoaderContext } from '../context/LoaderContext';

const GlobalLoader = ({
  size = "medium",
  className = ""
}) => {
  const { isLoading, currentMessage } = useLoaderContext();

  if (!isLoading) return null;

  return (
    <div className={`global-loader-overlay ${className}`}>
      <div className={`global-loader-container size-${size}`}>
        <div className="global-loader-spinner"></div>
        {currentMessage && (
          <p className="global-loader-text">{currentMessage}</p>
        )}
      </div>
    </div>
  );
};

export default GlobalLoader;