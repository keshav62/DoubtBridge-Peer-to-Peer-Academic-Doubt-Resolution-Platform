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
          className="text-sm font-medium text-gray-300"
        >
          {label}
          {required && (
            <span aria-hidden="true" className="ml-1 text-rose-400">*</span>
          )}
        </label>
      )}

      {/* Input wrapper */}
      <div className="relative flex items-center">
        {/* Leading icon */}
        {icon && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-3 flex-shrink-0 text-gray-500"
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
            'h-10 w-full rounded-lg border bg-white/[0.04] text-sm text-gray-100 placeholder-gray-600 outline-none',
            'transition-all duration-150',
            // Padding — add left padding when icon is present
            icon ? 'pl-9 pr-3' : 'px-3',
            // Border states
            error
              ? 'border-rose-500/60 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
              : 'border-white/[0.1] focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/15',
            // Disabled
            disabled ? 'cursor-not-allowed opacity-50' : '',
            inputClass,
          ]
            .filter(Boolean)
            .join(' ')}
          {...rest}
        />
      </div>

      {/* Error message */}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-rose-400">
          {error}
        </p>
      )}

      {/* Hint text */}
      {!error && hint && (
        <p id={`${id}-hint`} className="text-xs text-gray-500">
          {hint}
        </p>
      )}
    </div>
  );
}
