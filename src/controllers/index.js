function controller(routeHandler) {
    return async (req, res) => {
        try {
            const response = await routeHandler(req, res);
            const { code } = response;
            if (code && typeof code === "number") {
                res.status(code);
                delete response.code;
            }
            res.json(response);
        } catch (err) {
            throw err;
        }
    };
}

export default controller;
