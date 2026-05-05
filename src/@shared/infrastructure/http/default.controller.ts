import {
    Body,
    ConflictException,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Query,
    Req,
} from '@nestjs/common';


@Controller()
export class DefaultController {

    @Get()
    @HttpCode(HttpStatus.OK)
    get(@Req() dto: any): any {
        return {
            id: dto.identity_id
        };  
    }
}
