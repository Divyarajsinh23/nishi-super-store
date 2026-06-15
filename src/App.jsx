import React from "react";
import StoreMap from "./StoreMap";

function App() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-450 via-teal-400 to-green-400 bg-clip-text text-transparent mb-8">
        Nishi Super Store
      </h1>
      <div className="w-full max-w-6xl">
        <StoreMap />
      </div>
    </div>
  );
}

export default App;
