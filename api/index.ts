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
  leng?: Language
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
  const manual = `&type={time/unix}
&format={utc/readable/iso8601/unix/all}
&lang={en/es/pt}
&error={en/es/pt}
&value={[yyyy/mm/dd@hh:mm:ss]/unix}

[Site Web](${API_DOC_URL})`

  res.send(manual)
})

app.get("/api/convert", (req: Request, res: Response) => {
  try {
    const {
      type,
      format,
      gmt = "0000",
      leng = Language.EN,
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
    if (leng && !Object.values(Language).includes(leng)) {
      return res.status(400).json({ error: getErrorWithCode("212040", error), documentation: API_DOC_URL })
    }

    let date: moment.Moment

    if (type === ConversionType.TIME) {
      const unixTimestamp = Number(value)
      if (isNaN(unixTimestamp)) {
        return res.status(400).json({ error: getErrorWithCode("212010", error), documentation: API_DOC_URL })
      }
      if (unixTimestamp < 0) {
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
      if (year < 1970 || year > 9999) {
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

      date = moment(value, "YYYY/MM/DD@HH:mm:ss")
      if (!date.isValid()) {
        return res.status(400).json({ error: getErrorWithCode("212020", error), documentation: API_DOC_URL })
      }
    }

    // Validate and parse GMT offset
    const gmtRegex = /^([+-]?\d{2})(?::?(\d{2}))?$/
    const gmtMatch = gmt.match(gmtRegex)
    if (!gmtMatch) {
      return res.status(400).json({ error: getErrorWithCode("212030", error), documentation: API_DOC_URL })
    }

    const gmtHours = Number.parseInt(gmtMatch[1])
    const gmtMinutes = Number.parseInt(gmtMatch[2] || "0")

    if (Math.abs(gmtHours) > 14 || (Math.abs(gmtHours) === 14 && gmtMinutes > 0)) {
      return res.status(400).json({ error: getErrorWithCode("212031", error), documentation: API_DOC_URL })
    }

    const gmtOffset = `${gmtHours.toString().padStart(2, "0")}${gmtMinutes.toString().padStart(2, "0")}`
    date.utcOffset(gmtOffset)

    const getFormattedResult = (format: OutputFormat): string | number => {
      switch (format) {
        case OutputFormat.UTC:
          return date.format("MM/DD/YYYY @ h:mm A [UTC]Z")
        case OutputFormat.READABLE:
          moment.locale(leng)
          return date.format(
            langConfig[leng]?.dateFormat || langConfig.en?.dateFormat || "MMMM D, YYYY, HH:mm:ss [GMT]Z",
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

