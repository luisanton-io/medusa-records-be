export class RequestError extends Error {
    code: number

    static from (error: Error, code: number) {
        return new this(error.message, code, error.name, error.stack)
    }

    constructor(message: string, code: number, name?: string, stack?: string) {
        super()
        this.code = code
        this.name = name || "Request Error"
        this.message = message
        this.stack = stack
    }
}

