
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

        let deviceId = session.deviceId;
        let existingDevice = user.sessions?.find(s => s.deviceId === deviceId);

        // If no deviceId in session, try to find by deviceName
        if (!existingDevice && deviceName) {
            existingDevice = user.sessions?.find(s => s.deviceName === deviceName);
            if (existingDevice) {
                deviceId = existingDevice.deviceId;
            }
        }

        let qrCodeDataUrl: string | null = null;

        // CASE 1: EXISTING VERIFIED DEVICE
        if (existingDevice && existingDevice.twoFactorVerified) {
            // Device is already verified - no QR needed, just update last login
            existingDevice.lastLogin = new Date();
            await user.save();

            session.deviceId = existingDevice.deviceId;
            session.userId = user._id;
            session.twoFactorSecret = user.twoFactorSecret;
            session.twoFactorPending = false;
            session.twoFactorVerified = true;
            session.authenticated = true;
            session.user = user;

            await new Promise((resolve, reject) =>
                session.save(err => (err ? reject(err) : resolve(true)))
            );

            return {
                qr: null,
                deviceId,
                session: {
                    role: user.role,
                    twoFactorPending: false,
                    twoFactorVerified: true,
                    authenticated: true,
                },
            };
        }

        // CASE 2: EXISTING BUT UNVERIFIED DEVICE OR NEW DEVICE
        if (existingDevice && !existingDevice.twoFactorVerified) {
            // Existing device but not verified - use existing secret, no QR
            deviceId = existingDevice.deviceId;
        } else {
            // NEW DEVICE - generate new device ID
            deviceId = uuidv4();

            // Generate QR only if user doesn't have 2FA setup yet
            if (!user.twoFactorSecret) {
                const secret = speakeasy.generateSecret({
                    name: `ExpenseManagement:${user.name}`,
                    issuer: 'ExpenseManagement',
                });
                user.twoFactorSecret = secret.base32;
                qrCodeDataUrl = await qrcode.toDataURL(secret.otpauth_url);
            } else {
                // User has 2FA setup - no QR for new devices after initial setup
                qrCodeDataUrl = null;
            }

            // Add new device session
            user.sessions.push({
                deviceId,
                lastLogin: new Date(),
                deviceName,
                twoFactorVerified: false,
            });
        }

        await user.save();

        // Set session for current login attempt
        session.deviceId = deviceId;
        session.userId = user._id;
        session.twoFactorSecret = user.twoFactorSecret;
        session.twoFactorPending = true;
        session.twoFactorVerified = false;
        session.authenticated = false;
        session.user = user;

        await new Promise((resolve, reject) =>
            session.save(err => (err ? reject(err) : resolve(true)))
        );

        return {
            qr: qrCodeDataUrl, // QR only shown for first-time 2FA setup
            deviceId,
            session: {
                role: user.role,
                twoFactorPending: true,
                twoFactorVerified: false,
                authenticated: false,
            },
        };
    }


    async verifyTwoFactorCode(token: string, session: Record<string, any>) {
        if (!session?.userId || !session?.twoFactorSecret) {
            throw new UnauthorizedException('Session expired or invalid');
        }

        const user = await this.userModel.findById(session.userId);
        if (!user) throw new UnauthorizedException('User not found');

        if (!token || typeof token !== 'string' || token.trim().length !== 6) {
            throw new BadRequestException('Invalid OTP - must be 6 digits');
        }


        const cleanToken = token.trim().replace(/\s/g, '');


        const verified = speakeasy.totp.verify({
            secret: session.twoFactorSecret,
            encoding: 'base32',
            token: cleanToken,
            window: 1,
        });

        if (!verified) {
            throw new UnauthorizedException('Incorrect or expired OTP');
        }


        const deviceId = session.deviceId;
        if (deviceId) {
            const deviceSession = user.sessions?.find(s => s.deviceId === deviceId);

            if (deviceSession) {
                deviceSession.twoFactorVerified = true;
                deviceSession.lastLogin = new Date();
            } else {
                // Create new device session if somehow missing
                user.sessions.push({
                    deviceId,
                    deviceName: 'Unknown',
                    twoFactorVerified: true,
                    lastLogin: new Date(),
                });
            }

            // Ensure user's twoFactorSecret matches what we have in session
            if (!user.twoFactorSecret) {
                user.twoFactorSecret = session.twoFactorSecret;
            }

            await user.save();
        }

        // ✅ Update session
        session.twoFactorPending = false;
        session.twoFactorVerified = true;
        session.authenticated = true;

        await new Promise((resolve, reject) =>
            session.save(err => (err ? reject(err) : resolve(true)))
        );

        return {
            message: '2FA verification successful',
            verified: true,
            session: {
                twoFactorPending: false,
                twoFactorVerified: true,
                authenticated: true,
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

        console.log("userId: ", userId);

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