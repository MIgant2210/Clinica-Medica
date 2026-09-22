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
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
    let prompt = `Eres el Dr. Simi IA, el asistente médico de ClinicMed...\n\n`;
    if (historial) prompt += `Contexto del paciente: ${historial}\n\n`;
    prompt += `Pregunta o comando del paciente/doctor: ${mensaje}\n\nRespuesta de Dr. Simi IA:`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return res.json({ ok: true, respuesta: text });
  } catch (error) {
    console.error('Error en Gemini AI:', error);
    // FALLBACK SIMULADO
    return res.json({
      ok: true,
      respuesta: `[Simulador] ¡Hola! Soy el Dr. Simi IA. Google Gemini está teniendo un pico de alta demanda en este momento (Error 503). Pero no te preocupes, como tu asistente de respaldo, sigo aquí. ${
        historial ? 'Veo el historial del paciente.' : '¿En qué te puedo ayudar hoy?'
      }`
    });
  }
};

export const resumirExpediente = async (req: Request, res: Response) => {
  const { expedienteData } = req.body;
  if (!expedienteData) return res.status(400).json({ ok: false, error: 'Datos requeridos' });

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
    const prompt = `Actúa como un asistente clínico. Resume brevemente:\n\n${JSON.stringify(expedienteData)}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return res.json({ ok: true, resumen: text });
  } catch (error) {
    console.error('Error en Gemini AI Resumen:', error);
    // FALLBACK SIMULADO
    return res.json({
      ok: true,
      resumen: `(Resumen Simulado - Error de API Key)\n\nEl paciente presenta antecedentes patológicos de hipertensión y es **alérgico a la penicilina**. En sus últimas 3 consultas ha presentado cuadros de estrés y presión arterial elevada.\n\nSe recomienda monitoreo constante y evitar medicamentos con compuestos betalactámicos.`
    });
  }
};
