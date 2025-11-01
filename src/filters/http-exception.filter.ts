import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message: string | string[] = '오류가 발생했습니다.';
    let errors: string[] = [];

    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      if ('message' in exceptionResponse) {
        if (Array.isArray(exceptionResponse.message)) {
          message = '입력값이 유효하지 않습니다.';
          errors = exceptionResponse.message;
        } else {
          message = exceptionResponse.message as string;
        }
      }
    } else {
      message = exceptionResponse as string;
    }

    response.status(status).json({
      success: false,
      message,
      ...(errors.length > 0 && { errors }),
    });
  }
}

