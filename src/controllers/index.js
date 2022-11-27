import httpStatus from "./responses.js";

function controller(handler) {
    return async (req, res) => {
        try {
            const { code, ...response } = await handler(req, res);
            if (code && typeof code === "number") res.status(code);
            res.json(response);
        } catch (err) {
            const { code, ...error } = httpStatus.InternalServerError({
                error: err.message,
                stack: err.stack,
            });
            if (process.env.NODE_ENV === "development") {
                res.status(code).json(error);
                throw err;
            } else {
                res.status(code).json({ status: error.status });
            }
        }
    };
}

export default controller;
