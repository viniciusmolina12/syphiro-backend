import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
    BadRequestException,
    ConflictException,
} from '@nestjs/common';
import { CreatePlayerUsecase } from '@player/application/usecases/create/create.usecase';
import { InvalidIdentityIdError } from '@player/domain/value-objects/identity_id.vo';
import { InvalidNameError } from '@player/domain/value-objects/name.vo';
import { PlayerAlreadyExistsError } from '@player/domain/errors';
import { CreatePlayerDto, CreatePlayerResponseDto } from './dto/create-player.dto';

function mapToHttpException(error: Error): never {
    if (error instanceof InvalidIdentityIdError || error instanceof InvalidNameError) {
        throw new BadRequestException(error.message);
    }
    if (error instanceof PlayerAlreadyExistsError) throw new ConflictException(error.message);
    throw error;
}

@Controller('players')
export class PlayerController {
    constructor(private readonly createPlayerUsecase: CreatePlayerUsecase) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() dto: CreatePlayerDto): Promise<CreatePlayerResponseDto> {
        const [result, error] = (await this.createPlayerUsecase.execute(dto)).asArray();
        if (error) mapToHttpException(error);
        return {
            id: result.id.toString(),
            name: result.name.value,
            identity_id: result.identity_id.value,
        };
    }
}
