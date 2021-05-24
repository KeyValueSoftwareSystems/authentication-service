import {
  BadRequestException,
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  TokenResponse,
  UserLoginInput,
  UserSignupInput,
  UserSignupResponse,
} from 'src/schema/graphql.schema';
import { Repository } from 'typeorm';
import UserAuthDetails from './userauth.entity';
import {
  createToken,
  generatePasswordHash,
  isPasswordValid,
} from './userauth.common';
import User from 'src/user/user.entity';
import UserService from 'src/user/user.service';

@Injectable()
export class UserauthService {
  constructor(
    @InjectRepository(UserAuthDetails)
    private userAuthRepository: Repository<UserAuthDetails>,
    private userService: UserService,
  ) {}

  async getUserDetailsByEmailOrPhone(
    email?: string | undefined,
    phone?: string | undefined,
  ): Promise<UserAuthDetails | undefined> {
    const nullCheckedEmail = email ? email : null;
    const nullCheckedPhone = phone ? phone : null;

    return this.userAuthRepository.findOne({
      where: [{ email: nullCheckedEmail }, { phone: nullCheckedPhone }],
      relations: ['user'],
    });
  }

  async userSignup(userDetails: UserSignupInput): Promise<UserSignupResponse> {
    const existingUserDetails = await this.getUserDetailsByEmailOrPhone(
      userDetails.email,
      userDetails.phone,
    );
    if (existingUserDetails) {
      throw new BadRequestException(
        'User details exist. Cannot signup this user.',
      );
    }

    const userFromInput = new User();
    userFromInput.email = userDetails.email || '';
    userFromInput.firstName = userDetails.firstName;
    userFromInput.middleName = userDetails.middleName;
    userFromInput.lastName = userDetails.lastName;
    const userAfterSave = await this.userService.createUser(userFromInput);

    const plainTextPassword = userDetails.password;
    userDetails.password = generatePasswordHash(plainTextPassword);

    const newUserDetails = await this.userAuthRepository.create(userDetails);
    newUserDetails.user = userAfterSave;

    await this.userAuthRepository.save(newUserDetails);
    return {
      email: newUserDetails.email,
      phone: newUserDetails.phone,
      firstName: newUserDetails.user.firstName,
      middleName: newUserDetails.user.middleName,
      lastName: newUserDetails.user.lastName,
    };
  }

  async userLogin(userDetails: UserLoginInput): Promise<TokenResponse> {
    const userRecord:
      | UserAuthDetails
      | undefined = await this.getUserDetailsByEmailOrPhone(
      userDetails.username,
      userDetails.username,
    );

    if (userRecord) {
      const hashedPassword = userRecord.password;
      const plainTextPassword = userDetails.password as string;
      if (isPasswordValid(plainTextPassword, hashedPassword)) {
        const tokenData = createToken(userRecord);
        console.log(tokenData);
        return tokenData;
      }
      throw new UnauthorizedException({
        error: 'Invalid credentials',
      });
    }
    throw new HttpException('User not found. Please signup first.', 404);
  }

  async updatePassword(username: string, passwordDetails: any): Promise<User> {
    const userRecord:
      | UserAuthDetails
      | undefined = await this.getUserDetailsByEmailOrPhone(username, username);

    if (userRecord && userRecord.user.active) {
      if (
        isPasswordValid(passwordDetails.currentPassword, userRecord.password)
      ) {
        const hashedPassword = generatePasswordHash(
          passwordDetails.newPassword,
        );

        await this.userAuthRepository.update(userRecord.id, {
          password: hashedPassword,
        });
        return userRecord.user;
      }
      throw new BadRequestException({
        error: 'Current password is incorrect',
      });
    }
    throw new HttpException('User not found. Please signup first.', 404);
  }
}
