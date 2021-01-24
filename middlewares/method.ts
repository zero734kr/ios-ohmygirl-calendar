import { NowRequest, NowResponse } from "@vercel/node"

type NextFunction = (noerror?: boolean) => boolean | void

export function Method(...methods: string[]) {
    return function (req: NowRequest, res: NowResponse, next: NextFunction): boolean | void {
        if (methods.includes(req.method as string)) return next(true)

        res.status(405).send({
            status: 405,
            error: "Method Not Allowed",
            message: `Method Not allowed, only [${methods.join(", ")}] method${methods.length < 2 ? "" : "s"} ${methods.length < 2 ? "is" : "are"} allowed.`
        })

        return next(false)
    }
}
