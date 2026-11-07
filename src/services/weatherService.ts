import { EnvironmentalData, RespiratoryAlert } from '../types';

/**
 * Determina el nivel cualitativo del Índice de Calidad del Aire (ICA/AQI)
 */
export function getAQILevel(aqi: number): 'Excelente' | 'Aceptable' | 'Moderada' | 'Dañina' | 'Muy Dañina' {
  if (aqi <= 50) return 'Excelente';
  if (aqi <= 100) return 'Aceptable';
  if (aqi <= 150) return 'Moderada';
  if (aqi <= 200) return 'Dañina';
  return 'Muy Dañina';
}

/**
 * Determina el nivel cualitativo del Índice UV
 */
export function getUVLevel(uv: number): 'Bajo' | 'Moderado' | 'Alto' | 'Muy Alto' | 'Extremo' {
  if (uv < 3) return 'Bajo';
  if (uv < 6) return 'Moderado';
  if (uv < 8) return 'Alto';
  if (uv < 11) return 'Muy Alto';
  return 'Extremo';
}

/**
 * Genera alertas respiratorias clínicas específicas para pacientes con Asma y EPOC
 * en base a parámetros meteorológicos y calidad ambiental.
 */
export function generateRespiratoryAlerts(
  humidity: number,
  aqi: number,
  uvIndex: number,
  temperature: number
): RespiratoryAlert[] {
  const alerts: RespiratoryAlert[] = [];

  // 1. Alertas de Humedad (Asma y EPOC)
  if (humidity > 70) {
    alerts.push({
      id: 'alert-humidity-high',
      type: 'humidity',
      severity: 'warning',
      title: 'Humedad Ambiental Elevada (> 70%)',
      message:
        'El exceso de humedad favorece la proliferación de ácaros y moho, y hace el aire más denso. Puede causar opresión torácica y sibilancias en Asma y EPOC.',
      targetCondition: 'Ambos',
      badge: 'Alerta Humedad Alta',
    });
  } else if (humidity < 35) {
    alerts.push({
      id: 'alert-humidity-low',
      type: 'humidity',
      severity: 'warning',
      title: 'Aire Demasiado Seco (< 35%)',
      message:
        'El aire seco deshidrata la mucosa bronquial, facilitando crisis de tos irritativa y broncoespasmo reflejo. Mantente bien hidratado.',
      targetCondition: 'Ambos',
      badge: 'Alerta Aire Seco',
    });
  }

  // 2. Alertas de Calidad del Aire (AQI)
  if (aqi > 150) {
    alerts.push({
      id: 'alert-aqi-danger',
      type: 'aqi',
      severity: 'danger',
      title: 'Calidad del Aire Dañina (ICA Crítico)',
      message:
        'Nivel perjudicial para vías respiratorias. Evita actividades físicas en el exterior, mantén ventanas cerradas y ten a mano el inhalador de rescate.',
      targetCondition: 'Ambos',
      badge: 'Alerta Roja AQI',
    });
  } else if (aqi > 100) {
    alerts.push({
      id: 'alert-aqi-warning',
      type: 'aqi',
      severity: 'warning',
      title: 'Calidad Dañina para Grupos Sensibles',
      message:
        'Pacientes con asma o EPOC tienen alto riesgo de presentar tos o disnea al aire libre. Reduce la permanencia exterior.',
      targetCondition: 'Ambos',
      badge: 'Precaución AQI',
    });
  } else if (aqi > 50) {
    alerts.push({
      id: 'alert-aqi-moderate',
      type: 'aqi',
      severity: 'info',
      title: 'Calidad de Aire Aceptable / Moderada',
      message:
        'Condiciones aceptables, pero pacientes con reactividad bronquial severa deben vigilar posibles molestias en zonas de alto tráfico vehicular.',
      targetCondition: 'Asma',
      badge: 'Aviso AQI',
    });
  }

  // 3. Alertas de Radiación UV y Ozono Troposférico
  if (uvIndex >= 8) {
    alerts.push({
      id: 'alert-uv-extreme',
      type: 'uv',
      severity: 'danger',
      title: 'Radiación UV Muy Alta / Extrema (UV 8+)',
      message:
        'La intensa radiación solar cataliza la formación de ozono troposférico a nivel del suelo, un gas altamente irritante que desencadena crisis agudas de asma y EPOC.',
      targetCondition: 'Ambos',
      badge: 'Riesgo Ozono / UV',
    });
  } else if (uvIndex >= 6) {
    alerts.push({
      id: 'alert-uv-high',
      type: 'uv',
      severity: 'warning',
      title: 'Índice UV Elevado (UV 6 - 7)',
      message:
        'Mayor formación fotoquímica de oxidantes atmosféricos en horas centrales. Se recomienda limitar el esfuerzo al aire libre entre 11:00 y 16:00.',
      targetCondition: 'Asma',
      badge: 'Precaución UV',
    });
  }

  // 4. Alerta de Temperatura Extrema si aplica
  if (temperature <= 8) {
    alerts.push({
      id: 'alert-temp-cold',
      type: 'temperature',
      severity: 'warning',
      title: 'Ambiente Frío (≤ 8°C)',
      message:
        'La inhalación directa de aire frío es un potente desencadenante de broncoconstricción. Cubre nariz y boca con bufanda o mascarilla al salir.',
      targetCondition: 'Ambos',
      badge: 'Precaución Frío',
    });
  } else if (temperature >= 32) {
    alerts.push({
      id: 'alert-temp-heat',
      type: 'temperature',
      severity: 'warning',
      title: 'Ola de Calor (≥ 32°C)',
      message:
        'El calor sofocante incrementa la demanda ventilatoria y la fatiga diafragmática en pacientes con EPOC. Permanece en lugares templados y ventilados.',
      targetCondition: 'EPOC',
      badge: 'Aviso Calor',
    });
  }

  return alerts;
}

