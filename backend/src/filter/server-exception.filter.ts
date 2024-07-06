import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { ServerException } from '../exceptions/server.exception';

@Catch(ServerException)
export class ServerExceptionFilter implements ExceptionFilter {
  catch(exception: ServerException, host: ArgumentsHost) {
    const status = exception.getStatus();
    const message = exception.getResponse();
    const errorCode = exception.code;

    const response = host.switchToHttp().getResponse();

    response.status(status).json({
      errorCode,
      message,
      status,
    });
  }
}
