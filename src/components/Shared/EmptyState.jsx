/**
 * EmptyState Component
 * Display when no data is available
 */

export const EmptyState = ({ 
  icon: Icon,
  title, 
  description, 
  action,
  className = '' 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
      {Icon && (
        <div className="mb-6 text-gray-300 bg-gray-50 p-6 rounded-3xl">
          <Icon size={72} strokeWidth={1.5} />
        </div>
      )}
      <h3 className="text-2xl font-bold text-gray-900 mb-3">{title}</h3>
      {description && (
        <p className="text-gray-600 mb-8 max-w-md font-medium leading-relaxed">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
};
