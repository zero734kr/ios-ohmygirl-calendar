import { NowRequest, NowResponse, VercelResponse } from "@vercel/node"
import Validation, { Joi, Segments } from "../../middlewares/joi"
import { Method } from "../../middlewares/method"
import moment from "moment-timezone"
import cheerio from "cheerio"
import fetch from "node-fetch"
import { runMiddleware, runMiddlewareSync } from "../../middlewares"

type Member = "효정" | "유아" | "미미" | "승희" | "지호" | "비니" | "아린" | "OH MY GIRL"

interface Schedule {
    name: string
    members: Member[]
    timestamp: number
    date: Date
    content: string
}

interface Day {
    day: number
    schedules: Schedule[]
}

interface OverrideParsedQs {
    [key: string]: undefined | string | string[] | number
}

const validator = Validation({
    [Segments.QUERY]: Joi.object().keys({
        year: Joi.number().min(2015),
        month: Joi.number().min(1).max(12),
        timezone: Joi.string().default("Asia/Seoul")
    })
})

async function Calendar(req: NowRequest, res: NowResponse): Promise<void | VercelResponse> {
    const isAllowedMethod = runMiddlewareSync<boolean | void>(req, res, Method("GET"))
    if (!isAllowedMethod) return

    const validated = await runMiddleware<boolean | void>(req, res, validator)
    if (!validated) return

    const { timezone = "Asia/Seoul", year, month } = req.query as OverrideParsedQs

    let url = "http://ohmy-girl.com/omg_official/schedule.php"
    if (year && month && !(year === moment().year() && month === moment().month() + 1))
        url += `?year=${encodeURI(year as string)}&month=${encodeURI(month as string)}`

    const r = await fetch(url).then(r => r.text())
    const $ = cheerio.load(r)

    const element = $("#schedule_table > tbody > tr[height] > td > div.wrap").toArray()

    const result: Day[] = []

    for (const dayele of element) {
        const extractedDatas = dayele.children.filter(a => a?.attribs ? a?.attribs["data-legend"] : {})
        const filter = extractedDatas
            .map(b => b.attribs ? b.attribs["data-legend"] : "")
        const schedule = filter.filter(f => f !== "").map(s => s
            .replace(/(<(br|p)>|<\/(br|p)>| *(<br? ?\/>)(?!PM|AM)|(?: *-.))/gi, "")
            .replace(/ *<br ?\/>/gi, " - ")
            .replace(/<(.*?)><\/(.*?)>/gi, "")
            .trimEnd())
        const day = parseInt(dayele.children[1].children[0]?.data || "99999" as string)

        if (!dayele.children[1].children[0]?.data
            && !schedule.length
            && day === 99999) continue

        if (day < 1) continue

        const schedules = schedule.map(s => {
            const membersMatch = s.match(/ \((.*?)\)/g)?.map(e => e.slice(1))
            const timeMatch = s.match(/(PM|AM) .*./gi)
            const time = timeMatch ? timeMatch[0].slice(3).trim()
                .replace(/( *~ *)$/gi, "")
                .split(":").map((e, i) => !i
                    ? (parseInt(e) + (moment().tz(timezone as string).utcOffset() / 60) + 3).toString()
                    : e).join(":") : "00:00"

            let members: Member[]
            if (!membersMatch) members = ["OH MY GIRL"]
            if (membersMatch && membersMatch[0].includes(",")) members = membersMatch[0].slice(1).split("").reverse().slice(1).reverse().join("").split(", ") as Member[]
            else if (membersMatch) members = [membersMatch[0].replace(/\(|\)/gi, "")] as Member[]

            const realYear = year ?? moment().format("YYYY")
            const realMonth = month ?? moment().format("MM")

            const utcTime = moment.tz(new Date(`${realYear}-${realMonth}-${day < 10 ? `0${day}` : day}T${time.split(":").map((v, i) => !i
                ? parseInt(v) < 10
                    ? `0${v}`
                    : v
                : v).join(":")}:00.000`), timezone as string).utc()
            const date = utcTime.toDate()
            const timestamp = date.getTime()

            const slug = s.replace(membersMatch ? membersMatch[0] : "", "").replace(/- (PM|AM) .*.\n*/gi, "").trimEnd()

            return {
                name: slug,
                // @ts-expect-error bug of typescript
                members,
                timestamp,
                date,
                content: s.replace(
                    /(PM|AM) (.*?):(.*?) ~/gi,
                    `${parseInt(time.split(":")[0]) < 12
                        ? "AM"
                        : "PM"} ${parseInt(time.split(":")[0]) > 12 ? parseInt(time.split(":")[0]) - 12 : parseInt(time.split(":")[0])}:${time.split(":")[1]} ~`)
            }
        })

        result.push({
            day,
            schedules
        })
    }

    const lastDayOfMonths = [31, parseInt(moment().tz(timezone as string).format("YYYY")) % 4 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

    const filteredByDay = result
        .sort((p, n) => p.day > n.day ? 1 : -1)
        .filter(f => {
            const realYear = year ?? moment().format("YYYY")
            const realMonth = month ?? moment().format("MM")
            const date = new Date(`${realYear}-${realMonth}-01T22:24:48.281Z`)
            const lastDay = lastDayOfMonths[parseInt(moment(date).format("MM")) - 1]
            return f.day <= lastDay
        })

    if (!filteredByDay.length) {
        return res.status(500).send({
            status: 500,
            error: "Internal Server Error",
            message: "Couldn't get data from ohmygirl official website."
        })
    }

    return res.send(filteredByDay)
}

export default Calendar