import React from 'react';
import { InfographicData } from '../types';
import BenefitCard from './BenefitCard';

interface InfographicDisplayProps {
  data: InfographicData;
}

const cardColors = [
  '#4F46E5', // Indigo
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#6366F1', // Indigo Light
  '#34D399', // Emerald Light
];

const InfographicDisplay: React.FC<InfographicDisplayProps> = ({ data }) => {
  return (
    <div className="w-full max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
      {data.imageUrl && (
        <div className="mb-12 flex justify-center">
          <img 
            src={data.imageUrl} 
            alt="Cabeçalho do Infográfico" 
            className="max-h-96 w-auto rounded-2xl shadow-lg object-contain" 
          />
        </div>
      )}
      <h2 className="text-4xl md:text-5xl font-extrabold text-center text-brand-text-primary mb-12 tracking-tight">
        {data.title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {data.benefits.map((benefit, index) => (
          <BenefitCard 
            key={index} 
            benefit={benefit} 
            color={cardColors[index % cardColors.length]}
          />
        ))}
      </div>
    </div>
  );
};

export default InfographicDisplay;