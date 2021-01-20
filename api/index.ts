import { NowRequest, NowResponse, VercelResponse } from "@vercel/node"


async function GetLastDay(req: NowRequest, res: NowResponse): Promise<VercelResponse> {
    return res.send({
        hello: "world!"
    })
}

export default GetLastDay
