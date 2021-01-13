import { Router, Request, Response } from "express"
import Cache from "../utils/cache"
import fetch from "node-fetch"
import cheerio from "cheerio"
import moment from "moment-timezone"
import { celebrate, Joi, Segments } from "celebrate"
import { ParsedQs } from "qs"

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
    [key: string]: undefined | string | string[] | ParsedQs | ParsedQs[] | number
}

const router = Router()

const validator = celebrate({
    [Segments.QUERY]: Joi.object().keys({
        year: Joi.number().min(2015),
        month: Joi.number().min(1).max(12),
        timezone: Joi.string().default("Asia/Seoul")
    })
})

router.get("/getLastDay", (req: Request, res: Response) => {
    const { year, month } = req.headers
    const arr = [31, parseInt(moment().format("YYYY")) % 4 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

    if (!year || !month) return res.status(400).send({
        status: 400,
        error: "Bad Request",
        message: "'year' and 'month' headers are required."
    })
    return res.status(200).send(`${arr[parseInt(moment(new Date(`${year}-${month}-01T22:24:48.281Z`)).format("MM")) - 1]}`)
})

router.get("/", validator, async (req: Request, res: Response) => {
    const cache: Cache = req.app.get("cache")
    const { year, month, timezone } = req.query as OverrideParsedQs

    if (cache.get(`calendar/${!year ? moment().year() : year}/${!month ? moment().month() + 1 : month}/${timezone}`)) {
        res.setHeader("Is-Cached", "true")
        return res.send(cache.get(`calendar/${!year ? moment().year() : year}/${!month ? moment().month() + 1 : month}/${timezone}`))
    }

    let url = "http://ohmy-girl.com/omg_official/schedule.php"
    if (year && month && !(year === moment().year() && month === moment().month() + 1)) url += `?year=${encodeURI(year as string)}&month=${encodeURI(month as string)}`

    const r = await fetch(url).then(r => r.text())
    const $ = cheerio.load(r)

    const element = $("#schedule_table > tbody > tr[height]")

    const result: Day[] = []
    const noDataFields = $("#schedule_table > tbody > tr:nth-child(2)")[0].children.filter((f, i) => i % 2).map(e => e.children[1].children[1].children[0]?.data).indexOf("1")

    const arrays: Record<string, string[][]> = {
        arr1: [],
        arr2: [],
        arr3: [],
        arr4: [],
        arr5: [],
        arr6: [],
        arr7: []
    }

    const columns: Record<string, Day[]> = {
        column1: [],
        column2: [],
        column3: [],
        column4: [],
        column5: [],
        column6: [],
        column7: []
    }

    for (let i = 1; i < 14; i++) {
        if (!(i % 2)) continue

        const index = i === 1 ? i : (i + 1) / 2

        for (const key in element) {
            if (
                key !== "0"
                && key !== "1"
                && key !== "2"
                && key !== "3"
                && key !== "4"
            ) continue
            const { children } = element[key].children[i].children[1]
            const extractedDatas = children.filter(a => a?.attribs ? a?.attribs["data-legend"] : {})
            const filter = extractedDatas
                .map(b => b.attribs ? b.attribs["data-legend"] : "")
            const slug = filter.filter(f => f !== "").map(s => s
                .replace(/(<(br|p)>|<\/(br|p)>| *(<br? ?\/>)(?!PM|AM)|(?: *-.))/gi, "")
                .replace(/ *<br ?\/>/gi, " - ")
                .trimEnd())

            arrays[`arr${index}`].push(slug)
        }
        for (let ind = 0; ind < arrays[`arr${index}`]?.length; ind++) {
            const data = columns[`column${index}`]

            const schedule = arrays[`arr${index}`][ind]
            const day = ((ind * 7) + index) - noDataFields

            if (day < 1) continue

            data.push({
                day,
                schedules: schedule.map(s => {
                    const membersMatch = s.match(/ \((.*?)\)/g)?.map(e => e.slice(1))
                    const timeMatch = s.match(/(PM|AM) .*./gi)
                    const time = timeMatch ? timeMatch[0].slice(3).trim()
                        .replace(/( *~ *)$/gi, "")
                        .split(":").map((e, i) => !i
                            ? (parseInt(e) + (moment().tz(timezone as string).utcOffset() / 60) + 3).toString()
                            : e).join(":") : "00:00"

                    let members: Member[]
                    if (!membersMatch) members = ["OH MY GIRL"]
                    // @ts-expect-error string to Member
                    if (membersMatch && membersMatch[0].includes(",")) members = membersMatch[0].slice(1).split("").reverse().slice(1).reverse().join("").split(", ")
                    // @ts-expect-error string to Member
                    else if (membersMatch) members = [membersMatch[0].replace(/\(|\)/gi, "")]

                    const realYear = !year ? moment().year() : year
                    const realMonth = !month ? moment().month() + 1 : month
                    const utcTime = moment.tz(`${realYear}-${realMonth < 10 ? `0${realMonth}` : realMonth}-${day < 10 ? `0${day}` : day} ${time.split(":").map((v, i) => !i
                        ? parseInt(v) < 10
                            ? `0${v}`
                            : v
                        : v).join(":")}`, timezone as string).utc()
                    const date = utcTime.toDate()
                    const timestamp = date.getTime()

                    return {
                        name: s.replace(membersMatch ? membersMatch[0] : "", "").replace(/- (PM|AM) .*./gi, "").trimEnd(),
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
            })
        }
    }

    const lastDayOfMonths = [31, parseInt(moment().tz(timezone as string).format("YYYY")) % 4 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    for (const key in columns) result.push(...columns[key])
    const filteredByDay = result
        .sort((p, n) => p.day > n.day ? 1 : -1)
        .filter(f => {
            const realYear = !year ? moment().year() : year
            const realMonth = (!month ? moment().month() + 1 : month) < 10
                ? `0${!month ? moment().month() + 1 : month}`
                : (!month ? moment().month() + 1 : month)
            const date = new Date(`${realYear}-${realMonth}-01T22:24:48.281Z`)
            const lastDay = lastDayOfMonths[parseInt(moment(date).format("MM")) - 1]
            return f.day <= lastDay
        })

    if (!filteredByDay.length) {
        res.setHeader("Is-Cached", "false")
        return res.status(500).send({
            status: 500,
            error: "Internal Server Error",
            message: "Couldn't get data from ohmygirl official website."
        })
    }
    if (!cache.get(`calendar/${ !year ? moment().year() : year}/${!month ? moment().month() + 1 : month}/${timezone}`))
        cache.set(
            `calendar/${!year ? moment().year() : year}/${!month ? moment().month() + 1 : month}/${timezone}`,
            filteredByDay
        )

    res.setHeader("Is-Cached", "false")
    return res.send(cache.get(`calendar/${!year ? moment().year() : year}/${!month ? moment().month() + 1 : month}/${timezone}`))
})

export default router