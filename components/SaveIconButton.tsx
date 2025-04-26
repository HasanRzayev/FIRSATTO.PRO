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
      className="focus:outline-none w-6 h-6 sm:w-6 sm:h-6" // Ensure the button has width and height set
    >
      <img
        src="https://cdn-icons-png.flaticon.com/512/102/102279.png"
        alt="Saved Ads"
        className="w-full h-full" // Make sure the icon fits within the button
      />
    </button>
  );
};


export default SaveIconButton;
