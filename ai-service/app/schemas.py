from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator

DISCLAIMER = 'Nội dung do AI tổng hợp chỉ mang tính chất tham khảo hỗ trợ lâm sàng, không thay thế chẩn đoán và quyết định điều trị của bác sĩ.'
CATEGORIES = ('TOMTAT', 'PHANTICH', 'CANHBAO')
Text = Annotated[str, Field(max_length=255)]
Measurement = Annotated[float, Field(ge=0, le=1000, allow_inf_nan=False)]
Rate = Annotated[int, Field(strict=True, ge=0, le=32767)]


class Model(BaseModel):
    model_config = ConfigDict(extra='forbid', allow_inf_nan=False)


class PatientInfo(Model):
    TenBenhNhan: Text | None = None
    GioiTinh: Text | None = None
    NgaySinh: Text | None = None


class Vitals(Model):
    NhietDo: Measurement | None = None
    HuyetApTamThu: Rate | None = None
    HuyetApTamTruong: Rate | None = None
    NhipTim: Rate | None = None
    NhipTho: Rate | None = None
    CanNang: Measurement | None = None
    ChieuCao: Measurement | None = None


class ClinicalInfo(Model):
    LiDoKham: Text | None = None
    TrieuChung: Text | None = None
    ThoiDiemKhoiPhat: Text | None = None
    MucDo: Text | None = None
    GhiChu: Text | None = None


class HistoryItem(Model):
    TenBenh: Annotated[str, Field(min_length=1, max_length=100)]
    MoTa: Text | None = None
    ThoiDiemMac: Text | None = None
    TrangThai: Text | None = None


class PastExam(Model):
    NgayLamViec: Text | None = None
    GioBatDau: Text | None = None
    TenBacSi: Text | None = None
    LiDoKham: Text | None = None
    TrieuChung: Text | None = None
    ChuanDoan: Text | None = None
    KetLuan: Text | None = None


class AnalyzeRequest(Model):
    IdChiTietLD: Annotated[str, Field(pattern=r'^CT[A-Za-z0-9]{11}$')]
    IdHoSoBenhNhan: Annotated[str, Field(pattern=r'^HS[A-Za-z0-9]{11}$')]
    BenhNhan: PatientInfo = Field(default_factory=PatientInfo)
    SinhHieu: Vitals = Field(default_factory=Vitals)
    LamSang: ClinicalInfo = Field(default_factory=ClinicalInfo)
    tienSuBenh: list[HistoryItem] = Field(default_factory=list, max_length=100)
    lichSuKhamTruoc: list[PastExam] = Field(default_factory=list, max_length=100)


class VitalAlert(Model):
    chiSo: str
    giaTri: str
    mucDo: Literal['Lưu ý', 'Cảnh báo']
    moTa: str


class ResultBlock(Model):
    LoaiKetQua: Literal['TOMTAT', 'PHANTICH', 'CANHBAO']
    NoiDung: Annotated[str, Field(min_length=1, max_length=500000)]


class ResultEnvelope(Model):
    ketQua: list[ResultBlock] = Field(min_length=3, max_length=3)

    @model_validator(mode='after')
    def ordered_categories(self):
        if tuple(item.LoaiKetQua for item in self.ketQua) != CATEGORIES:
            raise ValueError('Cần đủ 3 loại kết quả theo đúng thứ tự.')
        return self


class Metadata(Model):
    ruleEngineVersion: Literal['1.0'] = '1.0'
    llmUsed: bool = False
    model: str | None = None


class AnalyzeResponse(ResultEnvelope):
    IdChiTietLD: str
    nhanThamKhao: str = DISCLAIMER
    canhBaoSinhHieu: list[VitalAlert]
    metadata: Metadata
