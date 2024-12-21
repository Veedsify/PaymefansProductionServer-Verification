"use client"
import OutLetPage from "@/components/outletpage";
import TopNav from "@/components/topnav";
import { useTrackedProgress } from "@/contexts/tracked-progress";
import { useParams } from "next/navigation";
import { useCallback, useEffect } from "react";

export default function Home() {
  const params = useParams()
  const { setToken } = useTrackedProgress();
  const setModelToken = useCallback(() => {
    if (params.token !== undefined && params.token !== null) {
      setToken(params.token);
      console.log(params.token);
    }
  }, [])
  useEffect(() => {
    setModelToken();
  }, []);

  return (
    <main
      className="w-full bg-slate-950 min-h-screen flex flex-col"
    >
      <div className="flex flex-col h-full w-full items-center justify-center flex-1">
        <div className="bg-white p-6 rounded-xl">
          <TopNav />
          <OutLetPage />
        </div>
      </div>
    </main>
  );
}
