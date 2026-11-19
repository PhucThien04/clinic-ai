import math

from app.schemas import VitalAlert, Vitals


def evaluate_vitals(vitals: Vitals) -> tuple[list[VitalAlert], float | None]:
    alerts: list[VitalAlert] = []

    def add(name, value, message, severity='Lưu ý'):
        alerts.append(VitalAlert(chiSo=name, giaTri=str(value), mucDo=severity, moTa=message))

    temp = vitals.NhietDo
    if temp is not None:
        if temp < 35.5:
            add('NhietDo', temp, 'Thấp hơn ngưỡng sàng lọc hạ thân nhiệt 35,5°C; cần xác minh phép đo và đánh giá trực tiếp.', 'Cảnh báo')
        elif temp >= 38:
            add('NhietDo', temp, 'Nhiệt độ từ 38°C; cần bác sĩ đánh giá sốt và tình trạng toàn thân trước thủ thuật.', 'Cảnh báo')
        elif temp >= 37.5:
            add('NhietDo', temp, 'Nhiệt độ trong khoảng sàng lọc sốt nhẹ 37,5–37,9°C; cần đo lại, đối chiếu triệu chứng.')
    systolic, diastolic = vitals.HuyetApTamThu, vitals.HuyetApTamTruong
    if (systolic is not None and systolic >= 140) or (diastolic is not None and diastolic >= 90):
        add('HuyetAp', f'{systolic if systolic is not None else "?"}/{diastolic if diastolic is not None else "?"} mmHg', 'Vượt ngưỡng sàng lọc 140/90; một lần đo không xác lập chẩn đoán tăng huyết áp. Cần đo lại; bác sĩ lưu ý thuốc tê có chất co mạch.', 'Cảnh báo')
    if (systolic is not None and systolic < 90) or (diastolic is not None and diastolic < 60):
        add('HuyetAp', f'{systolic if systolic is not None else "?"}/{diastolic if diastolic is not None else "?"} mmHg', 'Có chỉ số dưới ngưỡng 90/60; cần xác minh huyết áp thấp và đánh giá trực tiếp.', 'Cảnh báo')
    for field, low, high, label in [('NhipTim', 60, 100, 'Nhịp tim'), ('NhipTho', 12, 20, 'Nhịp thở')]:
        value = getattr(vitals, field)
        if value is not None and (value < low or value > high):
            add(field, value, f'{label} {"chậm" if value < low else "nhanh"} theo ngưỡng sàng lọc người lớn ({low}–{high}); cần đo lại và đối chiếu bối cảnh lâm sàng.', 'Cảnh báo')
    bmi = None
    if vitals.CanNang is not None and vitals.ChieuCao is not None:
        if vitals.CanNang > 0 and vitals.ChieuCao >= 1:
            bmi = round(vitals.CanNang / (vitals.ChieuCao / 100) ** 2, 2)
            if not math.isfinite(bmi):
                bmi = None
                add('BMI', 'Chưa tính được', 'Cần xác minh cân nặng, chiều cao và đơn vị đo.')
            elif bmi < 18.5 or bmi >= 25:
                add('BMI', bmi, f'BMI thuộc ngưỡng tham khảo {"thiếu cân" if bmi < 18.5 else "thừa cân"} ở người lớn; không dùng để kết luận tình trạng dinh dưỡng ở trẻ em hoặc thai kỳ.')
        else:
            add('BMI', 'Chưa tính được', 'Cân nặng phải lớn hơn 0, chiều cao theo cm phải từ 1 trở lên để tính BMI; cần xác minh dữ liệu và đơn vị đo.')
    missing = [name for name, value in vitals.model_dump().items() if value is None]
    if missing:
        add('DuLieu', 'Chưa ghi nhận', 'Thiếu chỉ số: ' + ', '.join(missing) + '. Không suy diễn các giá trị còn thiếu.')
    return alerts, bmi
