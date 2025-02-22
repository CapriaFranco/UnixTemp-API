import express, { type Request, type Response } from "express"
import moment from "moment-timezone"

const app = express()

enum ConversionType {
  TIME = "time",
  UNIX = "unix",
}

enum OutputFormat {
  UTC = "utc",
  READABLE = "readable",
  ISO8601 = "iso8601",
  UNIX = "unix",
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
}

interface ConversionResponse {
  result: string | number
}

app.get("/api/convert", (req: Request, res: Response) => {
  try {
    const { type, format, gmt = "0000", leng = Language.EN, value } = req.query as unknown as ConversionRequest

    if (!type || !format || !value) {
      return res.status(400).json({ error: "Missing required parameters" })
    }

    if (!Object.values(ConversionType).includes(type)) {
      return res.status(400).json({ error: "Invalid conversion type" })
    }

    if (!Object.values(OutputFormat).includes(format)) {
      return res.status(400).json({ error: "Invalid output format" })
    }

    if (leng && !Object.values(Language).includes(leng)) {
      return res.status(400).json({ error: "Invalid language" })
    }

    let date: moment.Moment

    if (type === ConversionType.TIME) {
      const unixTimestamp = Number.parseInt(value)
      if (isNaN(unixTimestamp)) {
        return res.status(400).json({ error: "Invalid timestamp value" })
      }
      date = moment.unix(unixTimestamp)
    } else {
      date = moment(value, "YYYY/MM/DD@HH:mm:ss")
      if (!date.isValid()) {
        return res.status(400).json({ error: "Invalid date format" })
      }
    }

    const gmtOffset = gmt.replace(":", "")
    date.utcOffset(gmtOffset)

    let result: string | number

    switch (format) {
      case OutputFormat.UTC:
        result = date.format("MM/DD/YYYY @ h:mm A [UTC]Z")
        break
      case OutputFormat.READABLE:
        moment.locale(leng)
        result = date.format("LL, HH:mm:ss [GMT]Z")
        break
      case OutputFormat.ISO8601:
        result = date.toISOString()
        break
      case OutputFormat.UNIX:
        result = date.unix()
        break
      default:
        return res.status(400).json({ error: "Invalid output format" })
    }

    const response: ConversionResponse = { result }
    res.json(response)
  } catch (error) {
    console.error("Error in conversion:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

export default app

