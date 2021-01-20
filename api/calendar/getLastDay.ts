import { NowRequest, NowResponse, VercelResponse } from "@vercel/node"
import moment from "moment-timezone"


async function GetLastDay(req: NowRequest, res: NowResponse): Promise<VercelResponse> {
    const { year, month } = req.headers
    const arr = [31, parseInt(moment().format("YYYY")) % 4 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

    if (!year || !month) return res.status(400).send({
        status: 400,
        error: "Bad Request",
        message: "'year' and 'month' headers are required."
    })
    const calcmonth = moment(new Date(`${year}-${month.length < 2 ? `0${month}` : month}-01T22:24:48.281Z`)).format("MM")
    
    return res.status(200).send(arr[parseInt(calcmonth) - 1])
}

export default GetLastDay
