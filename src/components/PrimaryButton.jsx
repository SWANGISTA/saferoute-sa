const PrimaryButton = ({ children, className = '', ...props }) => {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-full bg-[#00b4d8] px-6 py-3 text-sm font-semibold text-[#0f2027] transition hover:bg-teal-400 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default PrimaryButton;
