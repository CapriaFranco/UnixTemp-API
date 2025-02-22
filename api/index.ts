import express, { type Request, type Response } from "express"
import moment from "moment-timezone"
import path from "path"
import fs from "fs"

const app = express()

// Load error messages and language configurations
let errorMessages: any
try {
  errorMessages = JSON.parse(fs.readFileSync(path.join(__dirname, "../data/error.json"), "utf8"))
} catch (err) {
  console.error("Failed to load error messages:", err)
  errorMessages = {}
}

let langConfig: any
try {
  langConfig = JSON.parse(fs.readFileSync(path.join(__dirname, "../data/lang.json"), "utf8"))
} catch (err) {
  console.error("Failed to load language configuration:", err)
  langConfig = {}
}

enum ConversionType {
  TIME = "time",
  UNIX = "unix",
}

enum OutputFormat {
  UTC = "utc",
  READABLE = "readable",
  ISO8601 = "iso8601",
  UNIX = "unix",
  ALL = "all",
}

enum Language {
  ES = "es",
  EN = "en",
  PT = "pt",
}

interface ConversionRequest {
  type: ConversionType
  format: OutputFormat
  gmt?: string
  lang?: Language
  value: string
  error?: Language
}

interface ConversionResponse {
  result?:
    | string
    | number
    | {
        utc: string
        readable: string
        iso8601: string
        unix: number
      }
  error?: {
    code: string
    message: string
  }
}

const API_DOC_URL = "https://unixtemp.github.io/web/"

const getErrorWithCode = (code: string, lang: Language): { code: string; message: string } => {
  if (errorMessages[lang]?.[code]) {
    return {
      code,
      message: errorMessages[lang][code],
    }
  } else {
    // Fallback to just returning the error code if the message is not available
    return {
      code,
      message: `Error ${code}. Please check ${API_DOC_URL} for more information.`,
    }
  }
}

