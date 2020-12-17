import { Router, Request, Response } from "express"
import Cache from "../utils/cache"
import fetch from "node-fetch"
import cheerio from "cheerio"
import moment from "moment-timezone"
import { celebrate, Joi, Segments } from "celebrate"

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

const router = Router()

const validator = celebrate({
    [Segments.QUERY]: Joi.object().keys({
        year: Joi.number().min(2015).default(parseInt(moment().format("YYYY"))),
        month: Joi.number().min(10).default(parseInt(moment().format("MM"))),
        timezone: Joi.string().default("Asia/Seoul")
    })
})

router.get("/getLastDay", (req: Request, res: Response) => {
    const { year, month } = req.headers
    const arr = [31, parseInt(moment().format("YYYY")) % 4 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

    return res.status(200).send(`${arr[parseInt(moment(new Date(`${year}-${month}-01T22:24:48.281Z`)).format("MM")) - 1]}`)
})

router.get("/", validator, async (req: Request, res: Response) => {
    const cache: Cache = req.app.get("cache")
    const { year, month, timezone } = req.query

    if (cache.get("calendar")) return res.send(cache.get("calendar"))

    let url = "http://ohmy-girl.com/omg_official/schedule.php"
    if (year && month) url += `?year=${encodeURI(year as string)}&month=${encodeURI(month as string)}`

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
            arrays[`arr${index}`].push(element[key].children[i].children[1].children.filter(a => a?.attribs ? a?.attribs["data-legend"] : {}).map(b => b.attribs ? b.attribs["data-legend"].replace("<br />", " - ") : "").filter(f => f !== ""))
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
                    const timeMatch = s.match(/- (PM|AM) .*./gi)
                    const time = timeMatch ? timeMatch[0].startsWith("- AM") ? timeMatch[0].slice(5).trim().replace("~", "").trimEnd().replace(" <br />", "") : timeMatch[0].slice(5).trim().replace("~", "").trimEnd().split(":").map((e, i) => !i ? (parseInt(e) + (moment().tz(timezone as string).utcOffset() / 60) + 3).toString() : e).join(":").replace(" <br />", "") : "00:00"

                    let members: Member[]
                    if (!membersMatch) members = ["OH MY GIRL"]
                    // @ts-expect-error string to Member
                    if (membersMatch && membersMatch[0].includes(",")) members = membersMatch[0].slice(1).split("").reverse().slice(1).reverse().join("").split(", ")
                    // @ts-expect-error string to Member
                    else if (membersMatch) members = [membersMatch[0].replace(/\(|\)/gi, "")]

                    const utcTime = timeMatch ? timeMatch[0].startsWith("- PM") ? timeMatch[0].slice(5).trim().replace("~", "").trimEnd().replace(" <br />", "").split(":").map((e, i) => !i ? ((parseInt(e) + 12) - 9) < 10 ? `0${((parseInt(e) + 12) - 9)}` : ((parseInt(e) + 12) - 9) : e).join(":") : timeMatch[0].slice(5).trim().replace("~", "").trimEnd().replace(" <br />", "").split(":").map((e, i) => !i ? (parseInt(e) - 3) < 10 ? `0${(parseInt(e) - 3)}` : (parseInt(e) - 3) : e).join(":") : "00:00"
                    const date = new Date(`${year}-${month}-${day < 10 ? `0${day}` : day}T${utcTime}:00.000Z`.replace(/ /gi, ""))
                    const timestamp = date.getTime()

                    return {
                        name: s.replace(membersMatch ? membersMatch[0] : "", "").replace(/- (PM|AM) .*./gi, "").trimEnd(),
                        // @ts-expect-error bug of typescript
                        members,
                        timestamp,
                        date,
                        content: s.replace("<br />", "").trimEnd().replace(/- (PM|AM) (.*?):(.*?) ~/gi, `- ${parseInt(time.split(":")[0]) < 12 ? "AM" : "PM"} ${parseInt(time.split(":")[0]) > 12 ? parseInt(time.split(":")[0]) - 12 : parseInt(time.split(":")[0])}:${time.split(":")[1]} ~`)
                    }
                })
            })
        }
    }

    const lastDaysOfMonths = [31, parseInt(moment().tz(timezone as string).format("YYYY")) % 4 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    for (const key in columns) result.push(...columns[key])

    if (!cache.get(`calendar/${year}/${month}/${timezone}`)) cache.set(`calendar/${year}/${month}/${timezone}`, result.sort((p, n) => p.day > n.day ? 1 : -1).filter(f => f.day <= lastDaysOfMonths[parseInt(moment(new Date(`${year}-${month}-01T22:24:48.281Z`)).format("MM")) - 1]))

    return res.send(cache.get(`calendar/${year}/${month}/${timezone}`))
})

export default router