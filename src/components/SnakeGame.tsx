import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

type Point = { x: number; y: number };
type Blast = { x: number; y: number; id: string };
const GRID_SIZE = 20;
const TICK_RATE = 120;

export default function SnakeGame() {
  const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Point>({ x: 15, y: 5 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [blasts, setBlasts] = useState<Blast[]>([]);

  const directionRef = useRef<Point>({ x: 0, y: -1 });
  const lastProcessedDirectionRef = useRef<Point>({ x: 0, y: -1 });
  const touchStartRef = useRef<Point | null>(null);

  const changeDirection = useCallback((dir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    const { x, y } = lastProcessedDirectionRef.current;
    switch (dir) {
      case 'UP':
        if (y === 0) directionRef.current = { x: 0, y: -1 };
        break;
      case 'DOWN':
        if (y === 0) directionRef.current = { x: 0, y: 1 };
        break;
      case 'LEFT':
        if (x === 0) directionRef.current = { x: -1, y: 0 };
        break;
      case 'RIGHT':
        if (x === 0) directionRef.current = { x: 1, y: 0 };
        break;
    }
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    
    const touchEndX = e.touches[0].clientX;
    const touchEndY = e.touches[0].clientY;
    
    const dx = touchEndX - touchStartRef.current.x;
    const dy = touchEndY - touchStartRef.current.y;
    
    // Minimum swipe distance
    if (Math.abs(dx) < 30 && Math.abs(dy) < 30) return;
    
    if (Math.abs(dx) > Math.abs(dy)) {
      // Horizontal swipe
      if (dx > 0) changeDirection('RIGHT');
      else changeDirection('LEFT');
    } else {
      // Vertical swipe
      if (dy > 0) changeDirection('DOWN');
      else changeDirection('UP');
    }
    
    touchStartRef.current = null; // Reset to prevent multiple triggers in one swipe
  };

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
    setBlasts([]);
    setFood(generateFood(initialSnake));
  };

  const moveSnake = useCallback(() => {
    if (gameOver || isPaused) return;

    setSnake(prev => {
      const head = prev[0];
      const currentDir = directionRef.current;
      lastProcessedDirectionRef.current = currentDir;

      let newX = head.x + currentDir.x;
      let newY = head.y + currentDir.y;

      if (newX < 0) newX = GRID_SIZE - 1;
      else if (newX >= GRID_SIZE) newX = 0;
      if (newY < 0) newY = GRID_SIZE - 1;
      else if (newY >= GRID_SIZE) newY = 0;

      const newHead = { x: newX, y: newY };

      const newSnake = [newHead, ...prev];

      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(s => s + 10);
        setFood(generateFood(newSnake));
        setBlasts(b => [...b, { x: food.x, y: food.y, id: crypto.randomUUID() }]);
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

      switch (e.key) {
        case 'ArrowUp':
          changeDirection('UP');
          break;
        case 'ArrowDown':
          changeDirection('DOWN');
          break;
        case 'ArrowLeft':
          changeDirection('LEFT');
          break;
        case 'ArrowRight':
          changeDirection('RIGHT');
          break;
        case ' ':
          setIsPaused(p => !p);
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [changeDirection]);

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

      <div 
        className="relative w-full aspect-square bg-[#a2d149] rounded-xl border-4 border-[#578a34] shadow-inner overflow-hidden touch-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
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

        {blasts.map(blast => (
          <div
            key={blast.id}
            onAnimationEnd={() => setBlasts(prev => prev.filter(b => b.id !== blast.id))}
            className="absolute z-30 animate-blast flex items-center justify-center pointer-events-none"
            style={{
              left: `${(blast.x / GRID_SIZE) * 100}%`,
              top: `${(blast.y / GRID_SIZE) * 100}%`,
              width: `${100/GRID_SIZE}%`,
              height: `${100/GRID_SIZE}%`
            }}
          >
            <div className="w-full h-full bg-yellow-400 rounded-full mix-blend-screen shadow-[0_0_20px_10px_rgba(250,204,21,0.6)]"></div>
          </div>
        ))}

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

      {/* Mobile Controls (D-Pad) */}
      <div className="grid grid-cols-3 gap-2 w-48 mx-auto mt-2 md:hidden">
        <div />
        <button 
          onClick={() => changeDirection('UP')} 
          className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center justify-center active:bg-gray-100 transition-colors"
        >
          <ArrowUp className="w-6 h-6 text-gray-700" />
        </button>
        <div />
        <button 
          onClick={() => changeDirection('LEFT')} 
          className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center justify-center active:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <button 
          onClick={() => changeDirection('DOWN')} 
          className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center justify-center active:bg-gray-100 transition-colors"
        >
          <ArrowDown className="w-6 h-6 text-gray-700" />
        </button>
        <button 
          onClick={() => changeDirection('RIGHT')} 
          className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center justify-center active:bg-gray-100 transition-colors"
        >
          <ArrowRight className="w-6 h-6 text-gray-700" />
        </button>
      </div>
    </div>
  );
}
