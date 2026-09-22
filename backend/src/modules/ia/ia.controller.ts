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
    
    // Crear el prompt con contexto médico
    let prompt = `Eres un asistente médico experto de ClinicMed, llamado "✨ ClinicMed AI". Eres profesional, empático y usas emojis ocasionalmente.\n\n`;
    
    if (historial) {
      prompt += `Contexto del paciente: ${historial}\n\n`;
    }
    
    prompt += `Pregunta o comando del doctor: ${mensaje}\n\nRespuesta:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return res.json({
      ok: true,
      respuesta: text
    });
  } catch (error) {
    console.error('Error en Gemini AI:', error);
    return res.status(500).json({ ok: false, error: 'Error al procesar la solicitud con IA. Verifica la API Key.' });
  }
};

export const resumirExpediente = async (req: Request, res: Response) => {
  const { expedienteData } = req.body;

  if (!expedienteData) {
    return res.status(400).json({ ok: false, error: 'Datos del expediente requeridos' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `Actúa como un asistente clínico. Lee los siguientes datos del expediente de un paciente y redacta un resumen breve y profesional (máximo 2 párrafos) para que un médico lo lea rápidamente antes de la consulta. Destaca en negritas las alergias o patologías graves si las hay.\n\nDatos:\n${JSON.stringify(expedienteData)}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return res.json({
      ok: true,
      resumen: text
    });
  } catch (error) {
    console.error('Error en Gemini AI Resumen:', error);
    return res.status(500).json({ ok: false, error: 'Error al generar resumen con IA.' });
  }
};
