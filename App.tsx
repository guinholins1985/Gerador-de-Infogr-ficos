
import React, { useState, useCallback, useRef } from 'react';
import { generateInfographicData } from './services/geminiService';
import { InfographicData, InputMode, Benefit, IconName } from './types';
import InfographicDisplay from './components/InfographicDisplay';
import Loader from './components/Loader';
import Icon from './components/Icon';

const iconOptions: IconName[] = ['estrela', 'foguete', 'coracao', 'lampada', 'grafico', 'escudo'];

const App: React.FC = () => {
  const [inputMode, setInputMode] = useState<InputMode>(InputMode.AI);
  const [topic, setTopic] = useState<string>('');
  const [manualTitle, setManualTitle] = useState<string>('');
  const [manualBenefits, setManualBenefits] = useState<Omit<Benefit, 'icon'>[]>([{ title: '', description: '' }]);
  const [image, setImage] = useState<string | null>(null);
  
  const [infographicData, setInfographicData] = useState<InfographicData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError("O arquivo de imagem é muito grande. O limite é de 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setError(null);
      };
      reader.onerror = () => {
        setError("Falha ao ler o arquivo de imagem.");
      }
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateFromAI = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setInfographicData(null);
    try {
      let imagePayload: { data: string; mimeType: string; } | undefined = undefined;
      
      if (image) {
        const parts = image.split(',');
        const mimeTypePart = parts[0].match(/:(.*?);/);
        if (parts.length === 2 && mimeTypePart) {
          imagePayload = {
            mimeType: mimeTypePart[1],
            data: parts[1]
          };
        } else {
            console.error("Formato de URL de dados inválido para a imagem.");
            setError("Ocorreu um erro ao processar a imagem.");
            setIsLoading(false);
            return;
        }
      }

      const data = await generateInfographicData(topic, imagePayload);
      setInfographicData({ ...data, imageUrl: image });
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro desconhecido.');
    } finally {
      setIsLoading(false);
    }
  }, [topic, image]);

  const handleAddBenefit = () => {
    if (manualBenefits.length < 6) {
        setManualBenefits([...manualBenefits, { title: '', description: '' }]);
    }
  };
  
  const handleRemoveBenefit = (index: number) => {
    if (manualBenefits.length > 1) {
        const newBenefits = manualBenefits.filter((_, i) => i !== index);
        setManualBenefits(newBenefits);
    }
  };

  const handleBenefitChange = (index: number, field: 'title' | 'description', value: string) => {
    const newBenefits = [...manualBenefits];
    newBenefits[index][field] = value;
    setManualBenefits(newBenefits);
  };

  const handleGenerateFromManual = () => {
    if (!manualTitle.trim()) {
      setError('Por favor, insira um título para o infográfico.');
      return;
    }
    if (manualBenefits.some(b => !b.title.trim() || !b.description.trim())) {
      setError('Por favor, preencha todos os campos de benefícios.');
      return;
    }
    setError(null);
    const data: InfographicData = {
      title: manualTitle,
      benefits: manualBenefits.map((b, i) => ({
        ...b,
        icon: iconOptions[i % iconOptions.length],
      })),
      imageUrl: image
    };
    setInfographicData(data);
  };

  const resetForm = () => {
    setInfographicData(null);
    setTopic('');
    setManualTitle('');
    setManualBenefits([{ title: '', description: '' }]);
    setImage(null);
    setError(null);
    setIsLoading(false);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const renderImageUpload = () => {
    const labelText = inputMode === InputMode.AI
      ? "Imagem de Referência (Opcional)"
      : "Imagem de Cabeçalho (Opcional)";
    const description = inputMode === InputMode.AI
      ? "A IA usará a imagem para gerar o conteúdo."
      : "A imagem aparecerá no topo do infográfico.";

    return (
      <div className="mt-6 border-t border-gray-700 pt-6">
          <label className="block text-lg font-medium text-brand-text-primary mb-1">
            {labelText}
          </label>
          <p className="text-sm text-brand-text-secondary mb-3">{description}</p>
          {!image && (
            <>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer w-full flex justify-center items-center px-6 py-3 border-2 border-dashed border-gray-600 text-base font-medium rounded-lg text-brand-text-secondary hover:border-brand-primary hover:text-brand-primary transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                Adicionar Imagem (Máx 5MB)
              </label>
            </>
          )}
          {image && (
            <div className="relative group">
              <img src={image} alt="Pré-visualização" className="w-full max-h-48 object-contain rounded-lg bg-gray-900/50 p-2" />
              <button
                onClick={() => {
                  setImage(null)
                  if(fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
                className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remover imagem"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          )}
      </div>
    );
  }

  const renderAiPanel = () => (
    <div className="w-full">
      <div className="space-y-4">
        <label htmlFor="topic-input" className="block text-lg font-medium text-brand-text-primary">
          Tópico do Produto ou Serviço <span className="text-sm text-brand-text-secondary">(Opcional)</span>
        </label>
        <input
          id="topic-input"
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Deixe em branco para um tópico surpresa ou insira o seu"
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-brand-text-primary focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition"
        />
        <button
          onClick={handleGenerateFromAI}
          disabled={isLoading}
          className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-brand-primary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition disabled:bg-indigo-400 disabled:cursor-not-allowed"
        >
          <Icon name="estrela" className="w-5 h-5 mr-2" />
          Gerar Infográfico com IA
        </button>
      </div>
      {renderImageUpload()}
    </div>
  );

  const renderManualPanel = () => (
    <div className="w-full">
        <div className="space-y-6">
            <div>
                <label htmlFor="manual-title" className="block text-lg font-medium text-brand-text-primary mb-2">
                Título do Infográfico
                </label>
                <input
                id="manual-title"
                type="text"
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                placeholder="Ex: 'Nossos Principais Benefícios'"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-brand-text-primary focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition"
                />
            </div>
            <div className="space-y-4">
                {manualBenefits.map((benefit, index) => (
                <div key={index} className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg space-y-3 relative">
                    <div className="flex justify-between items-center">
                    <label className="text-md font-medium text-brand-text-primary">Benefício {index + 1}</label>
                    {manualBenefits.length > 1 && (
                      <button onClick={() => handleRemoveBenefit(index)} className="text-red-400 hover:text-red-300 transition text-2xl absolute -top-1 -right-2 leading-none">&times;</button>
                    )}
                    </div>
                    <input
                    type="text"
                    value={benefit.title}
                    onChange={(e) => handleBenefitChange(index, 'title', e.target.value)}
                    placeholder="Título do benefício"
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-brand-text-primary focus:ring-1 focus:ring-brand-primary focus:border-brand-primary transition"
                    />
                    <textarea
                    value={benefit.description}
                    onChange={(e) => handleBenefitChange(index, 'description', e.target.value)}
                    placeholder="Descrição do benefício"
                    rows={2}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-brand-text-primary focus:ring-1 focus:ring-brand-primary focus:border-brand-primary transition"
                    />
                </div>
                ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={handleAddBenefit} disabled={manualBenefits.length >= 6} className="w-full sm:w-auto px-6 py-3 border border-gray-600 text-base font-medium rounded-lg text-brand-text-primary bg-gray-700 hover:bg-gray-600 transition disabled:bg-gray-800 disabled:cursor-not-allowed disabled:text-gray-500">Adicionar Benefício</button>
                <button onClick={handleGenerateFromManual} className="flex-grow flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-brand-secondary hover:bg-green-600 transition">Gerar Infográfico</button>
            </div>
        </div>
        {renderImageUpload()}
    </div>
  );

  return (
    <div className="min-h-screen bg-brand-background text-brand-text-primary p-4 sm:p-6 lg:p-8">
      <main className="max-w-4xl mx-auto">
        <header className="text-center my-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
            Gerador de Infográficos
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-brand-text-secondary max-w-2xl mx-auto">
            Crie um infográfico de benefícios impressionante a partir de um tópico ou preenchendo os dados manualmente.
          </p>
        </header>

        {!infographicData && (
          <div className="bg-brand-surface p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-700/50">
            <div className="flex justify-center border-b border-gray-700 mb-6">
              <button onClick={() => setInputMode(InputMode.AI)} className={`px-4 py-2 text-lg font-semibold transition ${inputMode === InputMode.AI ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-brand-text-secondary'}`}>
                Gerar com IA
              </button>
              <button onClick={() => setInputMode(InputMode.MANUAL)} className={`px-4 py-2 text-lg font-semibold transition ${inputMode === InputMode.MANUAL ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-brand-text-secondary'}`}>
                Preencher Manualmente
              </button>
            </div>
            {inputMode === InputMode.AI ? renderAiPanel() : renderManualPanel()}
          </div>
        )}

        {error && <div className="mt-6 text-center text-red-400 bg-red-900/50 p-4 rounded-lg">{error}</div>}

        {isLoading && <Loader />}
        
        {infographicData && (
          <>
            <InfographicDisplay data={infographicData} />
            <div className="text-center mt-12">
              <button 
                onClick={resetForm}
                className="px-8 py-3 bg-brand-primary text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
              >
                Criar Novo Infográfico
              </button>
            </div>
          </>
        )}
      </main>

       <footer className="text-center py-8 mt-12 text-brand-text-secondary">
          <p>&copy; {new Date().getFullYear()} Gerador de Infográficos com IA. Feito com Gemini & React.</p>
        </footer>
    </div>
  );
};

export default App;
