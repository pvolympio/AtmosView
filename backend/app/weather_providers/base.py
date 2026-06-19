from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional

class BaseProvider(ABC):
    @abstractmethod
    async def search_location(self, query: str) -> List[Dict[str, Any]]:
        """
        Search for locations matching the query.
        Returns a list of dicts:
        [{"name": str, "latitude": float, "longitude": float, "state": str, "country": str}]
        """
        pass

    @abstractmethod
    async def get_current_weather(self, lat: float, lon: float) -> Dict[str, Any]:
        """
        Fetch current weather data.
        Returns a dictionary mapping current weather metrics.
        """
        pass

    @abstractmethod
    async def get_forecast(self, lat: float, lon: float) -> Dict[str, Any]:
        """
        Fetch weather forecast (hourly/daily).
        Returns a dictionary mapping forecast arrays.
        """
        pass

    @abstractmethod
    async def get_historical_data(self, lat: float, lon: float, start_date: str, end_date: str, db: Optional[Any] = None) -> List[Dict[str, Any]]:
        """
        Fetch historical weather daily logs between start_date and end_date (YYYY-MM-DD).
        Returns a list of dicts:
        [{"date": "YYYY-MM-DD", "max_temp": float, "min_temp": float, "mean_temp": float, "rain": float, "wind_max": float}]
        """
        pass

    @abstractmethod
    def get_metadata(self) -> Dict[str, Any]:
        """
        Get metadata about this provider.
        Returns details like provider name, description, type, coverage, and limitations.
        """
        pass
