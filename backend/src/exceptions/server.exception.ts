import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode, code2message, code2status } from './error-codes';

export class ServerException extends HttpException {
  public code: ErrorCode;
  constructor(code: ErrorCode) {
    const message =
      code2message.get(code) || 'Error occurred, please try again later';
    const status = code2status.get(code) || HttpStatus.INTERNAL_SERVER_ERROR;
    super(message, status);
    this.code = code;
  }
}
