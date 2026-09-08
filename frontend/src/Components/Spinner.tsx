const Spinner = ({ size = 100, color = "#3b82f6", thickness = 4 }) => {
  return (
    <div
      className="spinner"
      role="status"
      aria-label="Loading"
      style={{
        width: size,
        height: size,
        borderWidth: thickness,
        borderTopColor: color,
      }}
    />
  );
};

export default Spinner;
