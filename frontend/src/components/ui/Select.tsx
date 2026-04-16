import { ChevronDown } from "lucide-react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  className = "",
  id,
  ...props
}) => {
  return (
    <div className={`flex flex-col gap-1.5 w-full relative ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-semibold text-[var(--color-brand-brown)] transition-colors group-focus-within:text-[var(--color-brand-dark-blue)]"
        >
          {label}
        </label>
      )}
      <div className="relative group">
        <select
          id={id}
          className={`
            w-full rounded-xl border-2 bg-white px-4 py-3 text-base text-[var(--color-brand-brown)]
            transition-all duration-300 placeholder:text-gray-400 appearance-none cursor-pointer
            focus:border-[var(--color-brand-dark-blue)] focus:outline-none focus:ring-4 focus:ring-[var(--color-brand-dark-blue)]/10
            hover:border-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed
            ${error ? "border-red-500 focus:border-red-500 focus:ring-red-100" : "border-gray-200"}
          `}
          {...props}
        >
          <option value="" disabled hidden>
            Select an option...
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="w-5 h-5 text-gray-500 absolute right-4 top-[14px] pointer-events-none transition-transform duration-200 group-focus-within:rotate-180 group-focus-within:text-[var(--color-brand-dark-blue)]" />
      </div>
      {error && (
        <span className="text-sm font-medium text-red-500 animate-in slide-in-from-top-1 fade-in duration-200">
          {error}
        </span>
      )}
    </div>
  );
};
