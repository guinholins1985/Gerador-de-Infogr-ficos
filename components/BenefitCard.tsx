
import React from 'react';
import { Benefit } from '../types';
import Icon from './Icon';

interface BenefitCardProps {
  benefit: Benefit;
  color: string;
}

const BenefitCard: React.FC<BenefitCardProps> = ({ benefit, color }) => {
  return (
    <div className={`bg-brand-surface p-6 rounded-2xl shadow-lg border border-gray-700/50 transform hover:-translate-y-2 transition-transform duration-300 ease-in-out flex flex-col items-start`}>
      <div className={`p-3 rounded-xl mb-4`} style={{ backgroundColor: color }}>
        <Icon name={benefit.icon} className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-xl font-bold text-brand-text-primary mb-2">{benefit.title}</h3>
      <p className="text-brand-text-secondary text-base leading-relaxed">{benefit.description}</p>
    </div>
  );
};

export default BenefitCard;
