import { Request } from 'express';
import { User } from '../Entities/user.entity';
export interface RequestWithUserInfo extends Request {
  user: User;
}
