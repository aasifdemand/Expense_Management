
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/prefer-promise-reject-errors */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserRole } from 'src/models/user.model';
import { AuthDto } from './dto/auth.dto';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import * as argon2 from "argon2";
import { CreateUserDto } from './dto/create-user.dto';
import { v4 as uuidv4 } from 'uuid';


@Injectable()
export class AuthService {
    constructor(@InjectModel(User.name) private readonly userModel: Model<User>) { }

    async auth(data: AuthDto, session: Record<string, any>, deviceName: string) {
        const user = await this.userModel.findOne({ name: data.name });
        if (!user) throw new UnauthorizedException('User not found');

        const passwordMatches = await argon2.verify(user.password, data.password);
        if (!passwordMatches) throw new UnauthorizedException('Invalid password');

        const deviceId = uuidv4(); // generate new device ID
        const existingSession = user.sessions.find(s => s.deviceId === deviceId);

        let qrCodeDataUrl: string | null = null;

        // Only generate QR if new device
        if (!existingSession) {
            const secret = speakeasy.generateSecret({
                name: `ExpenseManagement (${user.name})`,
            });
            user.twoFactorSecret = secret.base32;
            qrCodeDataUrl = await qrcode.toDataURL(secret.otpauth_url);
        }

        // Save/update session in user document
        const now = new Date();
        user.sessions.push({
            deviceId,
            lastLogin: now,
            deviceName,
            twoFactorVerified: false,
        });
        await user.save();

        // save deviceId in session for later verification
        session.deviceId = deviceId;
        session.userId = user._id;
        session.twoFactorSecret = user.twoFactorSecret;
        session.twoFactorPending = true;
        session.twoFactorVerified = false;
        session.authenticated = false;

        await new Promise((resolve, reject) =>
            session.save(err => (err ? reject(err) : resolve(true)))
        );

        return {
            qr: qrCodeDataUrl,
            deviceId,
            session: {
                role: user?.role,
                twoFactorPending: session.twoFactorPending,
                twoFactorVerified: session.twoFactorVerified,
                authenticated: session.authenticated,
            },
        };
    }




    async verifyTwoFactorCode(token: string, session: Record<string, any>) {
        // --- Validate session integrity ---
        if (!session?.userId || !session?.twoFactorSecret) {
            throw new UnauthorizedException('Session expired or invalid');
        }

        const user = await this.userModel.findById(session.userId);
        if (!user) throw new UnauthorizedException('User not found');

        if (!user.twoFactorSecret) {
            throw new UnauthorizedException('2FA not initialized for this user');
        }

        // --- Validate token type ---
        if (!token || typeof token !== 'string' || token.trim().length < 6) {
            throw new BadRequestException('Invalid or missing OTP');
        }

        // --- Verify token using speakeasy ---
        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token,
            window: 1, // allows ±30s drift
        });

        if (!verified) {
            throw new UnauthorizedException('Incorrect or expired OTP');
        }

        // --- Mark device session as verified ---
        const deviceId = session.deviceId;
        if (deviceId) {
            const deviceSession = user.sessions?.find(s => s.deviceId === deviceId);
            if (deviceSession) {
                deviceSession.twoFactorVerified = true;
                deviceSession.lastLogin = new Date();
            } else {
                // If device session not found, register it
                user.sessions.push({
                    deviceId,
                    deviceName: 'Unknown',
                    twoFactorVerified: true,
                    lastLogin: new Date(),
                });
            }
            await user.save();
        }

        // --- Update session object ---
        session.twoFactorPending = false;
        session.twoFactorVerified = true;
        session.authenticated = true;

        await new Promise((resolve, reject) => session.save(err => (err ? reject(err) : resolve(true))));

        return {
            message: '2FA verification successful',
            verified: true,
            session: {
                twoFactorPending: session.twoFactorPending,
                twoFactorVerified: session.twoFactorVerified,
                authenticated: session.authenticated,
            },
        };
    }




    async getSessionData(session: Record<string, any>) {
        if (!session) {
            throw new NotFoundException('Session not found or has expired');
        }

        if (session.twoFactorPending) {
            throw new UnauthorizedException("Please verify first by 2FA");
        }

        const userId = session.userId as Types.ObjectId

        const user = await this.userModel
            .findById(userId)
            .select("name email role spentAmount reimbursedAmount allocatedAmount budgetLeft")
            // .populate([
            //     {
            //         path: "expenses",
            //         select: "amount reimbursedAmount department paidTo isReimbursed proof year month createdAt budget",
            //         options: { sort: { createdAt: -1 }, limit: 10 },

            //     },
            //     {
            //         path: "allocatedBudgets",
            //         select: "allocatedAmount spentAmount reimbursedAmount year month",
            //     },
            // ])
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


    async createNewUser(dto: CreateUserDto) {

        const existing = await this.userModel.findOne({ name: dto.name });
        if (existing) {
            throw new BadRequestException('User with this name already exists');
        }

        // Hash password
        const hashedPassword = await argon2.hash(dto.password);

        // Create user
        const newUser = new this.userModel({
            ...dto,
            password: hashedPassword
            // allocatedBudgets: [],
            // reimbursements: [],
            // expenses: [],
            // spentAmount: 0,
            // reimbursedAmount: 0,
            // allocatedAmount: 0,
            // budgetLeft: 0,
        });

        await newUser.save();

        // Return sanitized object
        return {
            id: newUser._id,
            name: newUser.name,
            role: newUser.role,
            userLoc: newUser.userLoc,
            spentAmount: newUser.spentAmount,
            reimbursedAmount: newUser.reimbursedAmount,
            allocatedAmount: newUser.allocatedAmount,
            budgetLeft: newUser.budgetLeft,
        };
    }

    async resetUserPassword(userId: string, password: any) {
        if (!Types.ObjectId.isValid(userId)) {
            throw new BadRequestException('Invalid user ID');
        }


        console.log("password: ", password);

        // if (typeof password !== 'string') {
        //     throw new BadRequestException('Password must be a string of at least 6 characters');
        // }

        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Ensure password is string
        const hashedPassword = await argon2.hash(String(password?.password));
        user.password = hashedPassword;

        await user.save();

        return {
            id: user._id,
            name: user.name,
            role: user.role,
        };
    }





}