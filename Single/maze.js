class MazeGenerator {
  constructor(rows, cols, canvasId, entranceCount = 1, exitCount = 1) {
    this.rows = rows;
    this.cols = cols;
    this.cellSize = 20;
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.grid = this.initGrid();
    this.entrances = [];
    this.exits = [];
    this.entranceCount = entranceCount;
    this.exitCount = exitCount;
  }

  initGrid() {
    const grid = [];
    for (let r = 0; r < this.rows; r++) {
      grid[r] = [];
      for (let c = 0; c < this.cols; c++) {
        grid[r][c] = {
          visited: false,
          walls: [true, true, true, true] // 上右下左
        };
      }
    }
    return grid;
  }

  getNeighbors(r, c) {
    const neighbors = [];
    const directions = [
      [ -1, 0 ], // 上
      [ 0, 1 ],  // 右
      [ 1, 0 ],  // 下
      [ 0, -1 ]  // 左
    ];

    directions.forEach(([dr, dc], dir) => {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols) {
        if (!this.grid[nr][nc].visited) {
          neighbors.push({ nr, nc, dir });
        }
      }
    });
    return neighbors;
  }

  removeWalls(current, neighbor, dir) {
    const oppositeDir = (dir + 2) % 4;
    current.walls[dir] = false;
    neighbor.walls[oppositeDir] = false;
  }

  createPortals() {
    const createOnBorder = (type, count) => {
      const portals = [];
      for (let i = 0; i < count; i++) {
        let r, c, wallIndex;
        do {
          const border = Math.floor(Math.random() * 4);
          [r, c, wallIndex] = [
            border === 0 ? 0 : border === 2 ? this.rows - 1 : Math.floor(Math.random() * this.rows),
            border === 3 ? 0 : border === 1 ? this.cols - 1 : Math.floor(Math.random() * this.cols),
            border
          ];
        } while (portals.some(([pr, pc]) => pr === r && pc === c));

        this.grid[r][c].walls[wallIndex] = false;
        portals.push([r, c]);
      }
      return portals;
    };

    this.entrances = createOnBorder('entrance', this.entranceCount);
    this.exits = createOnBorder('exit', this.exitCount);
  }

  async generate() {
    const stack = [];
    let current = this.grid[0][0];
    current.visited = true;
    stack.push([0, 0]);

    while (stack.length > 0) {
      const [r, c] = stack.pop();
      const neighbors = this.getNeighbors(r, c);

      if (neighbors.length > 0) {
        stack.push([r, c]);
        const randIndex = Math.floor(Math.random() * neighbors.length);
        const { nr, nc, dir } = neighbors[randIndex];
        const neighbor = this.grid[nr][nc];

        this.removeWalls(this.grid[r][c], neighbor, dir);
        neighbor.visited = true;
        stack.push([nr, nc]);

        await new Promise(resolve => setTimeout(resolve, 10));
        this.draw();
      }
    }
    this.createPortals();
    this.draw();
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.strokeStyle = '#333';
    
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const cell = this.grid[r][c];
        const x = c * this.cellSize;
        const y = r * this.cellSize;

        if (cell.walls[0]) this.ctx.beginPath(), this.ctx.moveTo(x, y), this.ctx.lineTo(x + this.cellSize, y), this.ctx.stroke();
        if (cell.walls[1]) this.ctx.beginPath(), this.ctx.moveTo(x + this.cellSize, y), this.ctx.lineTo(x + this.cellSize, y + this.cellSize), this.ctx.stroke();
        if (cell.walls[2]) this.ctx.beginPath(), this.ctx.moveTo(x, y + this.cellSize), this.ctx.lineTo(x + this.cellSize, y + this.cellSize), this.ctx.stroke();
        if (cell.walls[3]) this.ctx.beginPath(), this.ctx.moveTo(x, y), this.ctx.lineTo(x, y + this.cellSize), this.ctx.stroke();
      }
    }
    
    if (document.getElementById('showPortals').checked) {
      this.entrances.forEach(([r, c]) => {
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.fillRect(c * this.cellSize + 2, r * this.cellSize + 2, this.cellSize - 4, this.cellSize - 4);
      });
      this.exits.forEach(([r, c]) => {
        this.ctx.fillStyle = '#F44336';
        this.ctx.fillRect(c * this.cellSize + 2, r * this.cellSize + 2, this.cellSize - 4, this.cellSize - 4);
      });
    }
  }
}

function generateMaze() {
  const rows = parseInt(document.getElementById('rows').value) || 15;
  const cols = parseInt(document.getElementById('cols').value) || 15;
  
  if (rows > 50 || cols > 50) {
    alert('最大尺寸不超过50×50');
    return;
  }

  const canvas = document.getElementById('mazeCanvas');
  canvas.width = cols * 20;
  canvas.height = rows * 20;

  const entranceCount = parseInt(document.getElementById('entranceCount').value) || 1;
  const exitCount = parseInt(document.getElementById('exitCount').value) || 1;
  
  const maze = new MazeGenerator(rows, cols, 'mazeCanvas', entranceCount, exitCount);
  maze.generate();
}