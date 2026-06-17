import { useState } from "react";

export default function SudokuGrid() {
  // 🧠 valores iniciais (exemplo de sudoku simples)
  const initialGrid = [
    ["5", "", "", "", "7", "", "", "", ""],
    ["6", "", "", "1", "9", "5", "", "", ""],
    ["", "9", "8", "", "", "", "", "6", ""],
    ["8", "", "", "", "6", "", "", "", "3"],
    ["4", "", "", "8", "", "3", "", "", "1"],
    ["7", "", "", "", "2", "", "", "", "6"],
    ["", "6", "", "", "", "", "2", "8", ""],
    ["", "", "", "4", "1", "9", "", "", "5"],
    ["", "", "", "", "8", "", "", "7", "9"],
  ];

  // células fixas (não podem ser alteradas)
  const fixedCells = initialGrid.map(row =>
    row.map(cell => cell !== "")
  );

  const [grid, setGrid] = useState(initialGrid);

  const handleChange = (row, col, value) => {
    // só aceita 1–9
    if (value !== "" && !/^[1-9]$/.test(value)) return;

    // não deixa editar fixos
    if (fixedCells[row][col]) return;

    const newGrid = [...grid];

    // ❌ checar repetição na linha
    for (let i = 0; i < 9; i++) {
      if (newGrid[row][i] === value && value !== "") return;
    }

    // ❌ checar repetição na coluna
    for (let i = 0; i < 9; i++) {
      if (newGrid[i][col] === value && value !== "") return;
    }

    newGrid[row][col] = value;
    setGrid(newGrid);
  };

  return (
    <div style={styles.grid}>
      {grid.map((row, rIndex) =>
        row.map((cell, cIndex) => (
          <input
            key={`${rIndex}-${cIndex}`}
            value={cell}
            onChange={(e) =>
              handleChange(rIndex, cIndex, e.target.value)
            }
            maxLength={1}
            disabled={fixedCells[rIndex][cIndex]}
            style={{
              ...styles.cell,
              background: fixedCells[rIndex][cIndex]
                ? "#d7ccc8"
                : "#fff8f0",
              fontWeight: fixedCells[rIndex][cIndex]
                ? "bold"
                : "normal",
            }}
          />
        ))
      )}
    </div>
  );
}

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(9, 40px)",
    justifyContent: "center",
    marginTop: "20px",
  },
  cell: {
    width: "40px",
    height: "40px",
    textAlign: "center",
    fontSize: "18px",
    border: "1px solid #999",
    outline: "none",
  },
};