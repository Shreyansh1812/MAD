/**
 * Card Component
 * Reusable card container
 */

export const Card = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`bg-white rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-2xl ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => {
  return (
    <div className={`px-6 py-5 border-b-2 border-gray-100 ${className}`}>
      {children}
    </div>
  );
};

export const CardBody = ({ children, className = '' }) => {
  return (
    <div className={`px-6 py-6 ${className}`}>
      {children}
    </div>
  );
};

export const CardFooter = ({ children, className = '' }) => {
  return (
    <div className={`px-6 py-5 border-t-2 border-gray-100 ${className}`}>
      {children}
    </div>
  );
};
