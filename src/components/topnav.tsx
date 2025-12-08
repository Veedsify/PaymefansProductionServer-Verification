"use client";
import { Languages } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { MouseEvent, useState } from "react";
const TopNav = () => {
    const [languageIsOpen, setLanguageIsOpen] = useState(false);
    const handleLanguageClick = (
      e: MouseEvent<HTMLButtonElement | HTMLDivElement>
    ) => {
      e.preventDefault();
      setLanguageIsOpen(!languageIsOpen);
    };

    return (
      <>
        <div className="flex items-center w-full gap-3 sm:gap-4 justify-between mb-6 sm:mb-8 md:mb-12">
          <button
            onClick={handleLanguageClick}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors active:scale-95"
            aria-label="Select Language"
          >
            <Languages className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 dark:text-gray-300" />
          </button>

          <Link
            href={process.env.NEXT_PUBLIC_MAIN_SITE as string}
            className="flex-shrink-0"
          >
            <Image
              src="/logo.svg"
              alt="Paymefans Logo"
              width={120}
              height={28}
              className="w-auto h-7 sm:h-8 border border-gray-300 dark:border-gray-600 rounded-lg dark:brightness-0 dark:invert"
              priority
            />
          </Link>
        </div>
        <div
          className={`fixed bg-gray-900/50 dark:bg-black/70 backdrop-blur-sm top-0 left-0 min-h-dvh w-full z-50 duration-300 safe-top safe-bottom ${
            languageIsOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          } `}
        >
          <div
            className="relative flex items-center justify-center w-full min-h-dvh p-4"
            onClick={handleLanguageClick}
          >
            <div
              className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-sm w-full border border-gray-200 dark:border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center justify-center space-y-4">
                <h1 className="text-xl sm:text-2xl font-bold text-center text-gray-900 dark:text-gray-100">
                  Select Language
                </h1>
                <div className="flex flex-col items-center justify-center space-y-2 w-full">
                  <button className="w-full px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-colors active:scale-[0.98]">
                    English
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
};

export default TopNav;
