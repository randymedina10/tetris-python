"""Tetris sencillo en Python. Motor sin dependencias; siete piezas y bolsa aleatoria."""
import random
SHAPES = [
    [[1,1,1,1]], [[2,2],[2,2]], [[0,3,0],[3,3,3]],
    [[0,4,4],[4,4,0]], [[5,5,0],[0,5,5]],
    [[6,0,0],[6,6,6]], [[0,0,7],[7,7,7]],
]
class Tetris:
    def __init__(self, seed=None):
        self.rng = random.Random(seed)
        self.board = [[0]*10 for _ in range(20)]
        self.bag = []
        self.score = 0
        self.lines = 0
        self.over = False
        self.paused = False
        self.next_piece = self.take()
        self.spawn()

    def take(self):
        if not self.bag:
            self.bag = list(range(7))
            self.rng.shuffle(self.bag)
        return [row[:] for row in SHAPES[self.bag.pop()]]

    def spawn(self):
        self.piece = self.next_piece
        self.next_piece = self.take()
        self.x = (10-len(self.piece[0]))//2
        self.y = 0
        if not self.fits(self.piece, self.x, self.y):
            self.over = True

    def fits(self, piece, x, y):
        for r, row in enumerate(piece):
            for c, value in enumerate(row):
                if value and (x+c < 0 or x+c >= 10 or y+r >= 20 or y+r < 0 or self.board[y+r][x+c]):
                    return False
        return True

    def clear_lines(self):
        remaining = [row for row in self.board if not all(row)]
        count = 20-len(remaining)
        self.board = [[0]*10 for _ in range(count)] + remaining
        self.score += [0,100,300,500,800][count] * (self.lines//10+1)
        self.lines += count
        return count

    def lock(self):
        for r, row in enumerate(self.piece):
            for c, value in enumerate(row):
                if value:
                    self.board[self.y+r][self.x+c] = value
        self.clear_lines()
        self.spawn()

    def action(self, action):
        valid = {"left","right","down","rotate","drop","tick","pause"}
        if action not in valid:
            raise ValueError("Acción desconocida")
        if self.over:
            return self.state()
        if action == "pause":
            self.paused = not self.paused
        elif not self.paused:
            if action in ("left","right"):
                dx = -1 if action == "left" else 1
                if self.fits(self.piece, self.x+dx, self.y):
                    self.x += dx
            elif action == "rotate":
                rotated = [list(row) for row in zip(*self.piece[::-1])]
                for dx in (0,-1,1,-2,2):
                    if self.fits(rotated, self.x+dx, self.y):
                        self.piece, self.x = rotated, self.x+dx
                        break
            elif action == "drop":
                while self.fits(self.piece,self.x,self.y+1):
                    self.y += 1
                    self.score += 2
                self.lock()
            else:
                if self.fits(self.piece,self.x,self.y+1):
                    self.y += 1
                    if action == "down":
                        self.score += 1
                else:
                    self.lock()
        return self.state()

    def state(self):
        grid = [row[:] for row in self.board]
        if not self.over:
            for r,row in enumerate(self.piece):
                for c,value in enumerate(row):
                    if value:
                        grid[self.y+r][self.x+c] = value
        return {"board":grid,"score":self.score,"lines":self.lines,"level":self.lines//10+1,
                "over":self.over,"paused":self.paused,"next":self.next_piece}

