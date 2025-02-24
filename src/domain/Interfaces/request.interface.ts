import { Request } from 'express';
import { User } from '../entities/user.entity';
export interface RequestWithUserInfo extends Request {
  user: User;
}
