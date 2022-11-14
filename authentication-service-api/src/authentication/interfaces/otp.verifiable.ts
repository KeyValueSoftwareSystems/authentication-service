import User from '../../authorization/entity/user.entity';

export abstract class OTPVerifiable {
  abstract sendOTP: (user: User) => Promise<void>;
  abstract validateOTP: (otp: string, user: User) => Promise<boolean>;
}
