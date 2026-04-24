import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AuthModule } from '@auth/infrastructure/http/auth.module';
import { PlayerModule } from '@player/infrastructure/http/player.module';
import { CognitoAuthMiddleware } from '@auth/infrastructure/http/cognito-auth.middleware';

@Module({
    imports: [AuthModule, PlayerModule],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer): void {
        consumer
            .apply(CognitoAuthMiddleware)
            .exclude({ path: 'auth/(.*)', method: RequestMethod.ALL })
            .exclude({ path: 'players', method: RequestMethod.POST })
            .forRoutes('*');
    }
}

