
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/models/user.model';
import { AuthDto } from './dto/auth.dto';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import * as argon2 from "argon2"

@Injectable()
export class AuthService {
    constructor(@InjectModel(User.name) private readonly userModel: Model<User>) { }



    async auth(data: AuthDto) {
        
        const user = await this.userModel.findOne({ name: data.name });
        if (!user) {
            throw new UnauthorizedException('User not found. Please contact admin.');
        }

       
        const passwordMatches = await argon2.verify(user.password, data.password);
        if (!passwordMatches) {
            throw new UnauthorizedException('Invalid password.');
        }

        
        const secret = speakeasy.generateSecret({
            name: `ExpenseManagement (${data.name})`,
        });

       
        const qrCodeDataUrl = await qrcode.toDataURL(secret.otpauth_url);

        
        user.password = await argon2.hash(data.password);
        user.twoFactorSecret = secret.base32;
        await user.save();

        return {
            status: HttpStatus.OK,
            user,
            qr: qrCodeDataUrl,
        };
    }



    async verifyTwoFactorCode(userId: string, token: string) {
        const user = await this.userModel.findById(userId);
        if (!user || !user.twoFactorSecret) {
            throw new UnauthorizedException('2FA not enabled or user not found');
        }

        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token,
            window: 1,
        });

        return { verified, message: "Verified successfully" };
    }

}
