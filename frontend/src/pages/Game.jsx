import Stats from "../components/Stats";
import SudokuGrid from "../components/SudokuGrid";

export default function Game() {

  return (
    <div className="container">

      <h1>Sudoku PvP</h1>

      <Stats />

      <SudokuGrid />

    </div>
  );
}