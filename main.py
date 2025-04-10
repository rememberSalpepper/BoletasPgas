import io, json, re
import pandas as pd
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse, StreamingResponse
from typing import List
from datetime import datetime
from PIL import Image
import pytesseract
import cv2
import numpy as np
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Configuración de CORS: Permite peticiones desde cualquier origen (útil en desarrollo)
origins = ["*"]  # En producción, reemplaza "*" con tus dominios permitidos

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def preprocess_image(image_bytes: bytes) -> np.ndarray:
    """Preprocesa la imagen para mejorar la lectura OCR."""
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    open_cv_image = np.array(image)
    gray = cv2.cvtColor(open_cv_image, cv2.COLOR_RGB2GRAY)
    blur = cv2.GaussianBlur(gray, (5, 5), 0)
    thresh = cv2.adaptiveThreshold(blur, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                   cv2.THRESH_BINARY_INV, 11, 2)
    return thresh

def extract_data(text: str) -> dict:
    """Extrae los datos relevantes del texto obtenido por OCR."""
    text = text.replace('\n', ' ')
    now = datetime.now()
    fecha_fallback = now.strftime("%d/%m/%Y")
    hora_fallback = now.strftime("%H:%M:%S")
    
    data = {
        "estado": re.search(r"(?i)(transferencia\s+)?exitosa|éxito", text),
        "monto": re.search(r"\$ ?[0-9\.,]+", text),
        "destinatario": re.search(
            r"(?i)(?:de|para|destinatario|inversiones de|hacia)\s+([A-ZÁÉÍÓÚÑ ]+)(?=\s+(Recibir|Banco|Cuenta|N\*|Código|$))",
            text
        ),
        "cuenta": re.search(r"\d{1,2}-\d{3,4}-\d{2,5}-\d{4,5}-\d{1}", text)
                  or re.search(r"\d{6,11}-\d", text),
        "fecha": re.search(r"\b\d{2}/\d{2}/\d{4}\b", text),
        "hora": re.search(r"\b\d{2}:\d{2}:\d{2}\b", text),
        "codigo_transf": re.search(r"(BG\?\w+-\d+)", text)
                         or re.search(r"(?i)N\*\s*Transf\.?\s*(\d+)", text),
        "asunto": re.search(r"(?i)asunto:? ?([^\n]{5,60})", text),
    }
    
    # Procesamos cada coincidencia y aplicamos fallback si es necesario:
    return {
        k: (
            v.group(1) if v and v.lastindex
            else v.group() if v
            else (
                fecha_fallback if k == "fecha"
                else hora_fallback if k == "hora"
                else "Sin asunto" if k == "asunto"
                else None
            )
        )
        for k, v in data.items()
    }

# Endpoint para extraer datos de una única boleta
@app.post("/extract")
async def extract_comprobante(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        processed_image = preprocess_image(contents)
        text = pytesseract.image_to_string(processed_image, lang='spa')
        data = extract_data(text)
        return JSONResponse(content={"texto_raw": text, "datos": data})
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

# Endpoint para extraer datos de múltiples boletas (hasta 10)
@app.post("/extract_multi")
async def extract_multiple(files: List[UploadFile] = File(...)):
    if len(files) > 10:
        raise HTTPException(status_code=400, detail="Máximo 10 archivos permitidos.")
    
    results = []
    for file in files:
        try:
            contents = await file.read()
            processed_image = preprocess_image(contents)
            text = pytesseract.image_to_string(processed_image, lang='spa')
            data = extract_data(text)
            results.append({"filename": file.filename, "texto_raw": text, "datos": data})
        except Exception as e:
            results.append({"filename": file.filename, "error": str(e)})
    
    return JSONResponse(content={"results": results})

# Endpoint para exportar datos a Excel
@app.post("/export")
async def export_excel(extracted_data: str = Form(...), base_excel: UploadFile = File(None)):
    """
    Recibe:
      - extracted_data: cadena JSON con los datos extraídos (puede ser un objeto o una lista de objetos).
      - base_excel: (opcional) archivo Excel base a fusionar.
      
    Proceso:
      1. Convierte el JSON a un objeto Python y se asegura de que sea una lista.
      2. Crea un DataFrame a partir de esos datos.
      3. Si se envía un archivo Excel base, lo lee y concatena con el nuevo DataFrame.
      4. Genera y retorna un archivo Excel en memoria para su descarga.
    """
    try:
        datos = json.loads(extracted_data)
    except Exception as e:
        return JSONResponse(status_code=422, content={"error": "JSON inválido", "detalles": str(e)})
    
    if isinstance(datos, dict):
        datos = [datos]
    
    new_df = pd.DataFrame(datos)
    
    if base_excel is not None:
        contents = await base_excel.read()
        try:
            base_df = pd.read_excel(io.BytesIO(contents))
        except Exception as e:
            return JSONResponse(status_code=422, content={"error": "Error al leer el archivo Excel base", "detalles": str(e)})
        merged_df = pd.concat([base_df, new_df], ignore_index=True)
    else:
        merged_df = new_df

    stream = io.BytesIO()
    with pd.ExcelWriter(stream, engine="openpyxl") as writer:
        merged_df.to_excel(writer, index=False)
    stream.seek(0)
    
    return StreamingResponse(
        stream,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=merged_data.xlsx"}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
