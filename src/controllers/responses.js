const httpStatus = {
    Continue: {
        code: 100,
        status: "Continue",
    },
    SwitchingProtocols: {
        code: 101,
        status: "Switching Protocols",
    },
    OK: {
        code: 200,
        status: "OK",
    },
    Created: {
        code: 201,
        status: "Created",
    },
    Accepted: {
        code: 202,
        status: "Accepted",
    },
    NonAuthoritativeInformation: {
        code: 203,
        status: "Non-Authoritative Information",
    },
    NoContent: {
        code: 204,
        status: "No Content",
    },
    ResetContent: {
        code: 205,
        status: "Reset Content",
    },
    PartialContent: {
        code: 206,
        status: "Partial Content",
    },
    MultipleChoices: {
        code: 300,
        status: "Multiple Choices",
    },
    MovedPermanently: {
        code: 301,
        status: "Moved Permanently",
    },
    Found: {
        code: 302,
        status: "Found",
    },
    SeeOther: {
        code: 303,
        status: "See Other",
    },
    NotModified: {
        code: 304,
        status: "Not Modified",
    },
    UseProxy: {
        code: 305,
        status: "Use Proxy",
    },
    TemporaryRedirect: {
        code: 307,
        status: "Temporary Redirect",
    },
    BadRequest: {
        code: 400,
        status: "Bad Request",
    },
    Unauthorized: {
        code: 401,
        status: "Unauthorized",
    },
    PaymentRequired: {
        code: 402,
        status: "Payment Required",
    },
    Forbidden: {
        code: 403,
        status: "Forbidden",
    },
    NotFound: {
        code: 404,
        status: "Not Found",
    },
    MethodNotAllowed: {
        code: 405,
        status: "Method Not Allowed",
    },
    NotAcceptable: {
        code: 406,
        status: "Not Acceptable",
    },
    ProxyAuthenticationRequired: {
        code: 407,
        status: "Proxy Authentication Required",
    },
    RequestTimeout: {
        code: 408,
        status: "Request Timeout",
    },
    Conflict: {
        code: 409,
        status: "Conflict",
    },
    Gone: {
        code: 410,
        status: "Gone",
    },
    LengthRequired: {
        code: 411,
        status: "Length Required",
    },
    PreconditionFailed: {
        code: 412,
        status: "Precondition Failed",
    },
    PayloadTooLarge: {
        code: 413,
        status: "Payload Too Large",
    },
    URITooLong: {
        code: 414,
        status: "URI Too Long",
    },
    UnsupportedMediaType: {
        code: 415,
        status: "Unsupported Media Type",
    },
    RangeNotSatisfiable: {
        code: 416,
        status: "Range Not Satisfiable",
    },
    ExpectationFailed: {
        code: 417,
        status: "Expectation Failed",
    },
    ImATeapot: {
        code: 418,
        status: "I'm a teapot",
    },
    UpgradeRequired: {
        code: 426,
        status: "Upgrade Required",
    },
    InternalServerError: {
        code: 500,
        status: "Internal Server Error",
    },
    NotImplemented: {
        code: 501,
        status: "Not Implemented",
    },
    BadGateway: {
        code: 502,
        status: "Bad Gateway",
    },
    ServiceUnavailable: {
        code: 503,
        status: "Service Unavailable",
    },
    GatewayTimeOut: {
        code: 504,
        status: "Gateway Time-out",
    },
    HttpVersionNotSupported: {
        code: 505,
        status: "HTTP Version Not Supported",
    },
    Processing: {
        code: 102,
        status: "Processing",
    },
    MultiStatus: {
        code: 207,
        status: "Multi-Status",
    },
    ImUsed: {
        code: 226,
        status: "IM Used",
    },
    PermanentRedirect: {
        code: 308,
        status: "Permanent Redirect",
    },
    UnprocessableEntity: {
        code: 422,
        status: "Unprocessable Entity",
    },
    Locked: {
        code: 423,
        status: "Locked",
    },
    FailedDepenency: {
        code: 424,
        status: "Failed Dependency",
    },
    PreconditionRequired: {
        code: 428,
        status: "Precondition Required",
    },
    TooManyRequests: {
        code: 429,
        status: "Too Many Requests",
    },
    RequestHeaderFieldsTooLarge: {
        code: 431,
        status: "Request Header Fields Too Large",
    },
    UnavailableForLegalReasons: {
        code: 451,
        status: "Unavailable For Legal Reasons",
    },
    VariantAlsoNegotiates: {
        code: 506,
        status: "Variant Also Negotiates",
    },
    InsufficientStorage: {
        code: 507,
        status: "Insufficient Storage",
    },
    NetworkAuthenticationRequired: {
        code: 511,
        status: "Network Authentication Required",
    },
};

function createResponse(status) {
    return (message) => {
        return {
            ...status,
            message,
        };
    };
}

for (const key in httpStatus) {
    httpStatus[key] = createResponse(httpStatus[key]);
}

export default httpStatus;
