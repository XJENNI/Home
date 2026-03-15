from rapidocr_onnxruntime import RapidOCR
ocr = RapidOCR()
res, _ = ocr('DATA/photo_2026-03-14_22-10-55.jpg')
print('IMG1:', [t[1] for t in res] if res else None)
res2, _ = ocr('DATA/photo_2026-03-14_22-11-01.jpg')
print('IMG2:', [t[1] for t in res2] if res2 else None)
