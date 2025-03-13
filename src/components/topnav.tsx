"use client";
import { Languages } from "lucide-react"
import Image from "next/image";
import Link from "next/link";
import { MouseEvent, useState } from "react";
const TopNav = () => {
     const [languageIsOpen, setLanguageIsOpen] = useState(false);
     const handleLanguageClick = (e: MouseEvent<HTMLAnchorElement | HTMLDivElement>) => {
          e.preventDefault();
          setLanguageIsOpen(!languageIsOpen);
     }

     return (
          <>
               <div
                    className="flex justify-between items-center mb-12"
               >
                    <Link href="/"
                         onClick={handleLanguageClick}
                    >
                         <Languages />
                    </Link>

                    <Link href={process.env.NEXT_PUBLIC_MAIN_SITE as string}>
                         <Image
                              src="/logo.svg"
                              alt="Paymefans Logo"
                              width={150}
                              height={32}
                              className="border border-gray-300 rounded-lg"
                         />
                    </Link >
               </div>
               <div className={`fixed bg-gray-900 bg-opacity-15 backdrop-blur-sm top-0 left-0 h-screen w-full duration-300 ${languageIsOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} `}
               >
                    <div className="h-full w-full relative flex items-center justify-center" onClick={handleLanguageClick}>
                         <div className="bg-white p-6 rounded-md" onClick={e => e.stopPropagation()}>
                              <div className="flex flex-col items-center justify-center space-y-4 max-w-80">
                                   <h1 className="text-2xl font-bold text-gray-900 text-center">
                                        Select Language
                                   </h1>
                                   <div className="flex flex-col items-center justify-center space-y-4">
                                        <button className="text-gray-900 hover:bg-purple-50 text-sm font-medium p-4 py-2 rounded-xl">English
                                        </button>
                                        <button className="text-gray-900 hover:bg-purple-50 text-sm font-medium p-4 py-2 rounded-xl">Español
                                        </button>
                                        <button className="text-gray-900 hover:bg-purple-50 text-sm font-medium p-4 py-2 rounded-xl">Français
                                        </button>
                                   </div>
                              </div>
                         </div>
                    </div>
               </div>
          </>
     );
}

export default TopNav;