from app.weather_providers.base import BaseProvider
from app.weather_providers.open_meteo import OpenMeteoProvider
from app.weather_providers.nasa_power import NasaPowerProvider
from app.weather_providers.inmet import InmetProvider
from app.weather_providers.mock import MockProvider

# Provedores cadastrados
providers = {
    "open_meteo": OpenMeteoProvider(),
    "nasa_power": NasaPowerProvider(),
    "inmet": InmetProvider(),
    "mock": MockProvider()
}

def get_provider(provider_id: str) -> BaseProvider:
    if provider_id not in providers:
        raise ValueError(f"Provedor meteorológico '{provider_id}' desconhecido ou não cadastrado.")
    return providers[provider_id]
