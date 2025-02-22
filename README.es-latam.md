# ![logo](/img/UnixTemp32.png) UnixTemp - Documentación de la API

<div align="end">
  <a href="README.md">
    <img src="https://img.shields.io/badge/English_Version-009?style=for-the-badge&logo=googletranslate&logoColor=2af1f1" alt="English Version">
  </a>
  <a href="README.pt-br.md">
    <img src="https://img.shields.io/badge/Vers%C3%A3o_em_Portugu%C3%AAs-009?style=for-the-badge&logo=googletranslate&logoColor=2af1f1" alt="Versão em Português">
  </a>
</div>

## Tabla de Contenidos

- [ UnixTemp - Documentación de la API](#-unixtemp---documentación-de-la-api)
  - [Tabla de Contenidos](#tabla-de-contenidos)
  - [Endpoint de la API](#endpoint-de-la-api)
  - [Parámetros de Consulta](#parámetros-de-consulta)
  - [Formatos de Salida](#formatos-de-salida)
  - [Ejemplos](#ejemplos)
    - [Convertir timestamp Unix a formato legible](#convertir-timestamp-unix-a-formato-legible)
    - [Convertir fecha a timestamp Unix](#convertir-fecha-a-timestamp-unix)
  - [Manejo de Errores](#manejo-de-errores)
  - [Ejemplos de Integración](#ejemplos-de-integración)
    - [JavaScript (Fetch API)](#javascript-fetch-api)
    - [Python (Requests)](#python-requests)
  - [Posibles Errores](#posibles-errores)
  - [Mejores Prácticas](#mejores-prácticas)

## Endpoint de la API

`GET https://unixtemp.vercel.app/api/convert`

## Parámetros de Consulta

| Parámetro | Tipo | Obligatorio | Descripción |
|-----------|------|-------------|-------------|
| `type` | string | Sí | Tipo de conversión: `time` (Unix a fecha) o `unix` (fecha a Unix) |
| `format` | string | Sí | Formato de salida: `utc`, `readable`, `iso8601`, `unix` o `all` |
| `gmt` | string | No | Desfase GMT en formato `HHmm` (predeterminado: `0000`) |
| `leng` | string | No | Idioma de salida legible: `en`, `es`, `pt` (predeterminado: `en`) |
| `value` | string | Sí | El timestamp (Unix) o fecha (YYYY/MM/DD@HH:mm:ss) a convertir |
| `error` | string | No | Idioma de los mensajes de error: `en`, `es`, `pt` (predeterminado: `en`) |

## Formatos de Salida

| Formato | Ejemplo |
|---------|---------|
| `utc` | `22/02/2025 @ 14:30 UTC+0000` |
| `readable` | `22 de febrero de 2025, 14:30:00 GMT+0000` |
| `iso8601` | `2025-02-22T14:30:00Z` |
| `unix` | `1745549400` |
| `all` | `{ utc: ..., readable: ..., iso8601: ..., unix: ... }` |

## Ejemplos

### Convertir timestamp Unix a formato legible

**Solicitud:**
```
GET https://unixtemp.vercel.app/api/convert?type=time&format=readable&value=1745549400
```

**Respuesta:**
```json
{
  "result": "22 de febrero de 2025, 14:30:00 GMT+0000"
}
```

### Convertir fecha a timestamp Unix

**Solicitud:**
```
GET https://unixtemp.vercel.app/api/convert?type=unix&format=unix&value=2025/02/22@14:30:00
```

**Respuesta:**
```json
{
  "result": 1745549400
}
```

## Manejo de Errores

Si ocurre un error, la API devuelve una respuesta JSON con un mensaje de error.

**Ejemplo:**
```json
{
  "error": "Faltan parámetros obligatorios",
  "documentation": "https://unixtemp.github.io/web/"
}
```

## Ejemplos de Integración

### JavaScript (Fetch API)
```javascript
fetch("https://your-api.comhttps://unixtemp.vercel.app/api/convert?type=time&format=readable&value=1745549400")
  .then(response => response.json())
  .then(data => console.log(data.result));
```

### Python (Requests)
```python
import requests
response = requests.get("https://your-api.comhttps://unixtemp.vercel.app/api/convert", params={
    "type": "time",
    "format": "readable",
    "value": "1745549400"
})
print(response.json()["result"])
```

## Posibles Errores

| Código de Error | Mensaje |
|----------------|---------|
| `400` | Faltan parámetros obligatorios |
| `400` | Tipo de conversión inválido |
| `400` | Formato de salida inválido |
| `400` | Idioma inválido |
| `400` | Timestamp o formato de fecha inválido |
| `500` | Error interno del servidor |

## Mejores Prácticas
- Validar siempre los parámetros de entrada antes de hacer solicitudes.
- Manejar errores de forma adecuada y registrar problemas para depuración.
- Usar `format=all` si se requieren múltiples formatos de salida en una sola solicitud.
- Especificar correctamente el desfase GMT al convertir tiempos.

