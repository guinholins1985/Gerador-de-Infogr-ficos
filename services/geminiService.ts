
import { GoogleGenAI, Type } from "@google/genai";
import { InfographicData } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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

export const generateInfographicData = async (topic?: string): Promise<InfographicData> => {
    try {
        const prompt = topic?.trim()
            ? `Você é um especialista em marketing e design. A partir do tópico de um produto ou serviço "${topic}", crie um título atraente para um infográfico e uma lista de 5 benefícios principais. Para cada benefício, forneça um título curto e uma descrição concisa (máximo de 20 palavras). Além disso, sugira um ícone relevante para cada benefício a partir da seguinte lista: 'estrela', 'foguete', 'coracao', 'lampada', 'grafico', 'escudo'. Responda exclusivamente no formato JSON especificado.`
            : `Você é um especialista em marketing e design. Crie um infográfico sobre um tópico interessante e popular (por exemplo: "Os Benefícios da Leitura Diária", "Vantagens de Beber Água", "Como a Meditação Melhora a Vida"). Crie um título atraente para o infográfico e uma lista de 5 benefícios principais. Para cada benefício, forneça um título curto e uma descrição concisa (máximo de 20 palavras). Além disso, sugira um ícone relevante para cada benefício a partir da seguinte lista: 'estrela', 'foguete', 'coracao', 'lampada', 'grafico', 'escudo'. Responda exclusivamente no formato JSON especificado.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
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
    } catch (error) {
        console.error("Erro ao gerar dados do infográfico:", error);
        throw new Error("Não foi possível gerar o conteúdo. Por favor, tente novamente.");
    }
};