/**
 * Consulta de clima vía OpenWeatherMap si se provee API Key
 */
async function fetchFromOpenWeatherMap(
  query: { city?: string; lat?: number; lon?: number },
  apiKey: string
): Promise<EnvironmentalData | null> {
  try {
    const weatherUrl = query.city
      ? `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(query.city)}&units=metric&lang=es&appid=${apiKey}`
      : `https://api.openweathermap.org/data/2.5/weather?lat=${query.lat}&lon=${query.lon}&units=metric&lang=es&appid=${apiKey}`;

    const res = await fetch(weatherUrl);
    if (!res.ok) return null;
    const data = await res.json();

    const temp = Math.round(data.main?.temp ?? 20);
    const humidity = Math.round(data.main?.humidity ?? 50);
    const lat = data.coord?.lat;
    const lon = data.coord?.lon;
    const city = `${data.name}${data.sys?.country ? ', ' + data.sys.country : ''}`;

    // Consultar calidad del aire OWM
    let aqi = 45;
    if (lat && lon) {
      try {
        const airRes = await fetch(
          `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`
        );
        if (airRes.ok) {
          const airData = await airRes.json();
          // OWM air index va de 1 a 5, convertimos a escala AQI estimada
          const owmAqi = airData.list?.[0]?.main?.aqi ?? 2;
          const aqiMap: Record<number, number> = { 1: 30, 2: 65, 3: 110, 4: 160, 5: 220 };
          aqi = aqiMap[owmAqi] || 50;
        }
      } catch {
        // Fallback aqi
      }
    }

    const uvIndex = 4.5;
    const aqiLevel = getAQILevel(aqi);
    const uvLevel = getUVLevel(uvIndex);
    const alerts = generateRespiratoryAlerts(humidity, aqi, uvIndex, temp);

    return {
      city,
      temperature: temp,
      humidity,
      aqi,
      aqiLevel,
      uvIndex,
      uvLevel,
      pollenLevel: humidity > 60 ? 'Alto' : 'Moderado',
      recommendation:
        alerts.length > 0
          ? alerts[0].message
          : 'Condiciones meteorológicas estables para respiración.',
      alerts,
      latitude: lat,
      longitude: lon,
      lastUpdated: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      isCustomKey: true,
    };
  } catch (err) {
    console.warn('Error en OpenWeatherMap API:', err);
    return null;
  }
}

/**
 * Consulta de clima en tiempo real abierta (Open-Meteo) sin requerir API key comercial
 */
