export class NotFoundException extends Error {
    statusCode: number;
    constructor(message: string = "Not found") {
        super(message);
        this.name = "NotFoundException";
        this.statusCode = 404;
    }
}

export class BadRequestException extends Error {
    statusCode: number;
    constructor(message: string = "Bad request") {
        super(message);
        this.name = "BadRequestException";
        this.statusCode = 400;
    }
}

export class UnauthorizedException extends Error {
    statusCode: number;
    constructor(message: string = "Unauthorized") {
        super(message);
        this.name = "UnauthorizedException";
        this.statusCode = 401;
    }
}

export class ForbiddenException extends Error {
    statusCode: number;
    constructor(message: string = "Forbidden") {
        super(message);
        this.name = "ForbiddenException";
        this.statusCode = 403;
    }
}

export class InternalServerErrorException extends Error {
    statusCode: number;
    constructor(message: string = "Internal server error") {
        super(message);
        this.name = "InternalServerErrorException";
        this.statusCode = 500;
    }
}

export class ConflictException extends Error {
    statusCode: number;
    constructor(message: string = "Conflict") {
        super(message);
        this.name = "ConflictException";
        this.statusCode = 409;
    }
}

export class UnprocessableEntityException extends Error {
    statusCode: number;
    constructor(message: string = "Unprocessable entity") {
        super(message);
        this.name = "UnprocessableEntityException";
        this.statusCode = 422;
    }
}

export class ServiceUnavailableException extends Error {
    statusCode: number;
    constructor(message: string = "Service unavailable") {
        super(message);
        this.name = "ServiceUnavailableException";
        this.statusCode = 503;
    }
}

export class GatewayTimeoutException extends Error {
    statusCode: number;
    constructor(message: string = "Gateway timeout") {
        super(message);
        this.name = "GatewayTimeoutException";
        this.statusCode = 504;
    }
}

export class RequestTimeoutException extends Error {
    statusCode: number;
    constructor(message: string = "Request timeout") {
        super(message);
        this.name = "RequestTimeoutException";
        this.statusCode = 408;
    }
}

export class LengthRequiredException extends Error {
    statusCode: number;
    constructor(message: string = "Length required") {
        super(message);
        this.name = "LengthRequiredException";
        this.statusCode = 411;
    }
}
