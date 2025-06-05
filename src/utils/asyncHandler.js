export const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next))
            .catch((err) => {
                console.error("Async Handler Error:", err); // ✅ Log actual error
                next(err);
            });
    };
};
