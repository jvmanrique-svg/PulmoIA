import React, { useState, useRef, useEffect } from 'react';
import { PatientProfile, EnvironmentalData, SymptomLog, ChatMessage } from '../types';
import { 
  Bot, 
  Send, 
  Sparkles, 
  AlertTriangle, 
  ShieldAlert, 
  RotateCcw, 
  User, 
  HeartPulse, 
  HelpCircle,
  Thermometer,
  Wind,
  PhoneCall
} from 'lucide-react';

interface AIChatScreenProps {
  patient: PatientProfile;
  environment: EnvironmentalData;
  logs: SymptomLog[];
  onOpenEmergency: () => void;
}

const SUGGESTED_QUERIES = [
  '¿Cómo me afecta el clima y la humedad de hoy?',
  '¿Cuándo debo acudir de inmediato a urgencias?',
  '¿Cuál es la técnica correcta del inhalador y aerocámara?',
  '¿Qué hago si mi flujo PEF cae a Zona Amarilla?',
  '¿Por qué debo tomar mi corticoide de control si me siento bien?',
  '¿Puedo hacer ejercicio físico hoy con este clima?',
];

export const AIChatScreen: React.FC<AIChatScreenProps> = ({
  patient,
  environment,
  logs,
  onOpenEmergency,
}) => {
  const latestLog = logs[0];
  const currentPEF = latestLog ? latestLog.pef : patient.baselinePEF;
  const currentZone = latestLog ? latestLog.zone : 'green';

  const defaultGreeting: ChatMessage = {
    id: 'msg-init',
    sender: 'assistant',
    text: `¡Hola, ${patient.name.split(' ')[0]}! 👋 Soy **PulmoBot**, tu asistente clínico respiratorio inteligente.\n\nHe revisado tus parámetros actuales:\n- **Diagnóstico registrado:** ${patient.asthmaType}\n- **Último Flujo PEF:** ${currentPEF} L/min (${currentZone === 'green' ? 'Zona Verde - Óptimo' : currentZone === 'yellow' ? 'Zona Amarilla - Precaución' : 'Zona Roja - Alerta'})\n- **Condición ambiental en ${environment.city}:** ${environment.temperature}°C, ${environment.humidity}% humedad, Calidad ICA ${environment.aqi} (${environment.aqiLevel})\n\n¿Tienes alguna duda sobre tus síntomas, inhaladores o cómo cuidarte hoy?`,
    timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    suggestedQuestions: SUGGESTED_QUERIES.slice(0, 3),
  };

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('pulmo_chat_history');
      return saved ? JSON.parse(saved) : [defaultGreeting];
    } catch {
      return [defaultGreeting];
    }
  });

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Guardar historial del chat
  useEffect(() => {
    try {
      localStorage.setItem('pulmo_chat_history', JSON.stringify(messages));
    } catch {
      // storage unavailable
    }
  }, [messages]);

  // Auto-scroll al final
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleResetChat = () => {
    if (window.confirm('¿Deseas reiniciar la conversación con PulmoBot?')) {
      setMessages([defaultGreeting]);
      localStorage.removeItem('pulmo_chat_history');
    }
  };

  // Motor de respuesta clínica con detección de emergencias
  const generateAIResponse = (userText: string): { reply: string; isAlert: boolean; alertType?: 'danger' | 'warning' | 'info' } => {
    const textLower = userText.toLowerCase();

    // 1. Detección de SEÑALES DE ALARMA / URGENCIA MÉDICA
    const emergencyTriggers = [
      'urgencia', 'emergencia', 'no puedo respirar', 'asfixia', 'labios azules', 
      'morado', 'pecho apretado', 'dolor de pecho fuerte', 'ahogando', 'no hace efecto', 
      'pef bajo', 'zona roja', 'desmayo', 'no puedo hablar', 'hospital'
    ];

    const hasEmergencyTrigger = emergencyTriggers.some((t) => textLower.includes(t));

    if (hasEmergencyTrigger || textLower.includes('cuándo debo acudir') || textLower.includes('cuando ir a urgencias')) {
      return {
        reply: `🚨 **CRITERIOS DE URGENCIA MÉDICA INMEDIATA (Guías GINA / GOLD):**\n\nDebes acudir inmediatamente a un servicio de urgencias o activar el 112 / 911 si experimentas:\n\n1. **Dificultad severa para respirar:** No puedes completar oraciones de corrido sin detenerte a tomar aire.\n2. **Uso de músculos accesorios:** Hundimiento entre las costillas o en la base del cuello al respirar.\n3. **Cianosis:** Coloración azulada o grisácea en labios, encías o uñas.\n4. **Inhalador de rescate ineficaz:** Tras 4 a 6 inhalaciones de Salbutamol no notas mejoría en 15 minutos.\n5. **Flujo Espiratorio Máximo (PEF) < 50%:** Tu valor actual cae por debajo de **${Math.round(patient.baselinePEF * 0.5)} L/min** (Zona Roja).\n\n⚠️ *No esperes si sientes que el ahogo empeora. Pulsa abajo para ver tu plan de crisis.*`,
        isAlert: true,
        alertType: 'danger',
      };
    }

    // 2. Preguntas sobre Clima, Humedad y Factores Ambientales
    if (textLower.includes('humedad') || textLower.includes('clima') || textLower.includes('temperatura') || textLower.includes('ambiente') || textLower.includes('aire')) {
      let advice = `Actualmente en **${environment.city}** registramos **${environment.temperature}°C**, **${environment.humidity}% de humedad** e Índice de Calidad del Aire (ICA) **${environment.aqi} (${environment.aqiLevel})**.\n\n`;

      if (environment.humidity > 70) {
        advice += `💧 **Impacto de la Humedad Alta (>70%):**\n- El aire denso incrementa la resistencia al flujo bronquial.\n- Favorece la reproducción de ácaros del polvo y proliferación de esporas fúngicas.\n- **Recomendación:** Ventila la casa en horas soleadas y templadas, evita secar ropa en el dormitorio y mantén tu inhalador de control a tiempo.`;
      } else if (environment.humidity < 35) {
        advice += `🏜️ **Impacto del Aire Seco (<35%):**\n- Deshidrata la película mucosa de los bronquios, provocando tos seca refleja y facilitando el broncoespasmo.\n- **Recomendación:** Bebe abundante agua para mantener la mucosa hidratada y considera usar un humidificador frío.`;
      } else {
        advice += `✅ **Humedad en Rango Confortable:** El nivel actual del ${environment.humidity}% es fisiológicamente adecuado para tus vías respiratorias.`;
      }

      if (environment.uvIndex >= 6) {
        advice += `\n\n☀️ **Radiación UV e Irritación:** El índice UV actual es ${environment.uvIndex}. La alta insolación incrementa la formación de ozono a nivel del suelo, el cual irrita los bronquios en asma y EPOC. Evita ejercicio extenuante al mediodía.`;
      }

      return { reply: advice, isAlert: environment.humidity > 70 || environment.aqi > 100, alertType: 'warning' };
    }

    // 3. Preguntas sobre Inhalador / Aerocámara
    if (textLower.includes('inhalador') || textLower.includes('aerocámara') || textLower.includes('aerocamara') || textLower.includes('técnica') || textLower.includes('spray')) {
      return {
        reply: `🎯 **TÉCNICA CORRECTA CON AEROCÁMARA / ESPACIADOR:**\n\n1. **Agita el inhalador** vigorosamente durante 5 segundos.\n2. **Insértalo en la aerocámara** y retira la tapa de la boquilla.\n3. **Exhala todo el aire** de tus pulmones suavemente hacia afuera.\n4. **Coloca la boquilla** en tu boca sellando bien con los labios (sin morderla).\n5. **Presiona el inhalador 1 sola vez** e inhala de forma lenta y profunda durante 5 segundos.\n6. **Aguanta la respiración (apnea)** durante 10 segundos para permitir que las micropartículas se depositen en los bronquios distales.\n7. **Espera 30 a 60 segundos** antes de una segunda pulsación si estuviera indicada.\n\n💡 *Recuerda siempre enjuagarte la boca con agua tras usar corticoides inhalados (como Budesonida).*`,
        isAlert: false,
      };
    }

    // 4. Preguntas sobre Zona Amarilla / PEF
    if (textLower.includes('amarilla') || textLower.includes('pef') || textLower.includes('flujo') || textLower.includes('baja') || textLower.includes('390')) {
      return {
        reply: `⚠️ **PLAN DE ACCIÓN EN ZONA AMARILLA (50% al 79% del PEF):**\n\nTu referencia personal óptima es de **${patient.baselinePEF} L/min**. La Zona Amarilla abarca entre **${Math.round(patient.baselinePEF * 0.5)} y ${Math.round(patient.baselinePEF * 0.79)} L/min**.\n\n**Significado:** Hay inicio de estrechamiento o inflamación bronquial activa.\n\n**Acciones según guías clínicas:**\n- Utiliza tu inhalador de rescate prescripto (${patient.currentMedications.find(m => m.type === 'rescate')?.name || 'Salbutamol'}).\n- Revisa si has estado expuesto a desencadenantes (polvo, humo, aire frío, humedad).\n- Asegura que tu dosis de mantenimiento matutina y nocturna esté completa.\n- Si los valores permanecen en amarillo por más de 48 horas, contacta a tu neumólogo (${patient.doctorContact.name}).`,
        isAlert: true,
        alertType: 'warning',
      };
    }

    // 5. Preguntas sobre Deporte / Ejercicio
    if (textLower.includes('ejercicio') || textLower.includes('deporte') || textLower.includes('correr') || textLower.includes('caminar')) {
      return {
        reply: `🏃 **ACTIVIDAD FÍSICA Y SALUD RESPIRATORIA:**\n\n¡El ejercicio es muy beneficioso para fortalecer el diafragma y la capacidad pulmonar! Sigue estas precauciones:\n\n- Si padeces broncoespasmo inducido por ejercicio, consulta con tu médico la administración de **1-2 puffs de Salbutamol 15 minutos antes** de iniciar.\n- Realiza un **calentamiento gradual de 10 a 15 minutos**.\n- Respira por la nariz siempre que sea posible para filtrar y calentar el aire.\n- En días con aire frío (<10°C) o alta polución (AQI >100), prefiere actividades en interiores.`,
        isAlert: false,
      };
    }

    // 6. Medicación de Control vs Rescate
    if (textLower.includes('control') || textLower.includes('rescate') || textLower.includes('corticoide') || textLower.includes('diferencia')) {
      return {
        reply: `💊 **MEDICAMENTO DE CONTROL VS. DE RESCATE:**\n\n- **Inhalador de CONTROL (ej. Budesonida / Formoterol):** Desinflama y protege los bronquios a largo plazo. Se debe tomar **TODOS LOS DÍAS**, incluso cuando te sientas excelente y sin síntomas.\n- **Inhalador de RESCATE (ej. Salbutamol):** Dilata los bronquios rápidamente (en 3 a 5 minutos) para aliviar una sensación aguda de opresión o tos. Solo se usa ante síntomas o rescate puntual.\n\n⚠️ *Si necesitas usar el inhalador de rescate más de 2 veces por semana, indica que el asma no está bien controlada y requiere ajuste por tu médico.*`,
        isAlert: false,
      };
    }

    // Respuesta general educativa
    return {
      reply: `He analizado tu consulta sobre "*${userText}*".\n\nEn el manejo del **${patient.asthmaType}**, mantener las vías aéreas estables requiere constancia con la terapia inhalada y vigilancia de factores ambientales como la humedad (${environment.humidity}%) y temperatura (${environment.temperature}°C).\n\n¿Te gustaría profundizar en la técnica de inhalación, conocer pautas para tu próximo control con la **${patient.doctorContact.name}**, o evaluar síntomas particulares que estés experimentando?`,
      isAlert: false,
    };
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    // Simula tiempo de procesamiento del asistente inteligente
    setTimeout(() => {
      const responseData = generateAIResponse(text);
      const botMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: responseData.reply,
        timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        isAlert: responseData.isAlert,
        alertType: responseData.alertType,
        suggestedQuestions: SUGGESTED_QUERIES.filter((q) => q !== text).slice(0, 2),
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 700);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] max-h-[850px] space-y-3">
      {/* Cabecera del Asistente */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-sky-600/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-800 dark:text-white">PulmoBot IA</h2>
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Guías GINA/GOLD
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Asistente respiratorio personalizado para {patient.name.split(' ')[0]}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleResetChat}
          className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          title="Reiniciar conversación"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Banner de Descargo de Responsabilidad Médica Obligatorio */}
      <div className="bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 rounded-2xl p-2.5 flex items-start gap-2 text-[11px] text-amber-900 dark:text-amber-300">
        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <p className="leading-snug">
          <strong>Aviso médico:</strong> PulmoBot ofrece educación y orientación basada en guías clínicas. No emite diagnósticos ni modifica prescripciones médicas. En caso de crisis severa, acude a urgencias inmediatamente.
        </p>
      </div>

      {/* Área de Mensajes del Chat */}
      <div className="flex-1 overflow-y-auto space-y-3 p-1 pr-2">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-in fade-in duration-200`}
            >
              <div
                className={`max-w-[88%] rounded-2xl p-3.5 text-xs shadow-sm ${
                  isUser
                    ? 'bg-sky-600 text-white rounded-br-none'
                    : msg.isAlert && msg.alertType === 'danger'
                    ? 'bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-950 dark:text-rose-100 rounded-bl-none'
                    : msg.isAlert && msg.alertType === 'warning'
                    ? 'bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-100 rounded-bl-none'
                    : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-none'
                }`}
              >
                {/* Cabecera del mensaje si es asistente */}
                {!isUser && (
                  <div className="flex items-center gap-1.5 mb-1.5 text-[10px] font-bold text-sky-700 dark:text-sky-400">
                    <Sparkles className="w-3 h-3" />
                    <span>PulmoBot Clínico</span>
                  </div>
                )}

                {/* Texto del mensaje formateado */}
                <div className="space-y-1.5 leading-relaxed whitespace-pre-wrap">
                  {msg.text.split('\n\n').map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>

                {/* Tarjeta de acción de emergencia si se detectó peligro */}
                {msg.isAlert && msg.alertType === 'danger' && (
                  <div className="mt-3 pt-2.5 border-t border-rose-200 dark:border-rose-800 space-y-2">
                    <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-[11px]">
                      <ShieldAlert className="w-4 h-4" />
                      <span>¿Presentas dificultad respiratoria en este momento?</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={onOpenEmergency}
                        className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Ver Plan de Emergencia</span>
                      </button>
                      {patient.emergencyContact?.phone && (
                        <a
                          href={`tel:${patient.emergencyContact.phone.replace(/\s+/g, '')}`}
                          className="px-3 py-2 bg-white dark:bg-slate-700 border border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-300 font-bold rounded-xl text-xs flex items-center gap-1"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          <span>Llamar</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}

                <span
                  className={`block text-[9px] mt-1 text-right ${
                    isUser ? 'text-sky-100' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>

              {/* Preguntas sugeridas que acompañan la respuesta */}
              {!isUser && msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2 pl-1 max-w-[90%]">
                  {msg.suggestedQuestions.map((q, qIdx) => (
                    <button
                      key={qIdx}
                      type="button"
                      onClick={() => handleSendMessage(q)}
                      className="px-2.5 py-1 bg-sky-50 dark:bg-slate-800 hover:bg-sky-100 dark:hover:bg-slate-700 border border-sky-200/60 dark:border-slate-700 text-sky-800 dark:text-sky-300 rounded-xl text-[10px] font-semibold text-left transition-colors flex items-center gap-1"
                    >
                      <Sparkles className="w-2.5 h-2.5 text-sky-600 dark:text-sky-400 shrink-0" />
                      <span>{q}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Indicador de escritura animado */}
        {isTyping && (
          <div className="flex items-center gap-2 p-3 bg-white dark:bg-slate-800 rounded-2xl w-fit border border-slate-100 dark:border-slate-700 text-slate-400 text-xs">
            <Bot className="w-4 h-4 text-sky-600 animate-bounce" />
            <span className="text-[11px] font-medium">PulmoBot está analizando tu consulta...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Preguntas rápidas en carrusel antes del input */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
        {SUGGESTED_QUERIES.map((query, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(query)}
            className="whitespace-nowrap px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-700 dark:text-slate-300 transition-colors shrink-0 shadow-2xs"
          >
            {query}
          </button>
        ))}
      </div>

      {/* Barra de Entrada de Texto */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex gap-2 bg-white dark:bg-slate-800 p-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Escribe tu duda sobre síntomas, inhaladores o clima..."
          className="flex-1 px-3 py-2 text-xs bg-transparent text-slate-800 dark:text-white focus:outline-none placeholder:text-slate-400"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || isTyping}
          className="p-2.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-40 text-white rounded-xl transition-all shadow-sm active:scale-95"
          title="Enviar mensaje"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