export async function fetchLiveWeatherByCity(
  cityName: string,
  openWeatherApiKey?: string
): Promise<EnvironmentalData> {
  const cleanCity = cityName.trim();
  if (!cleanCity) {
    throw new Error('Debes ingresar el nombre de una ciudad.');
  }

  // 1. Si el usuario configuró una clave de OpenWeatherMap, intentar primero
  const savedKey = openWeatherApiKey || localStorage.getItem('pulmo_owm_key');
  if (savedKey) {
    const owmResult = await fetchFromOpenWeatherMap({ city: cleanCity }, savedKey);
    if (owmResult) return owmResult;
  }

  // 2. Consulta con Open-Meteo Geocoding y Forecast (gratuito, sin registro, alta precisión)
  try {
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cleanCity)}&count=1&language=es&format=json`
    );
    if (!geoRes.ok) throw new Error('No se pudo conectar con el servicio de geolocalización');
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      throw new Error(`Ciudad "${cleanCity}" no encontrada. Prueba con otra ciudad cercana.`);
    }

    const loc = geoData.results[0];
    const lat = loc.latitude;
    const lon = loc.longitude;
    const formattedCity = `${loc.name}${loc.country ? ', ' + loc.country : ''}`;

    // Obtener clima y UV actual
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,uv_index&timezone=auto`
    );
    if (!weatherRes.ok) throw new Error('Error al consultar datos de clima');
    const weatherData = await weatherRes.json();

    const temp = Math.round(weatherData.current?.temperature_2m ?? 20);
    const humidity = Math.round(weatherData.current?.relative_humidity_2m ?? 50);
    const uvIndex = Math.round((weatherData.current?.uv_index ?? 3.5) * 10) / 10;

    // Obtener calidad de aire actual (AQI)
    let aqi = 40;
    try {
      const airRes = await fetch(
        `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi&timezone=auto`
      );
      if (airRes.ok) {
        const airData = await airRes.json();
        aqi = Math.round(airData.current?.us_aqi ?? 40);
      }
    } catch {
      // AQI fallback
    }

    const aqiLevel = getAQILevel(aqi);
    const uvLevel = getUVLevel(uvIndex);
    const alerts = generateRespiratoryAlerts(humidity, aqi, uvIndex, temp);

    let pollenLevel: 'Bajo' | 'Moderado' | 'Alto' = 'Bajo';
    if (humidity > 65 || temp > 25) pollenLevel = 'Moderado';
    if (humidity > 75 && temp > 22) pollenLevel = 'Alto';

    let recommendation = 'Condiciones ambientales favorables para el aparato respiratorio.';
    if (alerts.length > 0) {
      recommendation = alerts[0].title + ': ' + alerts[0].message;
    }

    return {
      city: formattedCity,
      country: loc.country,
      latitude: lat,
      longitude: lon,
      temperature: temp,
      humidity,
      aqi,
      aqiLevel,
      uvIndex,
      uvLevel,
      pollenLevel,
      recommendation,
      alerts,
      lastUpdated: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      isCustomKey: false,
    };
  } catch (err: any) {
    console.error('Error obteniendo clima en vivo:', err);
    throw err;
  }
}

/**
 * Consulta de clima mediante coordenadas GPS
 */
export async function fetchLiveWeatherByCoords(
  lat: number,
  lon: number,
  openWeatherApiKey?: string
): Promise<EnvironmentalData> {
  const savedKey = openWeatherApiKey || localStorage.getItem('pulmo_owm_key');
  if (savedKey) {
    const owmResult = await fetchFromOpenWeatherMap({ lat, lon }, savedKey);
    if (owmResult) return owmResult;
  }

  try {
    // Reverse Geocoding con Open-Meteo o Nominatim
    let detectedCity = 'Mi Ubicación Actual';
    try {
      const revRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`
      );
      if (revRes.ok) {
        const revData = await revRes.json();
        const city = revData.address?.city || revData.address?.town || revData.address?.county || revData.address?.state;
        const country = revData.address?.country;
        if (city) {
          detectedCity = `${city}${country ? ', ' + country : ''}`;
        }
      }
    } catch {
      // Ignorar si el reverse geocoding falla
    }

    // Datos de temperatura, humedad y UV
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,uv_index&timezone=auto`
    );
    const weatherData = await weatherRes.json();

    const temp = Math.round(weatherData.current?.temperature_2m ?? 21);
    const humidity = Math.round(weatherData.current?.relative_humidity_2m ?? 55);
    const uvIndex = Math.round((weatherData.current?.uv_index ?? 4) * 10) / 10;

    let aqi = 42;
    try {
      const airRes = await fetch(
        `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi&timezone=auto`
      );
      if (airRes.ok) {
        const airData = await airRes.json();
        aqi = Math.round(airData.current?.us_aqi ?? 42);
      }
    } catch {
      // aqi fallback
    }

    const aqiLevel = getAQILevel(aqi);
    const uvLevel = getUVLevel(uvIndex);
    const alerts = generateRespiratoryAlerts(humidity, aqi, uvIndex, temp);

    return {
      city: detectedCity,
      latitude: lat,
      longitude: lon,
      temperature: temp,
      humidity,
      aqi,
      aqiLevel,
      uvIndex,
      uvLevel,
      pollenLevel: humidity > 65 ? 'Alto' : 'Moderado',
      recommendation:
        alerts.length > 0
          ? alerts[0].title + ': ' + alerts[0].message
          : 'Condiciones óptimas según tu sensor de ubicación.',
      alerts,
      lastUpdated: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      isCustomKey: false,
    };
  } catch (err: any) {
    console.error('Error al consultar por GPS:', err);
    throw err;
  }
}
