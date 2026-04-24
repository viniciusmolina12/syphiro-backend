import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
    BadRequestException,
    ConflictException,
    UnauthorizedException,
    ForbiddenException,
    NotFoundException,
} from '@nestjs/common';
import { SignUpUsecase } from '@auth/application/usecases/sign-up/sign-up.usecase';
import { SignInUsecase } from '@auth/application/usecases/sign-in/sign-in.usecase';
import { ConfirmSignUpUsecase } from '@auth/application/usecases/confirm-sign-up/confirm-sign-up.usecase';
import { RefreshTokenUsecase } from '@auth/application/usecases/refresh-token/refresh-token.usecase';
import { InvalidEmailError } from '@auth/domain/value-objects/email.vo';
import { InvalidPasswordError } from '@auth/domain/value-objects/password.vo';
import {
    UserAlreadyExistsError,
    InvalidCredentialsError,
    UserNotConfirmedError,
    UserNotFoundError,
    InvalidConfirmationCodeError,
    ExpiredConfirmationCodeError,
} from '@auth/domain/errors';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { ConfirmSignUpDto } from './dto/confirm-sign-up.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

function mapToHttpException(error: Error): never {
    if (error instanceof InvalidEmailError ||
        error instanceof InvalidPasswordError ||
        error instanceof InvalidConfirmationCodeError ||
        error instanceof ExpiredConfirmationCodeError) {
        throw new BadRequestException(error.message);
    }
    if (error instanceof UserAlreadyExistsError) throw new ConflictException(error.message);
    if (error instanceof InvalidCredentialsError) throw new UnauthorizedException(error.message);
    if (error instanceof UserNotConfirmedError) throw new ForbiddenException(error.message);
    if (error instanceof UserNotFoundError) throw new NotFoundException(error.message);
    throw error;
}

@Controller('auth')
export class AuthController {
    constructor(
        private readonly signUpUsecase: SignUpUsecase,
        private readonly signInUsecase: SignInUsecase,
        private readonly confirmSignUpUsecase: ConfirmSignUpUsecase,
        private readonly refreshTokenUsecase: RefreshTokenUsecase,
    ) {}

    @Post('sign-up')
    @HttpCode(HttpStatus.CREATED)
    async signUp(@Body() dto: SignUpDto) {
        const [result, error] = (await this.signUpUsecase.execute(dto)).asArray();
        if (error) mapToHttpException(error);
        return result;
    }

    @Post('sign-in')
    @HttpCode(HttpStatus.OK)
    async signIn(@Body() dto: SignInDto) {
        const [result, error] = (await this.signInUsecase.execute(dto)).asArray();
        if (error) mapToHttpException(error);
        return result;
    }

    @Post('confirm')
    @HttpCode(HttpStatus.NO_CONTENT)
    async confirmSignUp(@Body() dto: ConfirmSignUpDto) {
        const [, error] = (await this.confirmSignUpUsecase.execute(dto)).asArray();
        if (error) mapToHttpException(error);
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refreshToken(@Body() dto: RefreshTokenDto) {
        const [result, error] = (await this.refreshTokenUsecase.execute(dto)).asArray();
        if (error) mapToHttpException(error);
        return result;
    }
}
