
import { GoogleGenAI, Type } from "@google/genai";
import { InfographicData } from '../types';

// O esquema permanece o mesmo
const infographicSchema = {
    type: Type.OBJECT,
    properties: {
        title: {
            type: Type.STRING,
            description: "O título principal e atraente do infográfico."
        },
        benefits: {
            type: Type.ARRAY,
            description: "Uma lista de 5 benefícios principais.",
            items: {
                type: Type.OBJECT,
                properties: {
                    icon: {
                        type: Type.STRING,
                        description: "Nome do ícone da lista fornecida: 'estrela', 'foguete', 'coracao', 'lampada', 'grafico', 'escudo'."
                    },
                    title: {
                        type: Type.STRING,
                        description: "O título curto e impactante do benefício."
                    },
                    description: {
                        type: Type.STRING,
                        description: "A descrição concisa do benefício (máximo de 20 palavras)."
                    }
                },
                required: ["icon", "title", "description"]
            }
        }
    },
    required: ["title", "benefits"]
};

// A função agora aceita a chave da API como primeiro argumento
export const generateInfographicData = async (
    apiKey: string,
    topic?: string,
    image?: { data: string; mimeType: string }
): Promise<InfographicData> => {
    // Instancia o cliente da IA aqui, usando a chave fornecida
    const ai = new GoogleGenAI({ apiKey });

    try {
        let prompt: string;
        let contents: any;

        if (image) {
            prompt = topic?.trim()
                ? `Você é um especialista em marketing e design. A partir do tópico "${topic}" e da imagem do produto fornecida, crie um título atraente para um infográfico e uma lista de 5 benefícios principais. Descreva benefícios que são visualmente evidentes na imagem ou fortemente implícitos por ela. Para cada benefício, forneça um título curto, uma descrição concisa (máximo de 20 palavras) e um ícone relevante da lista: 'estrela', 'foguete', 'coracao', 'lampada', 'grafico', 'escudo'. Responda exclusivamente no formato JSON especificado.`
                : `Você é um especialista em marketing e design. Analise a imagem do produto fornecida, crie um título atraente para um infográfico e uma lista de 5 de seus benefícios principais. Para cada benefício, forneça um título curto, uma descrição concisa (máximo de 20 palavras) e um ícone relevante da lista: 'estrela', 'foguete', 'coracao', 'lampada', 'grafico', 'escudo'. Responda exclusivamente no formato JSON especificado.`;
            
            contents = {
                parts: [
                    { text: prompt },
                    { inlineData: { mimeType: image.mimeType, data: image.data } }
                ]
            };
        } else {
            prompt = topic?.trim()
                ? `Você é um especialista em marketing e design. A partir do tópico de um produto ou serviço "${topic}", crie um título atraente para um infográfico e uma lista de 5 benefícios principais. Para cada benefício, forneça um título curto e uma descrição concisa (máximo de 20 palavras). Além disso, sugira um ícone relevante para cada benefício a partir da seguinte lista: 'estrela', 'foguete', 'coracao', 'lampada', 'grafico', 'escudo'. Responda exclusivamente no formato JSON especificado.`
                : `Você é um especialista em marketing e design. Crie um infográfico sobre um tópico interessante e popular (por exemplo: "Os Benefícios da Leitura Diária", "Vantagens de Beber Água", "Como a Meditação Melhora a Vida"). Crie um título atraente para o infográfico e uma lista de 5 benefícios principais. Para cada benefício, forneça um título curto e uma descrição concisa (máximo de 20 palavras). Além disso, sugira um ícone relevante para cada benefício a partir da seguinte lista: 'estrela', 'foguete', 'coracao', 'lampada', 'grafico', 'escudo'. Responda exclusivamente no formato JSON especificado.`;
            
            contents = prompt;
        }
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
                responseMimeType: "application/json",
                responseSchema: infographicSchema,
            },
        });

        const jsonText = response.text.trim();
        const parsedData = JSON.parse(jsonText);

        if (!parsedData.title || !parsedData.benefits || parsedData.benefits.length === 0) {
          throw new Error("Resposta da IA inválida ou vazia.");
        }

        return parsedData as InfographicData;
    } catch (error: any) {
        console.error("Erro ao gerar dados do infográfico:", error);
        // Tratamento de erro específico para chave de API inválida
        if (error.message.includes('API key not valid')) {
            throw new Error("Sua chave da API do Gemini é inválida ou expirou. Por favor, verifique-a e tente novamente.");
        }
        throw new Error("Não foi possível gerar o conteúdo. Verifique sua chave de API e tente novamente.");
    }
};
