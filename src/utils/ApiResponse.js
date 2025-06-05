class ApiResponse {
    constructor(statusCode, data = null, message = "Success") {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400;
    }

    static success(data, message = "Success") {
        return new ApiResponse({ statusCode: 200, data, message });
    }

    static created(data, message = "Resource created successfully") {
        return new ApiResponse({ statusCode: 201, data, message });
    }

    static noContent(message = "No content available") {
        return new ApiResponse({ statusCode: 204, data: null, message });
    }
}

export { ApiResponse };

//examples:
// res.json(ApiResponse.success({ user: "Anish" }));
// res.json(ApiResponse.created({ id: 123 }, "User created successfully"));
// res.json(ApiResponse.noContent());
//res.json (ApiResponse ())
