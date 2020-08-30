import { sign } from 'jsonwebtoken';
import { injectable, inject } from 'tsyringe';
import { compare } from 'bcryptjs';

import authConfig from '@config/auth';

import User from '../infra/typeorm/entities/User';

import AppError from '@shared/errors/AppError';
import IUsersRepository from '../repositories/IUsersRepository';

interface IRequest {
  email: string;
  password: string;
}
interface IResponse {
  user: User;
  token: string;
}

@injectable()
class AuthUserService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,
  ) {}
  public async execute({ email, password }: IRequest): Promise<IResponse> {
    const user = await this.usersRepository.findByEmail(email);

    if (!user) {
      console.log('Error Authentication');
      throw new AppError('Incorrect Email/Password combination .', 401);
    }

    const passwordmarched = await compare(password, user.password);

    if (!passwordmarched) {
      throw new AppError('Incorrect Email/Password combination .', 401);
    }

    const { secret, expiresIn } = authConfig.jwt;

    const token = sign({}, secret, {
      subject: user.id,
      expiresIn,
    });

    return {
      user,
      token,
    };
  }
}

export default AuthUserService;
