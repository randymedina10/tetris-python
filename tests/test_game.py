import unittest
from tetris import Tetris
class GameTest(unittest.TestCase):
    def test_tetris_line_clear(self):
        game=Tetris(1)
        game.board[-4:]=[[1]*10 for _ in range(4)]
        self.assertEqual(game.clear_lines(),4)
        self.assertEqual(game.score,800)
        self.assertEqual(len(game.board),20)
        self.assertTrue(all(not any(row) for row in game.board))
    def test_tetris_bounds_pause_drop(self):
        game=Tetris(2)
        for _ in range(20): game.action("left")
        self.assertGreaterEqual(game.x,0)
        game.action("rotate")
        self.assertTrue(game.fits(game.piece,game.x,game.y))
        game.action("pause")
        before=game.state()
        game.action("drop")
        self.assertEqual(before,game.state())
        game.action("pause")
        game.action("drop")
        self.assertGreater(game.score,0)
        self.assertTrue(any(any(row) for row in game.board))
    def test_game_over(self):
        game=Tetris(1)
        game.board=[[1]*10 for _ in range(20)]
        game.spawn()
        self.assertTrue(game.over)
    def test_seven_bag(self):
        game=Tetris(4)
        pieces=[game.piece,game.next_piece]+[game.take() for _ in range(5)]
        self.assertEqual(len({next(v for row in p for v in row if v) for p in pieces}),7)
    def test_invalid_action(self):
        with self.assertRaises(ValueError): Tetris().action("invalid")
