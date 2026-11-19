import asyncio
import json
from urllib.parse import quote

import httpx

from app.config import Settings
from app.prompts.clinical_prompt import SYSTEM_PROMPT, build_user_prompt
from app.schemas import AnalyzeRequest, ResultBlock, ResultEnvelope


async def generate_results(request: AnalyzeRequest, source: list[ResultBlock], settings: Settings) -> tuple[list[ResultBlock], bool]:
    if not settings.api_key or not settings.model or settings.provider not in ('gemini', 'openai', 'openai-compatible'):
        return source, False
    try:
        async with asyncio.timeout(settings.timeout_seconds):
            async with httpx.AsyncClient(timeout=settings.timeout_seconds, follow_redirects=False) as client:
                prompt = build_user_prompt(request, source)
                if settings.provider == 'gemini':
                    response = await client.post(f'{settings.base_url}/models/{quote(settings.model.removeprefix("models/"), safe="")}:generateContent',
                        headers={'x-goog-api-key': settings.api_key}, json={
                            'systemInstruction': {'parts': [{'text': SYSTEM_PROMPT}]},
                            'contents': [{'role': 'user', 'parts': [{'text': prompt}]}],
                            'generationConfig': {'temperature': 0.15, 'responseMimeType': 'application/json'},
                        })
                    response.raise_for_status()
                    content = ''.join(part.get('text', '') for part in response.json()['candidates'][0]['content']['parts'])
                else:
                    response = await client.post(f'{settings.base_url}/chat/completions', headers={'Authorization': f'Bearer {settings.api_key}'}, json={
                        'model': settings.model, 'temperature': 0.15, 'response_format': {'type': 'json_object'},
                        'messages': [{'role': 'system', 'content': SYSTEM_PROMPT}, {'role': 'user', 'content': prompt}],
                    })
                    response.raise_for_status()
                    content = response.json()['choices'][0]['message']['content']
                if not isinstance(content, str) or len(content) > 160000:
                    return source, False
                parsed = ResultEnvelope.model_validate(json.loads(content))
                # Chặn dữ kiện bịa thêm và cả việc làm mất cảnh báo/tiền sử: so sánh nguyên văn từng dòng.
                for result, original in zip(parsed.ketQua, source):
                    if sorted(result.NoiDung.splitlines()) != sorted(original.NoiDung.splitlines()):
                        return source, False
                return parsed.ketQua, True
    except (httpx.HTTPError, httpx.InvalidURL, TimeoutError, ValueError, KeyError, IndexError, TypeError, AttributeError):
        return source, False
