
/**
 * @description Heavily inspired by celebrate, joi validation middleware for express
 * @see https://github.com/arb/celebrate
 */

import Joi, {
    AnySchema, AlternativesSchema, ArraySchema, BinarySchema, BooleanSchema,
    DateSchema, StringSchema, SymbolSchema, FunctionSchema, LinkSchema,
    NumberSchema, ObjectSchema, isSchema
} from "joi"
import { NowRequest, NowResponse } from "@vercel/node"
import { STATUS_CODES } from "http"

export type Segment = "query" | "body" | "params" | "headers" | "cookies" | "signedCookies"
type SegmentKey = "QUERY" | "BODY" | "PARAMS" | "HEADERS" | "COOKIES" | "SIGNEDCOOKIES"
export type Schema = AnySchema | AlternativesSchema | ArraySchema | BinarySchema | BooleanSchema
    | DateSchema | StringSchema | SymbolSchema | FunctionSchema | LinkSchema | NumberSchema
    | ObjectSchema
type MiddlewareResult = (req: NowRequest, res: NowResponse, next: (arg: boolean | void) => boolean | void) => Promise<boolean | void>

export const Segments: Record<SegmentKey, Segment> = {
    QUERY: "query",
    BODY: "body",
    PARAMS: "params",
    HEADERS: "headers",
    COOKIES: "cookies",
    SIGNEDCOOKIES: "signedCookies"
}

export { Joi }

export default function JoiMiddleware(schemas: { [x: string]: Schema }, status = 400): MiddlewareResult {
    for (const key in schemas) {
        if (!Object.values(Segments).includes(key as Segment)) {
            throw new TypeError(`Invalid Joi Schema key '${key}' passed to middleware`)
        }
        if (!isSchema(schemas[key])) {
            throw new TypeError(`Invalid Joi Schema '${key}' passed to middleware`)
        }
    }

    return async (req: NowRequest, res: NowResponse, next: (arg: boolean | void) => boolean | void) => {
        for (const key in schemas) {
            const obj = req[key as keyof NowRequest]

            try {
                await schemas[key].validateAsync(obj)
            } catch (E) {
                if (E.name !== "ValidationError") throw E

                res.status(status).send({
                    status,
                    error: STATUS_CODES[status],
                    message: "Joi request validation failed",
                    validation: {
                        [key]: {
                            source: key,
                            keys: [
                                ...E.details[0]?.path
                            ],
                            message: E.details[0]?.message
                        }
                    }
                })

                return next(false)
            }
        }

        return next(true)
    }
}
