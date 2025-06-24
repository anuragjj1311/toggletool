
export const Notification = ({ message, type = 'success' }) => {
  const bgColor = type === 'success' ? 'bg-blue-600' : 'bg-blue-500';
  
  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50`}>
      {message}
    </div>
  );
};