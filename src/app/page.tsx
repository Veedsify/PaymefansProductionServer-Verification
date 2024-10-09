import Image from "next/image";

export default function Home() {
  return (
    <main className="bg-[#333]">
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <div className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center bg-white">
          <Image
            src="/logo.png"
            alt="Paymefans"
            width={200}
            height={200}
            className="mb-10"
          />
          <h1 className="text-6xl font-bold text-white">
            Welcome to Paymefans
          </h1>
          <p className="mt-3 text-2xl text-white">
            Your account is successfully verified
          </p>
        </div>
      </div>
    </main>
  );
}
