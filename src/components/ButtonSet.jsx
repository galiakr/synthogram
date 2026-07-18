/** Group of exclusive option buttons (replaces sgButtonSet). */
export function ButtonSet({ options, value, onChange, allowNone = false }) {
  return (
    <ul className="buttonset">
      {options.map((option) => (
        <li
          key={String(option.value)}
          onClick={() => onChange(allowNone && value === option.value ? '' : option.value)}
        >
          <label className={value === option.value ? 'selected' : ''}>{option.label}</label>
        </li>
      ))}
    </ul>
  );
}
