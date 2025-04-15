"use client"
import OutLetPage from "@/components/outletpage";
import TopNav from "@/components/topnav";
import {useTrackedProgress} from "@/contexts/tracked-progress";
import {useParams} from "next/navigation";
import {LucideLoader} from "lucide-react";
import {useCallback, useEffect, useState} from "react";
import axios from "axios"

export default function Home() {
    const params = useParams()
    const [isLoading, setIsLoading] = useState(true);
    const [isValid, setIsValid] = useState(false);
    const {setToken} = useTrackedProgress();

    const verifyToken = useCallback(async () => {
        setIsLoading(true);

        // Check if token exists in params
        if (!params.token) {
            setIsValid(false);
            setIsLoading(false);
            return;
        }

        try {

            // Check if the token is valid
            const response = await axios.post(`${process.env.NEXT_PUBLIC_VERIFICATION_ENDPOINT}/verify-token`, {
                token: params.token
            });

            if (response.data.error) {
                setIsValid(false);
            } else {
                setIsValid(true);
                setToken(params.token);
            }
        } catch (error) {
            console.error("Error verifying token:", error);
            setIsValid(false);
        } finally {
            setIsLoading(false);
        }
    }, [params.token, setToken]);

    const handleInvalidTokenRedirect = () => {
        window.location.href = `${process.env.NEXT_PUBLIC_MAIN_SITE}/verification`;
    }

    useEffect(() => {
        verifyToken();
    }, [verifyToken]);

    // Loading spinner component
    if (isLoading) {
        return (
            <div className="flex flex-col h-full w-full items-center justify-center bg-slate-950 min-h-screen">
                <div className="bg-white p-8 rounded-xl shadow-lg max-w-80 w-full flex flex-col items-center">
                    <TopNav/>
                    <div className="flex items-center justify-center w-80">
                        <LucideLoader size={32} className="animate-spin duration-200"/>
                    </div>
                    <p className="text-gray-600 mb-4">
                        Authenticating...
                    </p>
                </div>
            </div>
        );
    }

    // Invalid token component
    if (!isValid) {
        return (
            <div className="flex flex-col h-full w-full items-center justify-center bg-slate-950 min-h-screen">
                <div className="bg-white p-8 rounded-xl shadow-lg max-w-80 w-full">
                    <TopNav/>
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Token is invalid</h1>
                    <p className="text-gray-600 mb-6">Your verification has expired or is invalid. Please verify
                        your identity again.</p>
                    <button
                        className="w-full bg-fuchsia-700 hover:bg-fuchsia-800 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200 flex items-center justify-center"
                        onClick={handleInvalidTokenRedirect}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20"
                             fill="currentColor">
                            <path fillRule="evenodd"
                                  d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                                  clipRule="evenodd"/>
                        </svg>
                        Go to Verification
                    </button>
                </div>
            </div>
        )
    }

    // Valid token component
    return (
        <main className="w-full bg-slate-950 min-h-screen flex flex-col">
            <div className="flex flex-col h-full w-full items-center justify-center flex-1">
                <div className="bg-white p-6 rounded-xl">
                    <TopNav/>
                    <OutLetPage/>
                </div>
            </div>
        </main>
    );
}
