// import React from 'react';
// import { Moon, Sun } from 'lucide-react';
// import { useThemeStore } from '../store/themeStore';

// export default function ThemeToggle() {
//   const { isDarkMode, toggleTheme } = useThemeStore();

//   return (
//     <button
//       onClick={toggleTheme}
//       className="p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
//       aria-label="Toggle theme"
//     >
//       {isDarkMode ? (
//         <Moon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
//       ) : (
//         <Sun className="h-5 w-5 text-gray-500" />
//       )}
//     </button>
//   );
// }

import { atom, useRecoilState } from "recoil";
import { Moon, Sun } from 'lucide-react';

const themeAtom = atom<boolean>({
  key: "themeAtom",
  default: true, // Light mode by default
});

export function useThemeStore() {
  const [isDarkMode, setDarkMode] = useRecoilState(themeAtom);

  const toggleTheme = () => setDarkMode(!isDarkMode);

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
      aria-label="Toggle theme"
    >
      {isDarkMode ? (
        <Moon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
      ) : (
        <Sun className="h-5 w-5 text-gray-500" />
      )}
    </button>
  );
}
