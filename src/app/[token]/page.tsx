"use client"
import OutLetPage from "@/components/outletpage";
import TopNav from "@/components/topnav";
import { useTrackedProgress } from "@/contexts/tracked-progress";
import { useEffect } from "react";

export default function Home({ params }: { params: { token: string } }) {
  const { setToken } = useTrackedProgress();
  useEffect(() => {
    setToken(params.token);
  }, [params.token]);   

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
