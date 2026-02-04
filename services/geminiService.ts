
import { GoogleGenAI, Type } from "@google/genai";

// Use process.env.API_KEY directly as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getLegalInsight = async (caseData: { processNumber: string; author: string; lawyer: string }) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analise as seguintes informações de um processo jurídico:
      Número: ${caseData.processNumber}
      Autor: ${caseData.author}
      Advogado: ${caseData.lawyer}

      Forneça um breve resumo profissional (2-3 frases) sobre como este registro ajuda na organização do escritório.`,
      config: {
        temperature: 0.7,
        topP: 0.95,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Erro ao obter insight da IA:", error);
    return "Não foi possível gerar um resumo inteligente no momento.";
  }
};
