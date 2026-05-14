export class AppError extends Error {
    public readonly statusCode: number;
  
    constructor(message: string, statusCode: number) {
      super(message);
      this.statusCode = statusCode;
      Object.setPrototypeOf(this, new.target.prototype);
    }
  }
  
  export class NotFoundError extends AppError {
    constructor(message: string = 'Not Found') {
      super(message, 404);
    }
  }
  
  export class ForbiddenError extends AppError {
    constructor(message: string = 'Forbidden') {
      super(message, 403);
    }
  }

  export class BadRequestError extends AppError {
    constructor(message: string = 'Bad Request') {
      super(message, 400);
    }
  }
  