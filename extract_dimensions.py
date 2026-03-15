import json
from rapidocr_onnxruntime import RapidOCR
ocr = RapidOCR()
res, _ = ocr('DATA/photo_2026-03-14_22-10-55.jpg')
res2, _ = ocr('DATA/photo_2026-03-14_22-11-01.jpg')
with open('my_ocr_extracted.json', 'w', encoding='utf-8') as f:
    json.dump({'img1':[t[1] for t in res] if res else [], 'img2':[t[1] for t in res2] if res2 else []}, f, indent=2)
