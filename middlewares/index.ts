import { NowRequest, NowResponse } from "@vercel/node"

type resultCallback<T> = (arg: T) => T | void
type middlewareCallback<T> = (req: NowRequest, res: NowResponse, next: resultCallback<T>) => Promise<T>
type middlewareCallbackSync<T> = (req: NowRequest, res: NowResponse, next: resultCallback<T>) => T

export function runMiddleware<T>(req: NowRequest, res: NowResponse, fn: middlewareCallback<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        fn(req, res, (result) => {
            if (result instanceof Error) {
                return reject(result)
            }

            return resolve(result)
        })
    })
}

export function runMiddlewareSync<T>(req: NowRequest, res: NowResponse, fn: middlewareCallbackSync<T>): T {
    return fn(req, res, result => result)
}