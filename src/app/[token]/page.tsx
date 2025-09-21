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
            <div className="flex flex-col items-center justify-center w-full h-full min-h-screen bg-slate-950">
                <div className="flex flex-col items-center w-full p-8 bg-white shadow-lg rounded-xl max-w-80">
                    <TopNav/>
                    <div className="flex items-center justify-center w-80">
                        <LucideLoader size={"lg"} className="animate-spin duration-200"/>
                    </div>
                    <p className="mb-4 text-gray-600">
                        Authenticating...
                    </p>
                </div>
            </div>
        );
    }

    // Invalid token component
    if (!isValid) {
        return (
            <div className="flex flex-col items-center justify-center w-full h-full min-h-screen bg-slate-950">
                <div className="w-full p-8 bg-white shadow-lg rounded-xl max-w-80">
                    <TopNav/>
                    <h1 className="mb-4 text-2xl font-bold text-gray-800">Token is invalid</h1>
                    <p className="mb-6 text-gray-600">Your verification has expired or is invalid. Please verify
                        your identity again.</p>
                    <button
                        className="flex items-center justify-center w-full px-6 py-3 font-medium text-white rounded-lg bg-fuchsia-700 hover:bg-fuchsia-800 transition-colors duration-200"
                        onClick={handleInvalidTokenRedirect}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" viewBox="0 0 20 20"
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
        <main className="flex flex-col w-full min-h-screen p-3 bg-slate-950">
            <div className="flex flex-col items-center justify-center flex-1 w-full h-full">
                <div className="p-2 bg-white md:p-6 rounded-xl">
                    <TopNav/>
                    <OutLetPage/>
                </div>
            </div>
        </main>
    );
}
