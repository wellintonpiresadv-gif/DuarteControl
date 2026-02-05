
import { GoogleGenAI } from "@google/genai";

export const getLegalInsight = async (caseData: { processNumber: string; author: string; lawyer: string }) => {
  try {
    // Inicialização do cliente seguindo rigorosamente as diretrizes do SDK
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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

    // Acesso direto à propriedade .text conforme as diretrizes
    return response.text;
  } catch (error) {
    console.error("Erro ao obter insight da IA:", error);
    return "Não foi possível gerar um resumo inteligente no momento.";
  }
};
