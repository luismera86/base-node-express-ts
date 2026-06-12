export class NotFoundException extends Error {
    statusCode: number;
    constructor(message: string = "No encontrado") {
        super(message);
        this.name = "NotFoundException";
        this.statusCode = 404;
    }
}

export class BadRequestException extends Error {
    statusCode: number;
    constructor(message: string = "Solicitud incorrecta") {
        super(message);
        this.name = "BadRequestException";
        this.statusCode = 400;
    }
}

export class UnauthorizedException extends Error {
    statusCode: number;
    constructor(message: string = "No autorizado") {
        super(message);
        this.name = "UnauthorizedException";
        this.statusCode = 401;
    }
}

export class ForbiddenException extends Error {
    statusCode: number;
    constructor(message: string = "Prohibido") {
        super(message);
        this.name = "ForbiddenException";
        this.statusCode = 403;
    }
}

export class InternalServerErrorException extends Error {
    statusCode: number;
    constructor(message: string = "Error interno del servidor") {
        super(message);
        this.name = "InternalServerErrorException";
        this.statusCode = 500;
    }
}

export class ConflictException extends Error {
    statusCode: number;
    constructor(message: string = "Conflicto") {
        super(message);
        this.name = "ConflictException";
        this.statusCode = 409;
    }
}

export class UnprocessableEntityException extends Error {
    statusCode: number;
    constructor(message: string = "Entidad no procesable") {
        super(message);
        this.name = "UnprocessableEntityException";
        this.statusCode = 422;
    }
}

export class ServiceUnavailableException extends Error {
    statusCode: number;
    constructor(message: string = "Servicio no disponible") {
        super(message);
        this.name = "ServiceUnavailableException";
        this.statusCode = 503;
    }
}

export class GatewayTimeoutException extends Error {
    statusCode: number;
    constructor(message: string = "Tiempo de espera de la pasarela agotado") {
        super(message);
        this.name = "GatewayTimeoutException";
        this.statusCode = 504;
    }
}

export class RequestTimeoutException extends Error {
    statusCode: number;
    constructor(message: string = "Tiempo de espera de la solicitud agotado") {
        super(message);
        this.name = "RequestTimeoutException";
        this.statusCode = 408;
    }
}

export class LengthRequiredException extends Error {
    statusCode: number;
    constructor(message: string = "Longitud requerida") {
        super(message);
        this.name = "LengthRequiredException";
        this.statusCode = 411;
    }
}
