import { 
  Sun, SunDim, CloudSun, Cloud, CloudFog, CloudDrizzle, 
  CloudRain, CloudLightning 
} from 'lucide-react';

export const getWeatherCondition = (code) => {
  const codes = {
    0: { text: "Céu Limpo", icon: Sun, color: "text-amber-400" },
    1: { text: "Predominantemente Limpo", icon: SunDim, color: "text-amber-300" },
    2: { text: "Parcialmente Nublado", icon: CloudSun, color: "text-slate-300" },
    3: { text: "Encoberto", icon: Cloud, color: "text-slate-400" },
    45: { text: "Nevoeiro", icon: CloudFog, color: "text-slate-400" },
    48: { text: "Nevoeiro com Depósito", icon: CloudFog, color: "text-slate-500" },
    51: { text: "Garoa Leve", icon: CloudDrizzle, color: "text-sky-300" },
    53: { text: "Garoa Moderada", icon: CloudDrizzle, color: "text-sky-400" },
    55: { text: "Garoa Densa", icon: CloudDrizzle, color: "text-sky-500" },
    61: { text: "Chuva Fraca", icon: CloudRain, color: "text-blue-400" },
    63: { text: "Chuva Moderada", icon: CloudRain, color: "text-blue-500" },
    65: { text: "Chuva Forte", icon: CloudRain, color: "text-blue-600" },
    80: { text: "Pancadas de Chuva Leves", icon: CloudRain, color: "text-indigo-400" },
    81: { text: "Pancadas de Chuva Fortes", icon: CloudRain, color: "text-indigo-500" },
    82: { text: "Pancadas de Chuva Violentas", icon: CloudRain, color: "text-indigo-600" },
    95: { text: "Tempestade", icon: CloudLightning, color: "text-violet-400" },
    96: { text: "Tempestade com Granizo Leve", icon: CloudLightning, color: "text-violet-500" },
    99: { text: "Tempestade Severa com Granizo", icon: CloudLightning, color: "text-red-500" }
  };
  return codes[code] || { text: "Desconhecido", icon: Cloud, color: "text-slate-400" };
};
