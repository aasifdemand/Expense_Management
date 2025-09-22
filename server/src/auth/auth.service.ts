
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/models/user.model';
import { AuthDto } from './dto/auth.dto';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import * as argon2 from "argon2";

@Injectable()
export class AuthService {
    constructor(@InjectModel(User.name) private readonly userModel: Model<User>) { }

    async auth(data: AuthDto, session: Record<string, any>) {

        // Todo: session has to be deleted before re-login

        const user = await this.userModel.findOne({ name: data.name });
        if (!user) throw new UnauthorizedException('User not found');

        const passwordMatches = await argon2.verify(user.password, data.password);
        if (!passwordMatches) throw new UnauthorizedException('Invalid password');

        const secret = speakeasy.generateSecret({
            name: `ExpenseManagement (${data.name})`,
        });

        const qrCodeDataUrl = await qrcode.toDataURL(secret.otpauth_url);

        user.password = await argon2.hash(data.password);
        user.twoFactorSecret = secret.base32;
        await user.save();


        const safeUser = {
            id: user?._id?.toString(),
            name: user.name,
            role: user.role,
        };


        session.user = safeUser;
        session.userId = safeUser.id;
        session.twoFactorSecret = secret.base32;
        session.twoFactorPending = true;
        session.twoFactorVerified = false;
        session.authenticated = false

        await new Promise((resolve, reject) => {
            session.save((err) => (err ? reject(err) : resolve(true)));
        });


        return {
            status: HttpStatus.OK,
            session: {
                userId: session?.user.id,
                role: session?.user?.role,
                twoFactorPending: session?.twoFactorPending,
                twoFactorVerified: session?.twoFactorVerified,
                authenticated: session?.authenticated
            },
            qr: qrCodeDataUrl,
        };
    }


    async verifyTwoFactorCode(token: string, userId: string, session: Record<string, any>) {

        console.log("session: ", session);


        const user = await this.userModel.findById(userId)

        if (user?.twoFactorSecret !== session.twoFactorSecret) {
            throw new UnauthorizedException("Unauthorized, please login again")
        }

        if (!session.twoFactorSecret || !session.userId) {
            throw new UnauthorizedException('2FA not initialized in session');
        }

        const verified = await speakeasy.totp.verify({
            secret: session.twoFactorSecret,
            encoding: 'base32',
            token,
            window: 1,
        });

        if (verified) {
            session.twoFactorPending = false;
            session.twoFactorVerified = true;
            session.authenticated = true;
        }

        return {
            verified,
            message: verified ? "Verified successfully" : "Invalid token",
            session: {
                twoFactorPending: session.twoFactorPending,
                twoFactorVerified: session.twoFactorVerified,
                authenticated: session.authenticated
            }
        };
    }


    getSessionData(session: Record<string, any>) {
        if (!session || !session.user) {
            throw new NotFoundException('Session not found or has expired');
        }

        if (session.twoFactorPending) {
            throw new UnauthorizedException("Please verify first by 2FA")
        }

        return {
            user: session.user,
            twoFactorPending: session.twoFactorPending,
            twoFactorVerified: session.twoFactorVerified,
            authenticated: session.authenticated,
        };
    }




    clearSession(session: Record<string, any>) {
        return new Promise((resolve, reject) => {
            session.destroy((err) => {
                if (err) {
                    console.error('Error destroying session:', err);
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        });
    }

}