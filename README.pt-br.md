# ![logo](/img/UnixTemp32.png) UnixTemp - Documentação da API

<div align="end">
  <a href="README.md">
    <img src="https://img.shields.io/badge/English_Version-009?style=for-the-badge&logo=googletranslate&logoColor=2af1f1" alt="English Version">
  </a>
  <a href="README.es-latam.md">
    <img src="https://img.shields.io/badge/Versi%C3%B3n_en_Espa%C3%B1ol-009?style=for-the-badge&logo=googletranslate&logoColor=2af1f1" alt="Versión en Español">
  </a>
</div>

## Índice

- [ UnixTemp - Documentação da API](#-unixtemp---documentação-da-api)
  - [Índice](#índice)
  - [Endpoint da API](#endpoint-da-api)
  - [Parâmetros da Consulta](#parâmetros-da-consulta)
  - [Formatos de Saída](#formatos-de-saída)
  - [Exemplos](#exemplos)
    - [Converter timestamp Unix para formato legível](#converter-timestamp-unix-para-formato-legível)
    - [Converter data para timestamp Unix](#converter-data-para-timestamp-unix)
  - [Tratamento de Erros](#tratamento-de-erros)
  - [Exemplos de Integração](#exemplos-de-integração)
    - [JavaScript (Fetch API)](#javascript-fetch-api)
    - [Python (Requests)](#python-requests)
  - [Possíveis Erros](#possíveis-erros)
  - [Melhores Práticas](#melhores-práticas)

## Endpoint da API

`GET https://unixtemp.vercel.app/api/convert`

## Parâmetros da Consulta

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-------------|
| `type` | string | Sim | Tipo de conversão: `time` (Unix para data) ou `unix` (data para Unix) |
| `format` | string | Sim | Formato de saída: `utc`, `readable`, `iso8601`, `unix` ou `all` |
| `gmt` | string | Não | Deslocamento GMT no formato `HHmm` (padrão: `0000`) |
| `leng` | string | Não | Idioma da saída legível: `en`, `es`, `pt` (padrão: `en`) |
| `value` | string | Sim | O timestamp (Unix) ou data (YYYY/MM/DD@HH:mm:ss) a ser convertido |
| `error` | string | Não | Idioma das mensagens de erro: `en`, `es`, `pt` (padrão: `en`) |

## Formatos de Saída

| Formato | Exemplo |
|---------|---------|
| `utc` | `22/02/2025 @ 14:30 UTC+0000` |
| `readable` | `22 de fevereiro de 2025, 14:30:00 GMT+0000` |
| `iso8601` | `2025-02-22T14:30:00Z` |
| `unix` | `1745549400` |
| `all` | `{ utc: ..., readable: ..., iso8601: ..., unix: ... }` |

## Exemplos

### Converter timestamp Unix para formato legível

**Requisição:**
```
GET https://unixtemp.vercel.app/api/convert?type=time&format=readable&value=1745549400
```

**Resposta:**
```json
{
  "result": "22 de fevereiro de 2025, 14:30:00 GMT+0000"
}
```

### Converter data para timestamp Unix

**Requisição:**
```
GET https://unixtemp.vercel.app/api/convert?type=unix&format=unix&value=2025/02/22@14:30:00
```

**Resposta:**
```json
{
  "result": 1745549400
}
```

## Tratamento de Erros

Se ocorrer um erro, a API retornará uma resposta JSON com uma mensagem de erro.

**Exemplo:**
```json
{
  "error": "Parâmetros obrigatórios ausentes",
  "documentation": "https://unixtemp.github.io/web/"
}
```

## Exemplos de Integração

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

## Possíveis Erros

| Código de Erro | Mensagem |
|----------------|---------|
| `400` | Parâmetros obrigatórios ausentes |
| `400` | Tipo de conversão inválido |
| `400` | Formato de saída inválido |
| `400` | Idioma inválido |
| `400` | Timestamp ou formato de data inválido |
| `500` | Erro interno do servidor |

## Melhores Práticas
- Sempre validar os parâmetros de entrada antes de fazer requisições.
- Tratar erros adequadamente e registrar problemas para depuração.
- Usar `format=all` se forem necessários vários formatos de saída em uma única requisição.
- Especificar corretamente o deslocamento GMT ao converter horários.

