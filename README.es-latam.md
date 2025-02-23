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
fetch("https://unixtemp.vercel.app/api/convert?type=time&format=readable&value=1745549400")
  .then(response => response.json())
  .then(data => console.log(data.result));
```

### Python (Requests)
```python
import requests
response = requests.get("https://unixtemp.vercel.app/api/convert", params={
    "type": "time",
    "format": "readable",
    "value": "1745549400"
})
print(response.json()["result"])
```

## Posibles Errores

| Código de Error | Mensaje |
|----------------|---------|
| `212000` | Falta el parámetro requerido: type={time/unix} |
| `212001` | Falta el parámetro requerido: format={utc/readable/iso8601/unix/all} |
| `212002` | Falta el parámetro requerido: value={timestamp/fecha} |
| `212010` | El timestamp Unix excede el valor máximo permitido |
| `212011` | El timestamp Unix no puede ser negativo |
| `212020` | Año inválido en el formato de fecha |
| `212021` | Mes inválido en el formato de fecha (debe ser 01-12) |
| `212022` | Día inválido para el mes y año especificados |
| `212023` | Hora inválida en el formato de fecha (debe ser 00-23) |
| `212024` | Minutos inválidos en el formato de fecha (debe ser 00-59) |
| `212025` | Segundos inválidos en el formato de fecha (debe ser 00-59) |
| `212030` | Formato de GMT inválido |
| `212031` | El offset GMT excede el rango válido |
| `212040` | Código de idioma no soportado |
| `212050` | Idioma de error especificado inválido |
| `212090` | API no disponible actualmente |
| `212091` | API experimentando alta carga |
| `212092` | Mantenimiento del servicio en progreso |

## Mejores Prácticas
- Validar siempre los parámetros de entrada antes de hacer solicitudes.
- Manejar errores de forma adecuada y registrar problemas para depuración.
- Usar `format=all` si se requieren múltiples formatos de salida en una sola solicitud.
- Especificar correctamente el desfase GMT al convertir tiempos.

