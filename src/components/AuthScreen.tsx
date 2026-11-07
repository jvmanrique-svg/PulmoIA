import React, { useState } from 'react';
import { AuthUser, PatientProfile } from '../types';
import { INITIAL_PATIENT } from '../data/mockData';
import { 
  Activity, 
  User, 
  Mail, 
  Lock, 
  Phone, 
  Globe, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  HeartHandshake,
  Sparkles
} from 'lucide-react';

interface AuthScreenProps {
  onLoginSuccess: (user: AuthUser, initialProfile?: Partial<PatientProfile>) => void;
}

const COUNTRIES = [
  'Argentina',
  'Bolivia',
  'Chile',
  'Colombia',
  'Costa Rica',
  'Cuba',
  'Ecuador',
  'El Salvador',
  'España',
  'Guatemala',
  'Honduras',
  'México',
  'Nicaragua',
  'Panamá',
  'Paraguay',
  'Perú',
  'República Dominicana',
  'Uruguay',
  'Venezuela',
  'Otro país',
];

const RESPIRATORY_CONDITIONS = [
  'Asma Alérgica',
  'Asma No Alérgica',
  'Asma Inducida por Ejercicio',
  'EPOC (Enfermedad Pulmonar Obstructiva Crónica)',
  'Síndrome de Superposición Asma-EPOC (ACOS)',
  'Enfermedad Respiratoria en Evaluación',
];

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupNationality, setSignupNationality] = useState('Argentina');
  const [signupCondition, setSignupCondition] = useState(RESPIRATORY_CONDITIONS[0]);
  const [signupAge, setSignupAge] = useState<number | ''>(28);
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  // Validation errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [successMessage, setSuccessMessage] = useState('');

  const validatePhone = (phone: string): boolean => {
    // Acepta números, espacios, guiones y prefijo '+' con al menos 7 dígitos numéricos
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 7 && digits.length <= 15;
  };

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!loginEmail.trim()) {
      newErrors.loginEmail = 'El correo electrónico es requerido.';
    } else if (!validateEmail(loginEmail)) {
      newErrors.loginEmail = 'Ingresa un correo electrónico con formato válido.';
    }

    if (!loginPassword) {
      newErrors.loginPassword = 'La contraseña es requerida.';
    } else if (loginPassword.length < 6) {
      newErrors.loginPassword = 'La contraseña debe tener al menos 6 caracteres.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    const user: AuthUser = {
      id: `usr-${Date.now()}`,
      name: loginEmail.split('@')[0],
      email: loginEmail,
      token: 'jwt_token_pulmo_' + Math.random().toString(36).substring(2),
    };

    if (rememberMe) {
      localStorage.setItem('pulmo_auth_user', JSON.stringify(user));
    }

    onLoginSuccess(user);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!signupName.trim()) {
      newErrors.signupName = 'El nombre completo es obligatorio.';
    } else if (signupName.trim().length < 3) {
      newErrors.signupName = 'El nombre debe tener al menos 3 caracteres.';
    }

    if (!signupPhone.trim()) {
      newErrors.signupPhone = 'El número de teléfono es obligatorio.';
    } else if (!validatePhone(signupPhone)) {
      newErrors.signupPhone = 'Ingresa un teléfono válido (ej: +54 9 11 4521-8899).';
    }

    if (!signupNationality.trim()) {
      newErrors.signupNationality = 'Por favor selecciona o ingresa tu nacionalidad.';
    }

    if (!signupAge || Number(signupAge) < 1 || Number(signupAge) > 120) {
      newErrors.signupAge = 'Ingresa una edad válida entre 1 y 120 años.';
    }

    if (!signupEmail.trim()) {
      newErrors.signupEmail = 'El correo electrónico es obligatorio.';
    } else if (!validateEmail(signupEmail)) {
      newErrors.signupEmail = 'Ingresa un formato de correo electrónico válido.';
    }

    if (!signupPassword) {
      newErrors.signupPassword = 'Crea una contraseña segura (mínimo 6 caracteres).';
    } else if (signupPassword.length < 6) {
      newErrors.signupPassword = 'La contraseña debe contener al menos 6 caracteres.';
    }

    if (signupPassword !== signupConfirmPassword) {
      newErrors.signupConfirmPassword = 'Las contraseñas ingresadas no coinciden.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setSuccessMessage('¡Cuenta creada con éxito! Configurando tu diario respiratorio...');

    const user: AuthUser = {
      id: `usr-${Date.now()}`,
      name: signupName.trim(),
      email: signupEmail.trim(),
      phone: signupPhone.trim(),
      nationality: signupNationality,
      condition: signupCondition,
      age: Number(signupAge),
      token: 'jwt_token_pulmo_' + Math.random().toString(36).substring(2),
    };

    localStorage.setItem('pulmo_auth_user', JSON.stringify(user));

    setTimeout(() => {
      onLoginSuccess(user, {
        name: signupName.trim(),
        phone: signupPhone.trim(),
        nationality: signupNationality,
        asthmaType: signupCondition,
        age: Number(signupAge),
        email: signupEmail.trim(),
      });
    }, 600);
  };

  const handleDemoLogin = () => {
    const demoUser: AuthUser = {
      id: 'demo-elena',
      name: INITIAL_PATIENT.name,
      email: INITIAL_PATIENT.email || 'elena.morales@saludpulmonar.org',
      phone: INITIAL_PATIENT.phone,
      nationality: INITIAL_PATIENT.nationality,
      condition: INITIAL_PATIENT.asthmaType,
      age: INITIAL_PATIENT.age,
      token: 'demo_token_pulmo',
    };
    localStorage.setItem('pulmo_auth_user', JSON.stringify(demoUser));
    onLoginSuccess(demoUser, INITIAL_PATIENT);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Cabecera con marca PulmoIA */}
        <div className="bg-gradient-to-br from-sky-600 via-teal-600 to-sky-700 p-6 text-white text-center relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl font-black tracking-tight">PulmoIA</h1>
            <span className="text-[10px] font-bold uppercase bg-white/20 px-2 py-0.5 rounded-full">
              Salud Respiratoria
            </span>
          </div>
          <p className="text-xs text-sky-100 mt-1 max-w-xs mx-auto">
            Diario digital de seguimiento y educación para pacientes con Asma y EPOC
          </p>
        </div>

        {/* Pestañas Login vs Signup */}
        <div className="grid grid-cols-2 p-2 bg-slate-100/80 m-4 rounded-2xl">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setErrors({});
            }}
            className={`py-2.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'login'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('signup');
              setErrors({});
            }}
            className={`py-2.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'signup'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Registrar Paciente
          </button>
        </div>

        {/* Mensaje de éxito transitorio */}
        {successMessage && (
          <div className="mx-5 mb-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Formulario de Iniciar Sesión */}
        {activeTab === 'login' && (
          <form onSubmit={handleLogin} className="p-5 pt-1 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="ejemplo@paciente.com"
                  className={`w-full pl-10 pr-3 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 ${
                    errors.loginEmail
                      ? 'border-rose-300 ring-rose-100'
                      : 'border-slate-200 focus:ring-sky-100 focus:border-sky-500'
                  }`}
                />
              </div>
              {errors.loginEmail && (
                <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.loginEmail}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-3 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 ${
                    errors.loginPassword
                      ? 'border-rose-300 ring-rose-100'
                      : 'border-slate-200 focus:ring-sky-100 focus:border-sky-500'
                  }`}
                />
              </div>
              {errors.loginPassword && (
                <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.loginPassword}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-sky-600 focus:ring-sky-500 w-4 h-4"
                />
                <span>Recordar mi sesión</span>
              </label>
              <button
                type="button"
                onClick={() => alert('Para restablecer contraseña, contacta a tu centro de salud o soporte.')}
                className="text-sky-600 hover:underline font-medium"
              >
                ¿Olvidaste tu clave?
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-sky-600/20 active:scale-[0.99] transition-all"
            >
              <span>Acceder a mi Diario</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Acceso Demostración Rápido */}
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleDemoLogin}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Ingresar como Paciente Demo (Elena Morales)</span>
              </button>
            </div>
          </form>
        )}

        {/* Formulario de Registro de Nuevo Paciente */}
        {activeTab === 'signup' && (
          <form onSubmit={handleSignup} className="p-5 pt-1 space-y-3.5 max-h-[75vh] overflow-y-auto">
            {/* Nombre Completo */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nombre y Apellidos <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  placeholder="Ej: Sofía Ramírez"
                  className={`w-full pl-10 pr-3 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 ${
                    errors.signupName
                      ? 'border-rose-300 ring-rose-100'
                      : 'border-slate-200 focus:ring-sky-100 focus:border-sky-500'
                  }`}
                />
              </div>
              {errors.signupName && (
                <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.signupName}
                </p>
              )}
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Teléfono de Contacto <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  value={signupPhone}
                  onChange={(e) => setSignupPhone(e.target.value)}
                  placeholder="+54 9 11 4521-8899"
                  className={`w-full pl-10 pr-3 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 ${
                    errors.signupPhone
                      ? 'border-rose-300 ring-rose-100'
                      : 'border-slate-200 focus:ring-sky-100 focus:border-sky-500'
                  }`}
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Se utilizará en caso de alertas de emergencia.</p>
              {errors.signupPhone && (
                <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.signupPhone}
                </p>
              )}
            </div>

            {/* Nacionalidad y Edad */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nacionalidad <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <select
                    value={signupNationality}
                    onChange={(e) => setSignupNationality(e.target.value)}
                    className="w-full pl-9 pr-2 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-sky-100"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Edad (años) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={signupAge}
                  onChange={(e) => setSignupAge(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-sky-100"
                />
                {errors.signupAge && (
                  <p className="text-[10px] text-rose-600 mt-1">{errors.signupAge}</p>
                )}
              </div>
            </div>

            {/* Condición Respiratoria */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Condición / Diagnóstico Respiratorio
              </label>
              <select
                value={signupCondition}
                onChange={(e) => setSignupCondition(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-sky-100"
              >
                {RESPIRATORY_CONDITIONS.map((cond) => (
                  <option key={cond} value={cond}>
                    {cond}
                  </option>
                ))}
              </select>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Correo Electrónico <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="paciente@correo.com"
                  className={`w-full pl-10 pr-3 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 ${
                    errors.signupEmail
                      ? 'border-rose-300 ring-rose-100'
                      : 'border-slate-200 focus:ring-sky-100 focus:border-sky-500'
                  }`}
                />
              </div>
              {errors.signupEmail && (
                <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.signupEmail}
                </p>
              )}
            </div>

            {/* Contraseñas */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contraseña <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="Min. 6 carácteres"
                  className={`w-full px-3 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 ${
                    errors.signupPassword
                      ? 'border-rose-300 ring-rose-100'
                      : 'border-slate-200 focus:ring-sky-100'
                  }`}
                />
                {errors.signupPassword && (
                  <p className="text-[10px] text-rose-600 mt-1">{errors.signupPassword}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirmar <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  value={signupConfirmPassword}
                  onChange={(e) => setSignupConfirmPassword(e.target.value)}
                  placeholder="Repetir clave"
                  className={`w-full px-3 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 ${
                    errors.signupConfirmPassword
                      ? 'border-rose-300 ring-rose-100'
                      : 'border-slate-200 focus:ring-sky-100'
                  }`}
                />
                {errors.signupConfirmPassword && (
                  <p className="text-[10px] text-rose-600 mt-1">{errors.signupConfirmPassword}</p>
                )}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-[0.99] transition-all"
              >
                <HeartHandshake className="w-4 h-4" />
                <span>Registrar Paciente y Comenzar</span>
              </button>
            </div>
          </form>
        )}
      </div>

      <p className="text-[11px] text-slate-400 mt-4 text-center max-w-sm">
        🔒 Tus datos clínicos se procesan de forma privada y segura en tu dispositivo.
      </p>
    </div>
  );
};
