import { useState, useEffect, useCallback, useRef } from 'react';

type Point = { x: number; y: number };
const GRID_SIZE = 20;
const TICK_RATE = 120;

export default function SnakeGame() {
  const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Point>({ x: 15, y: 5 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const directionRef = useRef<Point>({ x: 0, y: -1 });
  const lastProcessedDirectionRef = useRef<Point>({ x: 0, y: -1 });

  const generateFood = useCallback((currentSnake: Point[]) => {
    if (currentSnake.length >= GRID_SIZE * GRID_SIZE) {
      return { x: -1, y: -1 };
    }
    let newFood: Point = { x: 0, y: 0 };
    let isValid = false;
    while (!isValid) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
      isValid = !currentSnake.some(s => s.x === newFood.x && s.y === newFood.y);
    }
    return newFood;
  }, []);

  const resetGame = () => {
    const initialSnake = [{ x: 10, y: 10 }];
    setSnake(initialSnake);
    directionRef.current = { x: 0, y: -1 };
    lastProcessedDirectionRef.current = { x: 0, y: -1 };
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    setFood(generateFood(initialSnake));
  };

  const moveSnake = useCallback(() => {
    if (gameOver || isPaused) return;

    setSnake(prev => {
      const head = prev[0];
      const currentDir = directionRef.current;
      lastProcessedDirectionRef.current = currentDir;

      const newHead = { x: head.x + currentDir.x, y: head.y + currentDir.y };

      if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
        setGameOver(true);
        return prev;
      }

      if (prev.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        setGameOver(true);
        return prev;
      }

      const newSnake = [newHead, ...prev];

      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(s => s + 10);
        setFood(generateFood(newSnake));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [gameOver, isPaused, food, generateFood]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      const { x, y } = lastProcessedDirectionRef.current;
      switch (e.key) {
        case 'ArrowUp':
          if (y === 0) directionRef.current = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
          if (y === 0) directionRef.current = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
          if (x === 0) directionRef.current = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
          if (x === 0) directionRef.current = { x: 1, y: 0 };
          break;
        case ' ':
          setIsPaused(p => !p);
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const interval = setInterval(moveSnake, TICK_RATE);
    return () => clearInterval(interval);
  }, [moveSnake]);

  return (
    <div className="w-full max-w-md flex flex-col gap-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Score</span>
          <span className="text-3xl font-bold text-gray-900">{score}</span>
        </div>
        <div className="flex gap-3 items-center">
          {isPaused && !gameOver && <span className="text-amber-600 bg-amber-50 font-semibold tracking-wide uppercase text-xs px-2.5 py-1 rounded-md border border-amber-200">Paused</span>}
          <button onClick={resetGame} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-semibold shadow-sm cursor-pointer">
            Restart
          </button>
        </div>
      </div>

      <div className="relative w-full aspect-square bg-[#a2d149] rounded-xl border-4 border-[#578a34] shadow-inner overflow-hidden">
        {/* Grass checkerboard background */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `conic-gradient(#aad751 90deg, transparent 90deg 180deg, #aad751 180deg 270deg, transparent 270deg)`,
          backgroundSize: `${200/GRID_SIZE}% ${200/GRID_SIZE}%`,
        }}></div>

        {gameOver && (
          <div className="absolute inset-0 z-30 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Game Over</h2>
            <p className="text-gray-600 mb-6 text-lg">Final Score: <span className="font-bold text-indigo-600">{score}</span></p>
            <button onClick={resetGame} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-all shadow-sm cursor-pointer">
              Play Again
            </button>
          </div>
        )}

        {food.x >= 0 && (
          <img 
            src="https://i.postimg.cc/PpJ042PT/what-are-ur-thoughts-on-this-movie-v0-zddrhv4yz72d1.jpg" 
            alt="rat"
            referrerPolicy="no-referrer"
            className="absolute shadow-sm rounded-sm object-cover scale-[1.8] z-10" 
            style={{ left: `${(food.x / GRID_SIZE) * 100}%`, top: `${(food.y / GRID_SIZE) * 100}%`, width: `${100/GRID_SIZE}%`, height: `${100/GRID_SIZE}%` }} 
          />
        )}

        {snake.map((segment, i) => (
          <img 
            key={i} 
            src="https://i.postimg.cc/ZBnXcVCz/bhaaaai-(1).jpg"
            alt={i === 0 ? "snake head" : "snake body"}
            referrerPolicy="no-referrer"
            className={`absolute rounded-sm object-cover ${i === 0 ? 'scale-[1.8] shadow-lg z-20' : 'scale-[1.5] shadow-md opacity-100 z-10'}`} 
            style={{ left: `${(segment.x / GRID_SIZE) * 100}%`, top: `${(segment.y / GRID_SIZE) * 100}%`, width: `${100/GRID_SIZE}%`, height: `${100/GRID_SIZE}%` }} 
          />
        ))}
      </div>
    </div>
  );
}
