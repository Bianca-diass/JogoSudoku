import Cell from "./Cell";

function Board({ board = [], handleChange }) {

  if (!Array.isArray(board)) {
    return <h2>Carregando...</h2>;
  }

  return (
    <div className="board">

      {board.map((row, r) =>
        row.map((cell, c) => (
          <Cell
            key={`${r}-${c}`}
            value={cell || ""}
            onChange={(v) =>
              handleChange(r, c, v)
            }
          />
        ))
      )}

    </div>
  );
}

export default Board;