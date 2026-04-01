export default function Button({ children, onClick, disabled, className = "" }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        px-6 py-3 rounded-full font-semibold shadow-md transition
        active:scale-95
        ${disabled ? "bg-gray-400 opacity-50" : "bg-[#6EC1FF] text-white"}
        ${className}
      `}
    >
      {children}
    </button>
  );
}