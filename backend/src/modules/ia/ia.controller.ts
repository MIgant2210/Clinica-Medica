import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Usamos la llave que configuramos en .env
const API_KEY = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);

export const procesarPreguntaMedica = async (req: Request, res: Response) => {
  const { mensaje, historial } = req.body;

  if (!mensaje) {
    return res.status(400).json({ ok: false, error: 'Mensaje requerido' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    let prompt = `Eres el asistente médico IA de ClinicMed, experto en análisis de datos clínicos.\n\n`;
    if (historial) prompt += `Contexto del paciente: ${historial}\n\n`;
    prompt += `Pregunta o comando: ${mensaje}\n\nRespuesta de la IA:`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return res.json({ ok: true, respuesta: text });
  } catch (error) {
    console.error('Error en Gemini AI:', error);
    // FALLBACK DINÁMICO
    return res.json({
      ok: true,
      respuesta: `Aquí el asistente de ClinicMed (Modo Desconectado). No pude conectar con el servidor de Inteligencia Artificial para responder a: "${mensaje}". Por favor verifica la configuración del sistema.`
    });
  }
};

export const resumirExpediente = async (req: Request, res: Response) => {
  const { expedienteData } = req.body;
  if (!expedienteData) return res.status(400).json({ ok: false, error: 'Datos requeridos' });

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Actúa como un asistente clínico. Elabora un resumen clínico profesional, claro y conciso basado estrictamente en esta información:\n\n${JSON.stringify(expedienteData)}\n\nEl resumen debe destacar datos relevantes sin inventar síntomas.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return res.json({ ok: true, resumen: text });
  } catch (error) {
    console.error('Error en Gemini AI Resumen:', error);
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
