from typing import List
from app.schemas import RiskAssessment

class RiskService:
    def calculate_risk(
        self,
        temperature: float,
        humidity: float,
        wind_speed: float,
        precipitation: float,
        pressure: float
    ) -> RiskAssessment:
        score = 0.0
        motivos = []
        recomendacoes = []

        # 1. Temperatura Alta (Máximo 3 pontos)
        if temperature > 38.0:
            score += 3.0
            motivos.append(f"Calor extremo detectado ({temperature:.1f}°C).")
            recomendacoes.append("Evite exposição direta ao sol, hidrate-se continuamente e busque locais refrigerados.")
        elif temperature > 35.0:
            score += 2.0
            motivos.append(f"Temperatura muito elevada ({temperature:.1f}°C).")
            recomendacoes.append("Aumente a ingestão de água, use protetor solar e evite atividades físicas intensas nas horas mais quentes.")
        elif temperature > 32.0:
            score += 1.0
            motivos.append(f"Temperatura quente acima da média ({temperature:.1f}°C).")
            recomendacoes.append("Mantenha-se hidratado e dê preferência a roupas leves.")

        # 2. Umidade Baixa (Máximo 3 pontos)
        if humidity < 20.0:
            score += 3.0
            motivos.append(f"Umidade relativa do ar extremamente baixa ({humidity:.0f}%).")
            recomendacoes.append("Evite exercícios físicos ao ar livre entre 10h e 17h, utilize umidificadores de ar e hidrate a pele/olhos.")
        elif humidity < 30.0:
            score += 2.0
            motivos.append(f"Umidade do ar baixa com nível de atenção ({humidity:.0f}%).")
            recomendacoes.append("Beba bastante líquido, umedeça os ambientes e evite aglomerações em locais fechados.")
        elif humidity < 40.0:
            score += 1.0
            motivos.append(f"Umidade ligeiramente reduzida ({humidity:.0f}%).")
            recomendacoes.append("Mantenha a hidratação básica em dia.")

        # 3. Chuva Forte (Máximo 3 pontos)
        if precipitation > 10.0:
            score += 3.0
            motivos.append(f"Chuva torrencial ativa ({precipitation:.1f} mm/h).")
            recomendacoes.append("Risco crítico de alagamentos e deslizamentos. Evite transitar por vias alagadas e encostas. Procure abrigo seguro.")
        elif precipitation > 5.0:
            score += 2.0
            motivos.append(f"Chuva moderada a forte ativa ({precipitation:.1f} mm/h).")
            recomendacoes.append("Atenção redobrada no trânsito e em vias com histórico de inundações.")
        elif precipitation > 2.0:
            score += 1.0
            motivos.append(f"Chuva leve ativa ({precipitation:.1f} mm/h).")
            recomendacoes.append("Tenha cuidado em pistas escorregadias.")

        # 4. Vento Forte (Máximo 3 pontos)
        if wind_speed > 60.0:
            score += 3.0
            motivos.append(f"Ventos com força de vendaval ({wind_speed:.1f} km/h).")
            recomendacoes.append("Risco alto de quedas de árvores e fiação. Permaneça em local seguro e feche bem as janelas.")
        elif wind_speed > 40.0:
            score += 2.0
            motivos.append(f"Ventos fortes e rajadas ({wind_speed:.1f} km/h).")
            recomendacoes.append("Evite ficar próximo a painéis publicitários, árvores ou estruturas metálicas soltas.")
        elif wind_speed > 25.0:
            score += 1.0
            motivos.append(f"Vento moderado a forte ({wind_speed:.1f} km/h).")
            recomendacoes.append("Mantenha objetos soltos em sacadas bem fixados.")

        # 5. Pressão Atmosférica Reduzida (Máximo 2 pontos)
        # Nível médio padrão ao nível do mar é 1013 hPa
        if pressure < 1000.0:
            score += 2.0
            motivos.append(f"Pressão atmosférica extremamente baixa ({pressure:.1f} hPa).")
            recomendacoes.append("Forte indício de tempestades severas e rápidas transições meteorológicas. Acompanhe alertas oficiais.")
        elif pressure < 1008.0:
            score += 1.0
            motivos.append(f"Pressão atmosférica reduzida ({pressure:.1f} hPa).")
            recomendacoes.append("Instabilidade na atmosfera, possibilidade de chuvas repentinas.")

        # Limitar score final ao teto de 10
        score = min(score, 10.0)

        # Classificação de níveis de acordo com a regra da V1
        if score <= 2.0:
            nivel = "Baixo"
            if not motivos:
                motivos.append("Sem anomalias atmosféricas.")
                recomendacoes.append("Condições climáticas seguras e confortáveis. Aproveite o dia ao ar livre!")
        elif score <= 5.0:
            nivel = "Moderado"
        elif score <= 8.0:
            nivel = "Alto"
        else:
            nivel = "Crítico"

        return RiskAssessment(
            score=round(score, 1),
            nivel=nivel,
            motivos=motivos,
            recomendacoes=recomendacoes
        )

risk_service = RiskService()
