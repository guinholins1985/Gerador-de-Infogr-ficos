
import React, { useState } from 'react';

interface ApiKeyInputProps {
  onApiKeySubmit: (apiKey: string) => void;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onApiKeySubmit }) => {
  const [apiKey, setApiKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onApiKeySubmit(apiKey.trim());
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-gray-800/50 border border-gray-700 rounded-lg">
      <h3 className="text-xl font-semibold text-center text-brand-text-primary mb-4">
        Insira sua Chave da API do Google Gemini
      </h3>
      <p className="text-center text-sm text-brand-text-secondary mb-5">
        Para usar a geração com IA, você precisa da sua própria chave. Você pode obter uma gratuitamente no{' '}
        <a 
          href="https://aistudio.google.com/app/apikey" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-brand-primary hover:underline"
        >
          Google AI Studio
        </a>.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Cole sua chave da API aqui"
          className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-brand-text-primary focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition"
          required
        />
        <button
          type="submit"
          className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-brand-primary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition shadow-lg"
        >
          Salvar e Continuar
        </button>
      </form>
    </div>
  );
};

export default ApiKeyInput;
