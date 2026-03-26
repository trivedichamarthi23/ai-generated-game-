/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import SnakeGame from './components/SnakeGame';
import MusicPlayer from './components/MusicPlayer';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col items-center justify-center p-4 md:p-8">
      <header className="mb-8 text-center w-full max-w-6xl pb-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
          Snake Game
        </h1>
        <p className="text-gray-500 text-sm mt-2 font-medium">
          Classic gameplay with a modern twist
        </p>
      </header>

      <main className="w-full max-w-6xl flex flex-col lg:flex-row gap-8 lg:gap-12 items-center lg:items-start justify-center">
        <div className="flex-1 w-full flex justify-center lg:justify-end">
           <SnakeGame />
        </div>
        <div className="w-full max-w-md lg:w-80 shrink-0 flex justify-center lg:justify-start">
           <MusicPlayer />
        </div>
      </main>
      
      <footer className="mt-12 text-sm text-gray-400 w-full max-w-6xl text-center">
        Use arrow keys to move • Press space to pause
      </footer>
    </div>
  );
}
