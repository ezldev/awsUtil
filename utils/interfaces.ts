import { Request } from 'express';

export type UserObject = {
  user: {
    userId: string;
    email: string;
    permissions?: string[];
  };
};
export type AuthenticatedRequest = Request & { user: UserObject };
