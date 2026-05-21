import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div className="flex flex-col items-center gap-4 p-8 border rounded-xl border-zinc-200">
      <p className="text-2xl font-bold">Counter: {count}</p>
      <button
        onClick={() => setCount(count + 1)}
        className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium transition-transform active:scale-95"
      >
        Increment
      </button>
    </div>
  );
}
