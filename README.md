# ![logo](/img/UnixTemp32.png) UnixTemp - API Documentation

<div align="end">
  <a href="README.es-latam.md">
    <img src="https://img.shields.io/badge/Versi%C3%B3n_en_Espa%C3%B1ol-009?style=for-the-badge&logo=googletranslate&logoColor=2af1f1" alt="Versión en Español">
  </a>
  <a href="README.pt-br.md">
    <img src="https://img.shields.io/badge/Vers%C3%A3o_em_Portugu%C3%AAs-009?style=for-the-badge&logo=googletranslate&logoColor=2af1f1" alt="Versão em Português">
  </a>
</div>

## Table of Contents

- [ UnixTemp - API Documentation](#-unixtemp---api-documentation)
  - [Table of Contents](#table-of-contents)
  - [API Endpoint](#api-endpoint)
  - [Query Parameters](#query-parameters)
  - [Output Formats](#output-formats)
  - [Examples](#examples)
    - [Convert Unix timestamp to human-readable format](#convert-unix-timestamp-to-human-readable-format)
    - [Convert date to Unix timestamp](#convert-date-to-unix-timestamp)
  - [Error Handling](#error-handling)
  - [Integration Examples](#integration-examples)
    - [JavaScript (Fetch API)](#javascript-fetch-api)
    - [Python (Requests)](#python-requests)
  - [Possible Errors](#possible-errors)
  - [Best Practices](#best-practices)
    - [Traducciones Disponibles:](#traducciones-disponibles)

## API Endpoint

`GET https://unixtemp.vercel.app/api/convert`

## Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | string | Yes | Conversion type: `time` (Unix to date) or `unix` (date to Unix) |
| `format` | string | Yes | Output format: `utc`, `readable`, `iso8601`, `unix`, or `all` |
| `gmt` | string | No | GMT offset in `HHmm` format (default: `0000`) |
| `leng` | string | No | Language for readable output: `en`, `es`, `pt` (default: `en`) |
| `value` | string | Yes | The timestamp (Unix) or date (YYYY/MM/DD@HH:mm:ss) to convert |
| `error` | string | No | Language for error messages: `en`, `es`, `pt` (default: `en`) |

## Output Formats

| Format | Example |
|--------|---------|
| `utc` | `02/22/2025 @ 2:30 PM UTC+0000` |
| `readable` | `February 22, 2025, 14:30:00 GMT+0000` |
| `iso8601` | `2025-02-22T14:30:00Z` |
| `unix` | `1745549400` |
| `all` | `{ utc: ..., readable: ..., iso8601: ..., unix: ... }` |

## Examples

### Convert Unix timestamp to human-readable format

**Request:**
```
GET https://unixtemp.vercel.app/api/convert?type=time&format=readable&value=1745549400
```

**Response:**
```json
{
  "result": "February 22, 2025, 14:30:00 GMT+0000"
}
```

### Convert date to Unix timestamp

**Request:**
```
GET https://unixtemp.vercel.app/api/convert?type=unix&format=unix&value=2025/02/22@14:30:00
```

**Response:**
```json
{
  "result": 1745549400
}
```

## Error Handling

If an error occurs, the API returns a JSON response with an error message.

**Example:**
```json
{
  "error": "Missing required parameters",
  "documentation": "https://unixtemp.github.io/web/"
}
```

## Integration Examples

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

## Possible Errors

| Error Code | Message |
|------------|---------|
| `400` | Missing required parameters |
| `400` | Invalid conversion type |
| `400` | Invalid output format |
| `400` | Invalid language |
| `400` | Invalid timestamp or date format |
| `500` | Internal server error |

## Best Practices
- Always validate input parameters before making requests.
- Handle errors gracefully and log issues for debugging.
- Use `format=all` if you need multiple output formats in one request.
- Specify the correct GMT offset when converting times.

---

### Traducciones Disponibles:
- [Versión en Español Latinoamericano](README.es-latam.md)
- [Versão em Português Brasileiro](README.pt-br.md)

