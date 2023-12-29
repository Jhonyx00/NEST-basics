import {
  Catch,
  ArgumentsHost,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Request, Response } from 'express';
import { MyLoggerService } from './my-logger/my-logger.service';
import { PrismaClientValidationError } from '@prisma/client/runtime/library';

//the model we want to handlee the error
type MyResponseObj = {
  statusCode: number;
  timestamp: string;
  path: string;
  response: string | object;
};
@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  //parameter: "AllExceptionsFilter.name" gives context info needed in MyLoggerService
  private readonly logger = new MyLoggerService(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp(); //context
    const response = ctx.getResponse<Response>(); //response
    const request = ctx.getRequest<Request>(); ///request

    const myResponseObj: MyResponseObj = {
      statusCode: 500, //overwrite this when needed, like an error for example
      timestamp: new Date().toISOString(),
      path: request.url,
      response: '',
    };

    //exceptions is not always the same type, so we have to check the instance
    if (exception instanceof HttpException) {
      myResponseObj.statusCode = exception.getStatus();
      myResponseObj.response = exception.getResponse();
    } else if (exception instanceof PrismaClientValidationError) {
      myResponseObj.statusCode = 422;
      myResponseObj.response = exception.message.replaceAll(/\n/g, '');
    } else {
      myResponseObj.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      myResponseObj.response = 'Internal Server Error';
    }

    response.status(myResponseObj.statusCode).json(myResponseObj);
    this.logger.error(myResponseObj.response, AllExceptionsFilter.name);

    super.catch(exception, host);
  }
}
