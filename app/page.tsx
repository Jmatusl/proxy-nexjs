export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.5)]">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-green-500 text-xl font-mono font-bold tracking-wider">STATUS CORRECTO</h1>
      </div>
    </div>
  );
}
