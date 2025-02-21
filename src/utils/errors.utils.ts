class BaseError<T> extends Error {
    private errorInfo?: T;

    constructor(message: string, errorInfo?: T) {
        super(message);

        this.errorInfo = errorInfo;
    }

    logError() {
        console.error(this.message, this.errorInfo);
    }
}
export class InvalidLoginEmail extends BaseError<{ email: string }> {}

export class InvalidLoginPassword extends BaseError<{ email: string }> {}

interface NotFoundInput {
    resource: string;
    identifierAttribute: string;
    identifierValue: string;
}

export class NotFound extends BaseError<NotFoundInput> {}

export class UserNotFound extends NotFound {
    constructor(message: string, errorInfo: Omit<NotFoundInput, "resource">) {
        const { identifierAttribute, identifierValue } = errorInfo;

        super(message, {
            resource: "User",
            identifierAttribute,
            identifierValue,
        });
    }
}

export class Duplicated extends BaseError<{ resource: string; id: string }> {}
