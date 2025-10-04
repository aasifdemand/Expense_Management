import { IsString, IsOptional, IsEnum, MinLength } from 'class-validator';
import { UserRole } from 'src/models/user.model';

export class CreateUserDto {
    @IsString()
    name: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsString()
    @IsOptional()
    department?: string

    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole = UserRole.USER;

    @IsOptional()
    @IsString()
    userLoc?: string = "Bangalore";
}
