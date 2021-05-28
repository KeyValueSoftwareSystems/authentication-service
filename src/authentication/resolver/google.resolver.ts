import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { GoogleAuthService } from '../service/google.service';

@Resolver('GoogleAuth')
export class GoogleAuthResolver {
  constructor(private readonly googleAuthService: GoogleAuthService) {}

  @Mutation('google')
  async googleLogin(@Args('input') request: any) {
    return this.googleAuthService.login(request);
  }
}