// Root route handler
app.get("/", (_req: Request, res: Response) => {
  const manual = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>UnixTemp API</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #ecf0f1;
                background-color: #121212;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }
            h1 {
                color: #ff4136;
            }
            pre {
                background-color: #1e1e1e;
                border: 1px solid #2c3e50;
                border-left: 3px solid #ff4136;
                color: #ecf0f1;
                page-break-inside: avoid;
                font-family: monospace;
                font-size: 15px;
                line-height: 1.6;
                margin-bottom: 1.6em;
                max-width: 100%;
                overflow: auto;
                padding: 1em 1.5em;
                display: block;
                word-wrap: break-word;
            }
            a {
                color: #ff4136;
                text-decoration: none;
            }
            a:hover {
                text-decoration: underline;
            }
        </style>
    </head>
    <body>
        <h1>UnixTemp API</h1>
        <p>Use the following parameters in your API requests:</p>
        <pre>
type={time/unix}
format={utc/readable/iso8601/unix/all}
lang={en/es/pt}
error={en/es/pt}
value={[yyyy/mm/dd@hh:mm:ss]/unix}
gmt={+HHMM/-HHMM}
        </pre>
        <p>For more information, visit our <a href="${API_DOC_URL}">documentation website</a>.</p>
    </body>
    </html>
  `

  res.send(manual)
})

app.get("/api/convert", (req: Request, res: Response) => {
  try {
    const {
      type,
      format,
      gmt = "+0000",
      lang = Language.EN,
      value,
      error = Language.EN,
    } = req.query as unknown as ConversionRequest

    // Validate required parameters
    if (!type) {
      return res.status(400).json({ error: getErrorWithCode("212000", error), documentation: API_DOC_URL })
    }
    if (!format) {
      return res.status(400).json({ error: getErrorWithCode("212001", error), documentation: API_DOC_URL })
    }
    if (!value) {
      return res.status(400).json({ error: getErrorWithCode("212002", error), documentation: API_DOC_URL })
    }

    // Validate parameter values
    if (!Object.values(ConversionType).includes(type)) {
      return res.status(400).json({ error: getErrorWithCode("212000", error), documentation: API_DOC_URL })
    }
    if (!Object.values(OutputFormat).includes(format)) {
      return res.status(400).json({ error: getErrorWithCode("212001", error), documentation: API_DOC_URL })
    }
    if (lang && !Object.values(Language).includes(lang)) {
      return res.status(400).json({ error: getErrorWithCode("212040", error), documentation: API_DOC_URL })
    }

    let date: moment.Moment

    if (type === ConversionType.TIME) {
      const unixTimestamp = Number(value)
      if (isNaN(unixTimestamp)) {
        return res.status(400).json({ error: getErrorWithCode("212010", error), documentation: API_DOC_URL })
      }
      // Allow negative values, but set a lower limit
      if (unixTimestamp < -62135596800) {
        // Unix timestamp for 0001-01-01 00:00:00
        return res.status(400).json({ error: getErrorWithCode("212011", error), documentation: API_DOC_URL })
      }
      if (unixTimestamp > Number.MAX_SAFE_INTEGER) {
        return res.status(400).json({ error: getErrorWithCode("212010", error), documentation: API_DOC_URL })
      }
      date = moment.unix(unixTimestamp)
    } else {
      const dateRegex = /^(\d{4})\/(\d{2})\/(\d{2})@(\d{2}):(\d{2}):(\d{2})$/
      const match = value.match(dateRegex)

      if (!match) {
        return res.status(400).json({ error: getErrorWithCode("212020", error), documentation: API_DOC_URL })
      }

      const [_, year, month, day, hour, minute, second] = match.map(Number)

      // Validate date components
      if (year < 1 || year > 9999) {
        return res.status(400).json({ error: getErrorWithCode("212020", error), documentation: API_DOC_URL })
      }
      if (month < 1 || month > 12) {
        return res.status(400).json({ error: getErrorWithCode("212021", error), documentation: API_DOC_URL })
      }
      if (day < 1 || day > new Date(year, month, 0).getDate()) {
        return res.status(400).json({ error: getErrorWithCode("212022", error), documentation: API_DOC_URL })
      }
      if (hour < 0 || hour > 23) {
        return res.status(400).json({ error: getErrorWithCode("212023", error), documentation: API_DOC_URL })
      }
      if (minute < 0 || minute > 59) {
        return res.status(400).json({ error: getErrorWithCode("212024", error), documentation: API_DOC_URL })
      }
      if (second < 0 || second > 59) {
        return res.status(400).json({ error: getErrorWithCode("212025", error), documentation: API_DOC_URL })
      }

      date = moment.utc(`${year}-${month}-${day} ${hour}:${minute}:${second}`, "YYYY-MM-DD HH:mm:ss")
      if (!date.isValid()) {
        return res.status(400).json({ error: getErrorWithCode("212020", error), documentation: API_DOC_URL })
      }
    }

    // Validate and parse GMT offset
    const gmtRegex = /^([+-])(\d{2})(?::?(\d{2}))?$/
    const gmtMatch = gmt.match(gmtRegex)
    if (!gmtMatch) {
      return res.status(400).json({ error: getErrorWithCode("212030", error), documentation: API_DOC_URL })
    }

    const gmtSign = gmtMatch[1] === "+" ? 1 : -1
    const gmtHours = Number.parseInt(gmtMatch[2])
    const gmtMinutes = Number.parseInt(gmtMatch[3] || "0")

    if (gmtHours > 14 || (gmtHours === 14 && gmtMinutes > 0)) {
      return res.status(400).json({ error: getErrorWithCode("212031", error), documentation: API_DOC_URL })
    }

    const gmtOffset = gmtSign * (gmtHours * 60 + gmtMinutes)
    date.utcOffset(gmtOffset)

    const getFormattedResult = (format: OutputFormat): string | number => {
      switch (format) {
        case OutputFormat.UTC:
          return date.format("MM/DD/YYYY @ h:mm A [UTC]Z")
        case OutputFormat.READABLE:
          moment.locale(lang)
          return date.format(
            langConfig[lang]?.dateFormat || langConfig.en?.dateFormat || "MMMM D, YYYY, HH:mm:ss [GMT]Z",
          )
        case OutputFormat.ISO8601:
          return date.toISOString()
        case OutputFormat.UNIX:
          return date.unix()
        default:
          throw new Error("Invalid output format")
      }
    }

    let result:
      | string
      | number
      | {
          utc: string
          readable: string
          iso8601: string
          unix: number
        }

    if (format === OutputFormat.ALL) {
      result = {
        utc: getFormattedResult(OutputFormat.UTC) as string,
        readable: getFormattedResult(OutputFormat.READABLE) as string,
        iso8601: getFormattedResult(OutputFormat.ISO8601) as string,
        unix: getFormattedResult(OutputFormat.UNIX) as number,
      }
    } else {
      result = getFormattedResult(format)
    }

    const response: ConversionResponse = { result }
    res.json(response)
  } catch (error) {
    console.error("Error in conversion:", error)
    const errorLang = (req.query.error as Language) || Language.EN
    res.status(500).json({
      error: getErrorWithCode("212090", errorLang),
      documentation: API_DOC_URL,
    })
  }
})

export default app

