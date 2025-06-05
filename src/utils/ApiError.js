class ApiError extends Error {
    constructor({ statusCode = 500, data, message = "Something went wrong", errors = [], stack } = {}) {
        super(message);
        this.statusCode = statusCode;
        this.success = false;
        this.errors = errors;
        this.data = data;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }

    static badRequest(message = "Bad Request", errors = []) {
        return new ApiError({ statusCode: 400, message, errors });
    }

    static unauthorized(message = "Unauthorized", errors = []) {
        return new ApiError({ statusCode: 401, message, errors });
    }

    static forbidden(message = "Forbidden", errors = []) {
        return new ApiError({ statusCode: 403, message, errors });
    }

    static notFound(message = "Not Found", errors = []) {
        return new ApiError({ statusCode: 404, message, errors });
    }

    static internal(message = "Internal Server Error", errors = []) {
        return new ApiError({ statusCode: 500, message, errors });
    }
}

export { ApiError };

//examples usage:
// throw ApiError.notFound("User not found");
// throw ApiError.unauthorized("Invalid token");
// throw new ApiError({ statusCode: 422, message: "Validation failed", errors: ["Email is required"] });
