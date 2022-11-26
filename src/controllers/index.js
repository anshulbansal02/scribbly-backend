function controller(routeHandler) {
    return async (req, res) => {
        try {
            const response = await routeHandler(req, res);
            res.json(response);
        } catch (err) {
            res.json({
                error: err.message,
            });
        }
    };
}

export default controller;
