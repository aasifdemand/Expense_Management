// update-profile.dto.ts
import { IsString, IsEmail, IsOptional, IsEnum, IsPhoneNumber, MinLength } from 'class-validator';
import { UserRole } from 'src/models/user.model';

export class UpdateProfileDto {


    @IsOptional()
    @IsString()
    @MinLength(2, { message: 'Name must be at least 2 characters long' })
    name?: string;

    @IsOptional()
    @IsEmail({}, { message: 'Please provide a valid email address' })
    email?: string;

    @IsOptional()
    @IsString()
    @IsPhoneNumber('IN', { message: 'Please provide a valid Indian phone number' }) // Change country code as needed
    phone?: string;

    @IsOptional()
    @IsString()
    department?: string;

    @IsOptional()
    @IsString()
    userLoc?: string;

    @IsOptional()
    @IsEnum(UserRole, { message: 'Role must be either superadmin or user' })
    role?: UserRole;

    @IsOptional()
    @IsString()
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    password?: string;
}