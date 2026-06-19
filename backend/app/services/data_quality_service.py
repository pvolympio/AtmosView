from datetime import datetime, timedelta
from typing import List, Dict, Any

class DataQualityService:
    def evaluate_dataset(self, records: List[Dict[str, Any]], start_date: str, end_date: str, source_name: str) -> Dict[str, Any]:
        """
        Evaluates the quality of a daily meteorological dataset.
        Checks for missing fields, temporal gaps, and extreme suspect anomalies.
        Returns a structured report and quality grade ("Boa", "Parcial", "Fraca").
        """
        if not records:
            return {
                "missing_data_count": 0,
                "extreme_values_count": 0,
                "temporal_gaps": 0,
                "completeness_percentage": 0.0,
                "quality_grade": "Fraca",
                "report_data": {
                    "details": "Nenhum dado retornado para a fonte.",
                    "missing_dates": []
                }
            }

        # 1. Parse dates to calculate expected sequence
        try:
            start_dt = datetime.strptime(start_date, "%Y-%m-%d")
            end_dt = datetime.strptime(end_date, "%Y-%m-%d")
        except ValueError:
            start_dt = datetime.now()
            end_dt = datetime.now()

        expected_days = (end_dt - start_dt).days + 1
        
        # Map existing records by date
        record_map = {r["date"]: r for r in records if "date" in r}
        
        # 2. Detect missing dates (temporal gaps)
        missing_dates = []
        for i in range(expected_days):
            day_str = (start_dt + timedelta(days=i)).strftime("%Y-%m-%d")
            if day_str not in record_map:
                missing_dates.append(day_str)
        
        temporal_gaps = len(missing_dates)

        # 3. Analyze missing fields and extreme suspect outliers
        missing_data_count = 0
        extreme_values_count = 0
        critical_fields = ["max_temp", "min_temp", "mean_temp", "rain", "wind_max"]
        
        for r in records:
            for field in critical_fields:
                if r.get(field) is None:
                    missing_data_count += 1
            
            max_t = r.get("max_temp")
            min_t = r.get("min_temp")
            mean_t = r.get("mean_temp")
            rain = r.get("rain")
            wind = r.get("wind_max")
            
            # Anomalies checks
            if max_t is not None and (max_t < -10.0 or max_t > 50.0):
                extreme_values_count += 1
            if min_t is not None and (min_t < -10.0 or min_t > 50.0):
                extreme_values_count += 1
            if mean_t is not None and (mean_t < -10.0 or mean_t > 50.0):
                extreme_values_count += 1
            if rain is not None and (rain < 0.0 or rain > 300.0):
                extreme_values_count += 1
            if wind is not None and (wind < 0.0 or wind > 200.0):
                extreme_values_count += 1

        # 4. Completeness percentage (Days with ALL critical fields populated)
        complete_days = 0
        for r in records:
            if all(r.get(f) is not None for f in critical_fields):
                complete_days += 1
                
        completeness = (complete_days / expected_days) * 100 if expected_days > 0 else 0.0
        completeness = max(0.0, min(100.0, completeness))

        # 5. Classify quality grade
        # "Boa": >= 90% completeness, 0 outliers, 0 gaps
        # "Parcial": >= 50% completeness, <= 5% outliers
        # "Fraca": otherwise
        outlier_ratio = (extreme_values_count / (len(records) * len(critical_fields))) if records else 0.0
        
        if completeness >= 90.0 and extreme_values_count == 0 and temporal_gaps == 0:
            quality_grade = "Boa"
        elif completeness >= 50.0 and outlier_ratio <= 0.05:
            quality_grade = "Parcial"
        else:
            quality_grade = "Fraca"

        return {
            "missing_data_count": missing_data_count,
            "extreme_values_count": extreme_values_count,
            "temporal_gaps": temporal_gaps,
            "completeness_percentage": round(completeness, 2),
            "quality_grade": quality_grade,
            "report_data": {
                "source_name": source_name,
                "expected_days": expected_days,
                "actual_days": len(records),
                "complete_days": complete_days,
                "missing_dates": missing_dates,
                "evaluated_at": datetime.now().isoformat()
            }
        }

data_quality_service = DataQualityService()
