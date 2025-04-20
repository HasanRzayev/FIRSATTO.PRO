// components/SaveIconButton.tsx
'use client';

import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation'

const SaveIconButton = () => {
  const router = useRouter();
  const pathname = usePathname()
  const locale = pathname.split('/')[1] // URL-dən locale dəyərini götürürük
  const handleClick = () => {
    router.push(`/${locale}/saved-ads`)
  };

  return (
    <button onClick={handleClick} className="focus:outline-none">
      <img
        src="https://cdn-icons-png.flaticon.com/512/102/102279.png"  // Sabit şəkil
        alt="Saved Ads"
        className="w-6 h-6"
      />
    </button>
  );
};

export default SaveIconButton;
