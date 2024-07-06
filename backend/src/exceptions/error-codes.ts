import { HttpStatus } from '@nestjs/common';

export enum ErrorCode {
  LoginOrPasswordIncorrect = 100,
  UserAlreadyExists = 101,
  EntityNotFound = 102,
}

export const code2message = new Map<ErrorCode, string>([
  [ErrorCode.LoginOrPasswordIncorrect, 'Неправильные логин или пароль'],
  [
    ErrorCode.UserAlreadyExists,
    'Пользователь с таким именем или email уже существует',
  ],
  [ErrorCode.EntityNotFound, 'Не найдено'],
]);

export const code2status = new Map<ErrorCode, HttpStatus>([
  [ErrorCode.LoginOrPasswordIncorrect, HttpStatus.BAD_REQUEST],
  [ErrorCode.UserAlreadyExists, HttpStatus.CONFLICT],
  [ErrorCode.EntityNotFound, HttpStatus.NOT_FOUND],
]);
