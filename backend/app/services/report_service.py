class ReportService:
    def generate_summary(
        self,
        city_name: str,
        temperature: float,
        apparent_temperature: float,
        humidity: float,
        wind_speed: float,
        risk_level: str
    ) -> str:
        """
        Generates a natural-language description of the current weather and risk.
        Example: "Hoje em Itajubá, a temperatura atual é de 24°C, com sensação térmica de 25°C..."
        """
        # Convert risk level to lowercase for a smoother reading in the text
        risk_lower = risk_level.lower()
        
        return (
            f"Hoje em {city_name}, a temperatura atual é de {temperature:.0f}°C, "
            f"com sensação térmica de {apparent_temperature:.0f}°C. "
            f"A umidade está em {humidity:.0f}%, o vento atinge {wind_speed:.0f} km/h "
            f"e o risco climático foi classificado como {risk_lower}."
        )

report_service = ReportService()
