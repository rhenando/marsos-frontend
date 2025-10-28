// src/routes/Home.tsx
import HomeContent from "@/components/home/HomeContent";

export default function Home() {
  return (
    <div className='flex flex-col min-h-screen'>
      <main className='flex-1'>
        <HomeContent />
      </main>
    </div>
  );
}
