import React from 'react';

interface ProgressCardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'orange';
  isScore?: boolean;
}

const ProgressCard: React.FC<ProgressCardProps> = ({ title, value, subtitle, icon, color, isScore = false }) => {
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue': return 'from-blue-500 to-blue-600 text-blue-600';
      case 'green': return 'from-green-500 to-green-600 text-green-600';
      case 'yellow': return 'from-yellow-500 to-yellow-600 text-yellow-600';
      case 'orange': return 'from-orange-500 to-orange-600 text-orange-600';
      default: return 'from-gray-500 to-gray-600 text-gray-600';
    }
  };

  const colorClasses = getColorClasses(color);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-r ${colorClasses.split(' ')[0]} ${colorClasses.split(' ')[1]} text-white`}>
          {icon}
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-800">
            {isScore ? value : `${value}%`}
          </p>
        </div>
      </div>
      <h3 className="text-sm font-semibold text-gray-600 mb-1">{title}</h3>
      <p className="text-xs text-gray-500">{subtitle}</p>
      {!isScore && (
        <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
          <div
            className={`bg-gradient-to-r ${colorClasses.split(' ')[0]} ${colorClasses.split(' ')[1]} h-2 rounded-full transition-all duration-500`}
            style={{ width: `${value}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default ProgressCard;