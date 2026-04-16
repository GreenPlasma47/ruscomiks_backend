// import { Module } from '@nestjs/common';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';

// @Module({
//   imports: [],
//   controllers: [AppController],
//   providers: [AppService],
// })
// export class AppModule {}
import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ComicsModule } from './comics/comics.module';
import { MangaDexController } from './manga/mangadex.controller';
import { GenresModule } from './genres/genres.module';
import { CarouselModule } from './carousel/carousel.module';
import { CommentsModule } from './comments/comments.module';
import { RatingsModule } from './ratings/ratings.module';
import { FavoritesModule } from './favorites/favorites.module';
import { SharesModule } from './shares/shares.module';
import { PublishRequestsModule } from './publish-requests/publish-requests.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    ComicsModule,
    MangaDexController,
    GenresModule,
    CarouselModule,
    CommentsModule,
    RatingsModule,
    FavoritesModule,
    SharesModule,
    PublishRequestsModule,
  ],
})
export class AppModule {}