'use client';

import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';


const SaveIconButton = () => {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname?.split('/')[1] || 'en'; // URL-dən locale dəyərini götürürük

  const handleClick = () => {
    router.push(`/${locale}/saved-ads`);
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center p-2 rounded-lg hover:bg-white/10 transition-colors duration-200 group focus:outline-none"
      title="Saved Ads"
    >
      <svg 
        className="w-6 h-6 text-gray-800 group-hover:text-blue-600 transition-colors duration-200" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" 
        />
      </svg>
    </button>
  );
};


export default SaveIconButton;
