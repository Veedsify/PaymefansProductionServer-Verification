import OutLetPage from "@/components/outletpage";
import TopNav from "@/components/topnav";

export default function Home() {
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
