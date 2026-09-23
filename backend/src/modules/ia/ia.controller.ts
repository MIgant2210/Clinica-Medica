import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const RESILIENT_MODELS = [
  'gemini-flash-latest',
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-3.1-flash-lite-preview'
];

async function generarConGemini(systemInstruction: string, prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY no encontrada en process.env');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  let ultimoError: any = null;

  for (const modelName of RESILIENT_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName, systemInstruction });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      if (text && text.trim().length > 0) {
        return text.trim();
      }
    } catch (err: any) {
      ultimoError = err;
      console.warn(`[ClinicMed IA] Modelo ${modelName} no disponible (${err.message}). Reintentando con alternativo...`);
    }
  }

  throw ultimoError || new Error('No se pudo conectar con ningún modelo de Gemini');
}

export const procesarPreguntaMedica = async (req: Request, res: Response) => {
  const { mensaje, historial } = req.body;

  if (!mensaje) {
    return res.status(400).json({ ok: false, error: 'Mensaje requerido' });
  }

  try {
    const sysInstruction = `Eres el Asistente Médico IA oficial de ClinicMed. Brindas orientación clínica cálida, rigurosa, empática y comprensible.
- NUNCA uses saludos vacíos ni introducciones repetitivas.
- Responde directamente a la consulta médica usando un formato limpio con viñetas y términos claros tanto para el médico como para el paciente.
- Si hay antecedentes de alergias o fármacos en el historial, tenlos siempre en cuenta para emitir advertencias farmacológicas preventivas.`;

    let prompt = '';
    if (historial) prompt += `Contexto del paciente en ClinicMed:\n${historial}\n\n`;
    prompt += `Consulta recibida:\n"${mensaje}"\n\nPor favor brinda una respuesta médica estructurada, clara y con recomendaciones prácticas:`;

    const respuesta = await generarConGemini(sysInstruction, prompt);
    return res.json({ ok: true, respuesta });
  } catch (error: any) {
    console.error('❌ Error en procesarPreguntaMedica:', error?.message || error);
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
    const sysInstruction = `Eres el Asistente Clínico Inteligente de ClinicMed. Tu objetivo es generar un resumen médico de alta calidad para el expediente clínico electrónico.
REGLAS OBLIGATORIAS:
- NUNCA incluyas frases introductorias (como "Aquí tiene el resumen:", "A continuación:", etc.) ni despedidas.
- Comienza directamente con los encabezados estructurados.
- Redacción médica elegante, humana, clara y orientada a la seguridad del paciente.`;

    const prompt = `Elabora un Resumen Clínico Integral y Elegante para el expediente médico de ${expedienteData.paciente || 'el paciente'}.

Utiliza exactamente esta estructura limpia con viñetas:

📋 **Perfil Clínico General**
(Síntesis clara del estado general y condición del paciente en lenguaje clínico profesional)

⚠️ **Alertas Críticas y Alergias**
(Identificación clara de fármacos o sustancias contraindicadas y advertencias de seguridad)

🩺 **Antecedentes Patológicos**
(Detalle de afecciones crónicas o antecedentes relevantes con su estado de control)

💡 **Orientación y Plan Preventivo**
(Recomendaciones médicas clave sobre monitoreo, hábitos de vida y siguientes pasos clínicos)

Datos clínicos registrados:
${JSON.stringify(expedienteData, null, 2)}`;

    const resumen = await generarConGemini(sysInstruction, prompt);
    return res.json({ ok: true, resumen });
  } catch (error: any) {
    console.error('❌ Error en resumirExpediente (Gemini):', error?.message || error);
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

