import httpStatus from "./httpStatus.js";

function controller(requestHandler) {
    return async (req, res, next) => {
        try {
            const returnVal = await requestHandler(req, res, next);
            if (!returnVal) return;

            const { code, ...response } = returnVal;
            res.status(code && typeof code === "number" ? code : 200).json(
                response
            );
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
