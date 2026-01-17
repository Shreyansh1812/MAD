/**
 * Input Component
 * Reusable input field with validation states
 */

export const Input = ({ 
  label,
  error,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  className = '',
  inputClassName = '',
  ...props 
}) => {
  const inputStyles = `w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-3 focus:ring-offset-1 disabled:bg-gray-50 disabled:cursor-not-allowed font-medium ${
    error 
      ? 'border-red-400 bg-red-50 focus:ring-red-300 focus:border-red-500 shake' 
      : 'border-gray-200 bg-white focus:ring-primary-300 focus:border-primary-600 hover:border-gray-300'
  }`;

  return (
    <div className={`${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`${inputStyles} ${inputClassName}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};
