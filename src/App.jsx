import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import TicTacToe from './games/TicTacToe/TicTacToe';
import MemoryMatch from './games/MemoryMatch/MemoryMatch';
import RockPaperScissors from './games/RockPaperScissors/RockPaperScissors';
import Game2048 from './games/Twos/Game2048';
import Sudoku from './games/Sudoku/Sudoku';
import ConnectFour from './games/ConnectFour/ConnectFour';
import Battleship from './games/Battleship/Battleship';
import Snake from './games/Snake/Snake';
import Minesweeper from './games/Minesweeper/Minesweeper';
import Pong from './games/Pong/Pong';
import WhackAMole from './games/WhackAMole/WhackAMole';
import FlappyBird from './games/FlappyBird/FlappyBird';
import SimonSays from './games/SimonSays/SimonSays';
import Breakout from './games/Breakout/Breakout';

import { AuthProvider } from './context/AuthContext';
import { SearchProvider } from './context/SearchContext';
import { LeaderboardProvider } from './context/LeaderboardContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Leaderboard from './pages/Leaderboard';

function App() {
  return (
    <AuthProvider>
      <SearchProvider>
        <LeaderboardProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/tictactoe" element={<TicTacToe />} />
              <Route path="/memory" element={<MemoryMatch />} />
              <Route path="/rps" element={<RockPaperScissors />} />
              <Route path="/2048" element={<Game2048 />} />
              <Route path="/sudoku" element={<Sudoku />} />
              <Route path="/connect4" element={<ConnectFour />} />
              <Route path="/battleship" element={<Battleship />} />
              <Route path="/snake" element={<Snake />} />
              <Route path="/minesweeper" element={<Minesweeper />} />
              <Route path="/pong" element={<Pong />} />
              <Route path="/whack" element={<WhackAMole />} />
              <Route path="/flappy" element={<FlappyBird />} />
              <Route path="/simon" element={<SimonSays />} />
              <Route path="/breakout" element={<Breakout />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </LeaderboardProvider>
      </SearchProvider>
    </AuthProvider>
  );
}

export default App;
