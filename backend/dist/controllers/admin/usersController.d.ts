import { Response } from 'express';
import { AuthRequest } from '../../types/express';
export declare const getUsers: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getUserById: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const toggleBlockUser: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteUser: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=usersController.d.ts.map