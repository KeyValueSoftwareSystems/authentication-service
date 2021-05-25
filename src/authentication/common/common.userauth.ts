import * as jwt from 'jsonwebtoken';
import UserAuthDetails from '../entity/entity.userauth';
import * as bcrypt from 'bcrypt';

export function createToken(userDetails: UserAuthDetails) {
  const expiresIn = 60 * 60;
  const secret = process.env.JWT_SECRET || '';
  const username = userDetails.email || userDetails.phone;

  const dataStoredInToken = {
    username: username,
  };
  return {
    expiresInSeconds: expiresIn,
    token: jwt.sign(dataStoredInToken, secret, { expiresIn }),
  };
}

export function validateAuthToken(request: {
  headers: { authorization: string };
}) {
  const secret = process.env.JWT_SECRET || '';
  const reqAuthToken = request.headers.authorization.split(' ')[1];
  const verificationResponse: any = jwt.verify(reqAuthToken, secret);
  return verificationResponse;
}

export function isPasswordValid(
  plainTextPassword: string,
  hashedPassword: string,
) {
  return bcrypt.compareSync(plainTextPassword, hashedPassword);
}

export function generatePasswordHash(plainTextPassword: string, salt = 10) {
  return bcrypt.hashSync(plainTextPassword, salt);
}
