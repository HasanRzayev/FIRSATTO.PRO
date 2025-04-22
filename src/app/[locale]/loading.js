 
import React from 'react';

const Loading = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="border-8 border-t-8 border-blue-500 border-solid rounded-full w-16 h-16 animate-spin mb-4"></div>
      <p className="text-xl text-gray-700">Loading...</p>
    </div>
  );
};

export default Loading;
