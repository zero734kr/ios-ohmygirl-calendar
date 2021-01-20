/**
 * @param {import("@vercel/node").NowRequest} req 
 * @param {import("@vercel/node").NowResponse} res
 * @param {import("joi").ValidationError} [error]
 */
exports.errors = (req, res, error) => {
    return res.status(400).send({
        status: 400,
        error: "Bad Request",
        message: "Joi request validation failed",
        validation: {
            query: {
                source: "query",
                keys: [
                    ...Object.keys(error?._original)
                ],
                message: error?.details[0].message
            }
        }
    })
}