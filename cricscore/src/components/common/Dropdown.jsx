import { forwardRef } from 'react';

/**
 * Dropdown/Select Component
 * Clean dropdown matching reference design
 */
const Dropdown = forwardRef(({
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Select...',
  disabled = false,
  error = null,
  className = '',
  ...props
}, ref) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-white mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`
            w-full
            px-4 py-2.5
            bg-[#2C2D3F]
            border border-[#4A4B5E]
            rounded-button
            shadow-button
            text-white
            font-body font-medium
            appearance-none
            cursor-pointer
            transition-all duration-150
            hover:border-[#8BC9E8]
            focus:outline-none
            focus:ring-2
            focus:ring-[#8BC9E8]
            focus:border-transparent
            disabled:opacity-50
            disabled:cursor-not-allowed
            ${error ? 'border-accent-danger' : ''}
          `}
          {...props}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>

        {/* Dropdown arrow */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg
            className="w-4 h-4 text-white/60"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
      {error && (
        <p className="mt-1 text-sm text-accent-danger">{error}</p>
      )}
    </div>
  );
});

Dropdown.displayName = 'Dropdown';

export default Dropdown;
