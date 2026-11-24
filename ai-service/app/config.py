import os
from dataclasses import dataclass, field
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[1] / '.env')


@dataclass(frozen=True)
class Settings:
    provider: str = 'gemini'
    api_key: str = field(default='', repr=False)
    base_url: str = 'https://generativelanguage.googleapis.com/v1beta'
    model: str = 'gemini-2.5-flash'
    timeout_seconds: float = 20


def get_settings() -> Settings:
    provider = os.getenv('AI_PROVIDER', 'gemini').strip().lower()
    try:
        timeout = float(os.getenv('AI_TIMEOUT_SECONDS', '20'))
        if not 0 < timeout <= 120:
            timeout = 20
    except ValueError:
        timeout = 20
    return Settings(
        provider=provider,
        api_key=os.getenv('AI_API_KEY', '').strip(),
        base_url=os.getenv('AI_BASE_URL', 'https://generativelanguage.googleapis.com/v1beta' if provider == 'gemini' else 'https://api.openai.com/v1').rstrip('/'),
        model=os.getenv('AI_MODEL', 'gemini-2.5-flash' if provider == 'gemini' else '').strip(),
        timeout_seconds=timeout,
    )
