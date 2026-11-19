from fastapi import FastAPI

from app.config import get_settings
from app.prompts.clinical_prompt import safe_results
from app.rules.vital_rules import evaluate_vitals
from app.schemas import AnalyzeRequest, AnalyzeResponse, Metadata
from app.services.llm_service import generate_results

app = FastAPI(title='Clinic AI – Hỗ trợ lâm sàng', version='1.0')


@app.get('/health')
async def health():
    return {'status': 'ok', 'service': 'clinic-ai-service'}


@app.post('/analyze', response_model=AnalyzeResponse)
async def analyze(request: AnalyzeRequest):
    alerts, bmi = evaluate_vitals(request.SinhHieu)
    source = safe_results(request, alerts, bmi)
    settings = get_settings()
    results, used = await generate_results(request, source, settings)
    return AnalyzeResponse(IdChiTietLD=request.IdChiTietLD, canhBaoSinhHieu=alerts, ketQua=results,
        metadata=Metadata(llmUsed=used, model=settings.model if used else None))
