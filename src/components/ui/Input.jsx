/**
 * Input — reusable accessible form input
 *
 * Props:
 *   id          {string}    — required for label association
 *   label       {string}    — visible label text
 *   error       {string}    — error message; also sets aria-invalid
 *   hint        {string}    — helper text below the input
 *   icon        {ReactNode} — leading icon inside the input
 *   disabled    {boolean}
 *   required    {boolean}
 *   className   {string}    — extra classes on the wrapper div
 *   inputClass  {string}    — extra classes on the <input> element
 *   ...rest     — forwarded to <input>
 */
export default function Input({
  id,
  label,
  error,
  hint,
  icon,
  disabled = false,
  required = false,
  className = '',
  inputClass = '',
  ...rest
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {/* Label */}
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-[#344568]"
        >
          {label}
          {required && (
            <span aria-hidden="true" className="ml-1 text-red-500">*</span>
          )}
        </label>
      )}

      {/* Input wrapper */}
      <div className="relative flex items-center">
        {/* Leading icon */}
        {icon && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-3 flex-shrink-0 text-[#94A3B8]"
          >
            {icon}
          </span>
        )}

        <input
          id={id}
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
          aria-describedby={
            [error ? `${id}-error` : '', hint ? `${id}-hint` : '']
              .filter(Boolean)
              .join(' ') || undefined
          }
          className={[
            'h-10 w-full rounded-xl border bg-white text-sm text-[#101B3D] placeholder-[#94A3B8] outline-none',
            'transition-all duration-150',
            // Padding — add left padding when icon is present
            icon ? 'pl-9 pr-3' : 'px-3',
            // Border states
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/15'
              : 'border-[#E5EAF2] focus:border-[#2563EB]/50 focus:ring-2 focus:ring-[#2563EB]/10',
            // Disabled
            disabled ? 'cursor-not-allowed opacity-50 bg-[#F8FAFC]' : '',
            inputClass,
          ]
            .filter(Boolean)
            .join(' ')}
          {...rest}
        />
      </div>

      {/* Error message */}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}

      {/* Hint text */}
      {!error && hint && (
        <p id={`${id}-hint`} className="text-xs text-[#64748B]">
          {hint}
        </p>
      )}
    </div>
  );
}
