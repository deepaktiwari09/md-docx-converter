interface ConversionToggleProps {
  toDocx: boolean;
  onChange: (toDocx: boolean) => void;
  disabled?: boolean;
}

export function ConversionToggle({
  toDocx,
  onChange,
  disabled,
}: ConversionToggleProps) {
  return (
    <div className="conversion-toggle">
      <button
        className={`toggle-btn ${toDocx ? 'active' : ''}`}
        onClick={() => onChange(true)}
        disabled={disabled}
      >
        MD → DOCX
      </button>
      <button
        className={`toggle-btn ${!toDocx ? 'active' : ''}`}
        onClick={() => onChange(false)}
        disabled={disabled}
      >
        DOCX → MD
      </button>
    </div>
  );
}
