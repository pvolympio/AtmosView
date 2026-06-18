from typing import List, Dict, Any
from app.schemas import HistoricalStats, TrendAnalysis

class HistoricalReportService:
    def calculate_stats(
        self,
        times: List[str],
        max_temps: List[float],
        min_temps: List[float],
        mean_temps: List[float],
        precipitation: List[float]
    ) -> Dict[str, Any]:
        """Calculates climate averages and extreme indexes for a historical series"""
        N = len(times)
        if N == 0:
            return {}

        avg_temp = sum(mean_temps) / N
        
        # Max temp with date
        max_temp = max(max_temps)
        max_temp_idx = max_temps.index(max_temp)
        max_temp_date = times[max_temp_idx]

        # Min temp with date
        min_temp = min(min_temps)
        min_temp_idx = min_temps.index(min_temp)
        min_temp_date = times[min_temp_idx]

        # Rain totals
        total_rain = sum(precipitation)
        avg_rain = total_rain / N
        max_rain = max(precipitation)
        max_rain_idx = precipitation.index(max_rain)
        max_rain_date = times[max_rain_idx]

        # Counters
        days_no_rain = sum(1 for r in precipitation if r < 0.1)
        days_relevant_rain = sum(1 for r in precipitation if r >= 2.0)
        days_hot = sum(1 for t in max_temps if t > 32.0)

        return {
            "avg_temp": round(avg_temp, 1),
            "max_temp": round(max_temp, 1),
            "max_temp_date": max_temp_date,
            "min_temp": round(min_temp, 1),
            "min_temp_date": min_temp_date,
            "total_rain": round(total_rain, 1),
            "avg_rain": round(avg_rain, 2),
            "max_rain": round(max_rain, 1),
            "max_rain_date": max_rain_date,
            "days_no_rain": days_no_rain,
            "days_relevant_rain": days_relevant_rain,
            "days_hot": days_hot
        }

    def calculate_trend(self, mean_temps: List[float]) -> Dict[str, Any]:
        """
        Calculates simple linear regression slope manually (O(N) time, zero dependencies).
        y = mx + c
        """
        N = len(mean_temps)
        if N < 2:
            return {"slope": 0.0, "interpretation": "tendência estável"}

        x = list(range(N))
        y = mean_temps

        sum_x = sum(x)
        sum_y = sum(y)
        sum_xx = sum(xi * xi for xi in x)
        sum_xy = sum(x[i] * y[i] for i in range(N))

        denominator = N * sum_xx - sum_x * sum_x
        if denominator == 0:
            return {"slope": 0.0, "interpretation": "tendência estável"}

        slope = (N * sum_xy - sum_x * sum_y) / denominator

        # Interpretation based on slope threshold per day
        # e.g., 0.001 C increase per day corresponds to ~0.36 C increase per year
        if slope > 0.001:
            interpretation = "tendência de aquecimento"
        elif slope < -0.001:
            interpretation = "tendência de resfriamento"
        else:
            interpretation = "tendência estável"

        return {
            "slope": round(slope, 5),
            "interpretation": interpretation
        }

    def generate_summary(
        self,
        city_name: str,
        start_date: str,
        end_date: str,
        stats: Dict[str, Any],
        trend: Dict[str, Any]
    ) -> str:
        """Generates textual description summary for historical range"""
        # Format dates simply (e.g. 2015-01-01 -> 2015)
        start_year = start_date.split('-')[0]
        end_year = end_date.split('-')[0]
        
        # Build trend textual reading
        trend_desc = {
            "tendência de aquecimento": "indica leve aumento na temperatura média",
            "tendência de resfriamento": "indica declínio gradual na temperatura média",
            "tendência estável": "indica estabilidade nas temperaturas médias"
        }.get(trend["interpretation"], "indica padrão estável")
        
        return (
            f"No período de {start_year} a {end_year}, a cidade de {city_name} apresentou "
            f"temperatura média de {stats['avg_temp']}°C, com pico de {stats['max_temp']}°C "
            f"(registrado em {stats['max_temp_date']}). O total acumulado de precipitação foi de "
            f"{stats['total_rain']} mm. A análise linear de tendência {trend_desc} ao longo do período."
        )

historical_report_service = HistoricalReportService()
