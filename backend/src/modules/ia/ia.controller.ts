import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

function getGeminiModel() {
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey) {
    console.error('⚠️ [ClinicMed IA] Error: GEMINI_API_KEY no encontrada en process.env');
    throw new Error('API Key de Gemini no configurada');
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
}

export const procesarPreguntaMedica = async (req: Request, res: Response) => {
  const { mensaje, historial } = req.body;

  if (!mensaje) {
    return res.status(400).json({ ok: false, error: 'Mensaje requerido' });
  }

  try {
    const model = getGeminiModel();
    let prompt = `Eres el asistente médico IA oficial de ClinicMed. Brinda respuestas médicas profesionales, claras, empáticas y fundamentadas en guías clínicas.\n\n`;
    if (historial) prompt += `Contexto del paciente:\n${historial}\n\n`;
    prompt += `Pregunta o consulta clínica: ${mensaje}\n\nRespuesta:`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return res.json({ ok: true, respuesta: text });
  } catch (error: any) {
    console.error('❌ Error en procesarPreguntaMedica (Gemini):', error?.message || error);
    return res.json({
      ok: true,
      respuesta: `Aquí el asistente de ClinicMed (Modo Desconectado). No pude conectar con el servidor de Inteligencia Artificial para responder a: "${mensaje}". Por favor verifica la conexión.`
    });
  }
};

export const resumirExpediente = async (req: Request, res: Response) => {
  const { expedienteData } = req.body;
  if (!expedienteData) return res.status(400).json({ ok: false, error: 'Datos requeridos' });

  try {
    const model = getGeminiModel();
    const prompt = `Actúa como un médico especialista asistente. Elabora un resumen clínico profesional, conciso y estructurado en Markdown basado estrictamente en estos datos del expediente:\n\n${JSON.stringify(expedienteData, null, 2)}\n\nIncluye: 1. Estado General, 2. Alergias Críticas, 3. Antecedentes Patológicos, 4. Últimas Consultas y Recomendaciones Breves.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return res.json({ ok: true, resumen: text });
  } catch (error: any) {
    console.error('❌ Error en resumirExpediente (Gemini):', error?.message || error);
    // FALLBACK SIMULADO DINÁMICO BASADO EN LOS DATOS REALES
    const { paciente, alergias, patologias } = expedienteData;
    
    let resumenSimulado = `**Resumen Clínico Generado Localmente:**\n\nEl paciente **${paciente || 'desconocido'}** presenta:\n`;
    resumenSimulado += `- **Antecedentes Alérgicos:** ${alergias || 'Ninguno reportado'}.\n`;
    resumenSimulado += `- **Antecedentes Patológicos:** ${patologias || 'Ninguno reportado'}.\n\n`;
    resumenSimulado += `*Nota: La IA en la nube no está disponible en este momento.*`;

    return res.json({
      ok: true,
      resumen: resumenSimulado
    });
  }
};

