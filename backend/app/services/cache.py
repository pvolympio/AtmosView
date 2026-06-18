import json
import logging
from typing import Optional, Any
import redis
from app.config import settings

logger = logging.getLogger(__name__)

class CacheService:
    def __init__(self):
        self.redis_client = None
        self.is_disabled = False
        try:
            self.redis_client = redis.Redis.from_url(
                settings.REDIS_URL, 
                socket_connect_timeout=2,
                decode_responses=True
            )
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {e}")
            self.is_disabled = True

    def get(self, key: str) -> Optional[Any]:
        if self.is_disabled or not self.redis_client:
            return None
        try:
            data = self.redis_client.get(key)
            return json.loads(data) if data else None
        except redis.exceptions.ConnectionError as ce:
            logger.warning(f"Redis offline ou inacessível. Desativando cache temporariamente: {ce}")
            self.is_disabled = True
            return None
        except Exception as e:
            logger.warning(f"Error fetching from Redis cache: {e}")
            return None

    def set(self, key: str, value: Any, ttl: int = 1800) -> bool:
        """Sets a key in Redis. TTL defaults to 1800 seconds (30 minutes)"""
        if self.is_disabled or not self.redis_client:
            return False
        try:
            self.redis_client.setex(key, ttl, json.dumps(value))
            return True
        except redis.exceptions.ConnectionError as ce:
            logger.warning(f"Redis offline ou inacessível ao gravar. Desativando cache: {ce}")
            self.is_disabled = True
            return False
        except Exception as e:
            logger.warning(f"Error writing to Redis cache: {e}")
            return False

cache_service = CacheService()

