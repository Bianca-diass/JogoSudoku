function Cell({ value, onChange }) {
  return (
    <input
      className="cell"
      value={value}
      maxLength={1}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export default Cell;