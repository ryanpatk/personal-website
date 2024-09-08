import { useEffect, useRef } from 'react';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const CELL_SIZE = 5;
    let ROWS: number, COLS: number;
    let grid: number[][];

    function resizeCanvas() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      COLS = Math.ceil(canvas.width / CELL_SIZE);
      ROWS = Math.ceil(canvas.height / CELL_SIZE);
      grid = new Array(ROWS).fill(null).map(() => new Array(COLS).fill(0));
      initializeGrid();
    }

    function initializeGrid() {
      // Gosper glider gun
      const gun = [
        [
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        ],
        [
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
          0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        ],
        [
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1,
        ],
        [
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1,
        ],
        [
          1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        ],
        [
          1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1,
          0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        ],
        [
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0,
          0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        ],
        [
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        ],
        [
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        ],
      ];

      // Place multiple Gosper glider guns
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const offsetY = i * 40;
          const offsetX = j * 40;
          gun.forEach((row, y) => {
            row.forEach((cell, x) => {
              if (cell === 1) {
                grid[y + offsetY][x + offsetX] = 1;
              }
            });
          });
        }
      }

      // Add some random cells
      for (let i = 0; i < 1000; i++) {
        const x = Math.floor(Math.random() * COLS);
        const y = Math.floor(Math.random() * ROWS);
        grid[y][x] = 1;
      }
    }

    function drawGrid() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
          if (grid[y][x] === 1) {
            ctx.fillStyle = 'rgba(75, 85, 99, 0.5)';
            ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
          }
        }
      }
    }

    function countNeighbors(x: number, y: number) {
      let count = 0;
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          if (i === 0 && j === 0) continue;
          const newY = (y + i + ROWS) % ROWS;
          const newX = (x + j + COLS) % COLS;
          count += grid[newY][newX];
        }
      }
      return count;
    }

    function updateGrid() {
      const newGrid = grid.map((arr) => [...arr]);
      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
          const neighbors = countNeighbors(x, y);
          if (grid[y][x] === 1 && (neighbors < 2 || neighbors > 3)) {
            newGrid[y][x] = 0;
          } else if (grid[y][x] === 0 && neighbors === 3) {
            newGrid[y][x] = 1;
          }
        }
      }
      grid = newGrid;
    }

    let isDrawing = false;

    function addLivingCells(x: number, y: number) {
      const cellX = Math.floor(x / CELL_SIZE);
      const cellY = Math.floor(y / CELL_SIZE);
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          const newX = (cellX + i + COLS) % COLS;
          const newY = (cellY + j + ROWS) % ROWS;
          grid[newY][newX] = 1;
        }
      }
    }

    function handleMouseDown(e: MouseEvent) {
      isDrawing = true;
      addLivingCells(e.clientX, e.clientY);
    }

    function handleMouseMove(e: MouseEvent) {
      if (isDrawing) {
        addLivingCells(e.clientX, e.clientY);
      }
    }

    function handleMouseUp() {
      isDrawing = false;
    }

    function gameLoop() {
      drawGrid();
      updateGrid();
      requestAnimationFrame(gameLoop);
    }

    window.addEventListener('resize', resizeCanvas);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);

    resizeCanvas();
    gameLoop();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseUp);
    };
  }, []);

  function handleFightEntropy() {
    console.log('Fight entropy clicked!');
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const CELL_SIZE = 5;
    const ROWS = Math.ceil(canvas.height / CELL_SIZE);
    const COLS = Math.ceil(canvas.width / CELL_SIZE);
    const livingCells = [];

    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (ctx.getImageData(x * CELL_SIZE, y * CELL_SIZE, 1, 1).data[3] > 0) {
          livingCells.push([y, x]);
        }
      }
    }

    // Shuffle the living cells array
    for (let i = livingCells.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [livingCells[i], livingCells[j]] = [livingCells[j], livingCells[i]];
    }

    // Remove half of the living cells
    const cellsToRemove = livingCells.slice(
      0,
      Math.floor(livingCells.length / 2),
    );
    cellsToRemove.forEach(([y, x]) => {
      ctx.clearRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    });
  }

  return (
    <div className="bg-gray-900 text-gray-300 min-h-screen w-full">
      <canvas
        id="game-of-life"
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full z-10"
      />
      <div className="flex flex-col pt-10 w-full">
        <main className="p-8 max-w-2xl w-full relative z-20 pointer-events-none text-shadow-lg">
          <h1 className="text-2xl font-bold mt-2">Ryan Atkinson</h1>
          <p className="text-xl mb-8">@ryanpatk</p>

          <section className="mb-8">
            <p
              className="mt-8 italic cursor-pointer hover:text-green-400 transition-colors duration-200 pointer-events-auto"
              onClick={handleFightEntropy}
            >
              Fight entropy.
            </p>
            <p className="mt-4">
              This is my personal website. Not a very serious place. I enjoy
              exploring the inner reaches of outer space. I am a software
              developer with a passion for cognitive science, religious studies,
              UAP, and building cool things. More and more it seems like
              everything is converging. Shoot me a DM on one of my socials if
              you want to chat.
            </p>
          </section>

          <ul className="flex space-x-4 mt-4 mb-8">
            <li>
              <a
                href="https://twitter.com/ryanpatk"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-green-400 hover:bg-gray-800 px-2 py-1 rounded transition-colors duration-200 pointer-events-auto"
              >
                X
              </a>
            </li>
            <li>
              <a
                href="https://github.com/ryanpatk"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-green-400 hover:bg-gray-800 px-2 py-1 rounded transition-colors duration-200 pointer-events-auto"
              >
                GitHub
              </a>
            </li>
            <li>
              <a
                href="https://www.linkedin.com/in/ryanpatk"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-green-400 hover:bg-gray-800 px-2 py-1 rounded transition-colors duration-200 pointer-events-auto"
              >
                LinkedIn
              </a>
            </li>
          </ul>
        </main>
      </div>

      <footer className="mt-auto p-4 text-center text-sm opacity-70 content absolute bottom-0 w-full">
        &copy; 2024 Ryan Atkinson. All rights reserved.
      </footer>
    </div>
  );
}

export default App;
