export interface UserDTO {
    id: string;
    phoneNumber: string;
    fullName: string;
    lastName?: string;
    email?: string;
    birthDate?: Date;
    points?: number;
    isProfileComplete: boolean;
}
export interface CreateUserDTO {
    phoneNumber: string;
    password: string;
    fullName: string;
    lastName?: string;
    email?: string;
    birthDate?: string;
}
export interface UpdateUserDTO {
    fullName?: string;
    lastName?: string;
    email?: string;
    birthDate?: string;
    password?: string;
}
export interface AuthResponse {
    success: boolean;
    message: string;
    token?: string;
    user?: UserDTO;
    isProfileComplete?: boolean;
}
//# sourceMappingURL=user.d.ts.map