/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/prefer-promise-reject-errors */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserRole } from 'src/models/user.model';
import { AuthDto } from './dto/auth.dto';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import * as argon2 from "argon2";

@Injectable()
export class AuthService {
    constructor(@InjectModel(User.name) private readonly userModel: Model<User>) { }

    async auth(data: AuthDto, session: Record<string, any>) {
        const user = await this.userModel.findOne({ name: data.name });
        if (!user) throw new UnauthorizedException('User not found');

        const passwordMatches = await argon2.verify(user.password, data.password);
        if (!passwordMatches) throw new UnauthorizedException('Invalid password');

        let qrCodeDataUrl: string | null = null;

        // If user has no secret yet, generate one and save
        if (!user.twoFactorSecret) {
            const secret = speakeasy.generateSecret({
                name: `ExpenseManagement (${user.name})`,
            });
            user.twoFactorSecret = secret.base32;
            await user.save();
            qrCodeDataUrl = await qrcode.toDataURL(secret.otpauth_url);
        }

        const safeUser = {
            id: user._id as Types.ObjectId, // important: session stores string IDs
            name: user.name,
            role: user.role,
        };

        session.user = safeUser;
        session.userId = safeUser.id;
        session.twoFactorSecret = user.twoFactorSecret; // use saved secret
        session.twoFactorPending = true;
        session.twoFactorVerified = false;
        session.authenticated = false;

        await new Promise((resolve, reject) => session.save(err => (err ? reject(err) : resolve(true))));

        return {
            status: HttpStatus.OK,
            qr: qrCodeDataUrl, // only send QR if first time setup
            session: {
                role: session.user.role,
                twoFactorPending: session.twoFactorPending,
                twoFactorVerified: session.twoFactorVerified,
                authenticated: session.authenticated,
            },
        };
    }




    async verifyTwoFactorCode(token: string, session: Record<string, any>) {
        console.log("session: ", session);

        if (!session?.twoFactorSecret || !session?.userId) {
            throw new UnauthorizedException('2FA not initialized in session');
        }

        const user = await this.userModel.findById(session.userId);

        if (user?.twoFactorSecret !== session.twoFactorSecret) {
            throw new UnauthorizedException("Unauthorized, please login again");
        }

        const verified = speakeasy.totp.verify({
            secret: session.twoFactorSecret, // must match saved base32
            encoding: 'base32',
            token,
            window: 1, // allows 30s drift
        });

        if (!verified) {
            throw new UnauthorizedException('Invalid 2FA token');
        }

        // Set session flags on successful verification
        session.twoFactorPending = false;
        session.twoFactorVerified = true;
        session.authenticated = true;

        return {
            verified,
            message: "Verified successfully",
            session: {
                twoFactorPending: session.twoFactorPending,
                twoFactorVerified: session.twoFactorVerified,
                authenticated: session.authenticated
            }
        };
    }



    async getSessionData(session: Record<string, any>) {
        if (!session || !session.user) {
            throw new NotFoundException('Session not found or has expired');
        }

        if (session.twoFactorPending) {
            throw new UnauthorizedException("Please verify first by 2FA");
        }

        const userId = session.userId as Types.ObjectId

        const user = await this.userModel
            .findById(userId)
            .select("name email role expenses")
            .populate({
                path: "expenses",
                select: "amount department paidTo isReimbursed proof year month createdAt",
                options: { sort: { createdAt: -1 }, limit: 10 },
            })
            .lean();

        if (!user) {
            throw new NotFoundException("User not found");
        }

        return {
            user,
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


    async getAll() {

        const users = await this.userModel.find({
            role: { $ne: UserRole.SUPERADMIN }
        }).select("-password -twoFactorSecret");

        return { users };
    }

}