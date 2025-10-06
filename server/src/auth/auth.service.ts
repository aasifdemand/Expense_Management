/* eslint-disable @typescript-eslint/prefer-promise-reject-errors */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserRole } from 'src/models/user.model';
import { AuthDto } from './dto/auth.dto';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import * as argon2 from 'argon2';
import { CreateUserDto } from './dto/create-user.dto';
import { v4 as uuidv4 } from 'uuid';
import type { Request } from 'express';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) { }

  async auth(data: AuthDto, req: Request) {
    const { deviceName } = data;



    const user = await this.userModel.findOne({ name: data.name });
    if (!user) throw new UnauthorizedException('User not found');

    const passwordMatches = await argon2.verify(user.password, data.password);
    if (!passwordMatches) throw new UnauthorizedException('Invalid password');

    let deviceId = req?.session.deviceId;
    let existingDevice = user.sessions?.find((s) => s.deviceId === deviceId);

    // fallback: find by deviceName if deviceId not present
    if (!existingDevice && deviceName) {
      existingDevice = user.sessions?.find((s) => s.deviceName === deviceName);
      if (existingDevice) deviceId = existingDevice.deviceId;
    }

    let qrCodeDataUrl: string | null = null;
    let deviceSecret: string | undefined;

    if (!existingDevice) {
      // NEW device: generate secret & push to user.sessions
      deviceId = uuidv4();
      const secret = speakeasy.generateSecret({
        name: `ExpenseManagement:${user.name}`,
        issuer: 'ExpenseManagement',
        length: 20,
      });





      const newSession = {
        deviceId,
        deviceName,
        lastLogin: new Date(),
        twoFactorVerified: false,
        twoFactorSecret: secret.base32,
      };

      if (!user.sessions) {
        user.sessions = [newSession];
      } else {
        user.sessions.push(newSession);
      }

      await user.save();
      deviceSecret = secret.base32;

      // Generate QR code ONLY for new devices
      qrCodeDataUrl = await qrcode.toDataURL(secret.otpauth_url);
      console.log('QR code generated for NEW device');
    } else {
      // EXISTING device: reuse secret
      deviceSecret = existingDevice.twoFactorSecret;






      if (existingDevice.twoFactorVerified) {
        // Verified device: skip 2FA entirely
        existingDevice.lastLogin = new Date();
        await user.save();

        await new Promise<void>((resolve, reject) => {
          req.session.regenerate((err) => {
            if (err) return reject(err);
            req.session.deviceId = existingDevice.deviceId;
            req.session.twoFactorSecret = deviceSecret;
            req.session.twoFactorPending = false;
            req.session.twoFactorVerified = true;
            req.session.authenticated = true;
            req.session.user = user;

            req.session.save((err) => (err ? reject(err) : resolve()));
          });
        });

        console.log('Verified device - skipping 2FA');
        return {
          qr: null,
          deviceId,
          user: {
            id: user._id,
            name: user.name,
            role: user.role,
            twoFactorPending: false,
            twoFactorVerified: true,
            authenticated: true,
          },
        };
      } else {


        // Update last login but keep the same secret
        existingDevice.lastLogin = new Date();
        await user.save();

        // Return null for QR code since it should already be scanned
        qrCodeDataUrl = null;
        deviceSecret = existingDevice.twoFactorSecret;
      }
    }

    // Only save if we have changes (for existing unverified devices, we already saved)
    if (!existingDevice) {
      await user.save();
    }

    // Pending 2FA: regenerate session (for both new and existing unverified devices)
    await new Promise<void>((resolve, reject) => {
      req.session.regenerate((err) => {
        if (err) return reject(err);

        req.session.deviceId = deviceId;
        req.session.user = user;
        req.session.twoFactorSecret = deviceSecret;
        req.session.twoFactorPending = true;
        req.session.twoFactorVerified = false;
        req.session.authenticated = false;

        req.session.save((err) => (err ? reject(err) : resolve()));
      });
    });

    console.log('2FA pending - QR code provided only for new devices');
    return {
      qr: qrCodeDataUrl,
      deviceId,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        twoFactorPending: true,
        twoFactorVerified: false,
        authenticated: false,
      },
    };
  }

  async verifyTwoFactorCode(token: string, req: Request) {
    console.log('\n=== 2FA VERIFICATION STARTED ===');
    console.log('Received token:', token);
    console.log('Session userId:', req?.session?.userId);
    console.log('Session deviceId:', req?.session?.deviceId);
    console.log('Server time:', new Date().toISOString());

    if (!req?.session?.user || !req?.session?.deviceId) {
      throw new UnauthorizedException('Session expired or invalid');
    }

    const user = await this.userModel.findById(req?.session.user?._id);
    if (!user) throw new UnauthorizedException('User not found');

    const deviceSession = user.sessions.find(
      (s) => s.deviceId === req?.session.deviceId,
    );
    if (!deviceSession) {
      throw new UnauthorizedException('Device session not found');
    }

    // Enhanced token cleaning
    const cleanToken = token.toString().trim().replace(/\s/g, '');
    console.log('Cleaned token:', cleanToken);

    if (!cleanToken || cleanToken.length !== 6 || !/^\d+$/.test(cleanToken)) {
      throw new BadRequestException('Invalid OTP - must be 6 digits');
    }

    console.log('Device session secret:', deviceSession.twoFactorSecret);

    // Generate expected tokens for current time window
    const currentTime = Math.floor(Date.now() / 1000);

    const expectedTokens = {
      previous: speakeasy.totp({
        secret: deviceSession.twoFactorSecret,
        encoding: 'base32',
        time: currentTime - 30, // Previous 30s window
      }),
      current: speakeasy.totp({
        secret: deviceSession.twoFactorSecret,
        encoding: 'base32',
        time: currentTime, // Current window
      }),
      next: speakeasy.totp({
        secret: deviceSession.twoFactorSecret,
        encoding: 'base32',
        time: currentTime + 30, // Next 30s window
      }),
    };

    console.log('Expected tokens around current time:');
    console.log('  Previous (-30s):', expectedTokens.previous);
    console.log('  Current (now):  ', expectedTokens.current);
    console.log('  Next (+30s):    ', expectedTokens.next);
    console.log('  Provided:       ', cleanToken);

    // Try verification with multiple approaches
    let verified = false;
    let verificationMethod = '';

    // Method 1: Standard verification with window
    if (!verified) {
      verified = speakeasy.totp.verify({
        secret: deviceSession.twoFactorSecret,
        encoding: 'base32',
        token: cleanToken,
        window: 2, // ±60 seconds
      });
      if (verified) verificationMethod = 'standard window 2';
    }

    // Method 2: Direct comparison (most reliable)
    if (!verified) {
      verified =
        cleanToken === expectedTokens.previous ||
        cleanToken === expectedTokens.current ||
        cleanToken === expectedTokens.next;
      if (verified) verificationMethod = 'direct comparison';
    }

    // Method 3: Larger window as fallback
    if (!verified) {
      verified = speakeasy.totp.verify({
        secret: deviceSession.twoFactorSecret,
        encoding: 'base32',
        token: cleanToken,
        window: 6, // ±3 minutes
      });
      if (verified) verificationMethod = 'large window 6';
    }

    // Method 4: Time-agnostic verification (for testing)
    if (!verified) {
      // Generate tokens for wider time range
      for (let i = -10; i <= 10; i++) {
        const testToken = speakeasy.totp({
          secret: deviceSession.twoFactorSecret,
          encoding: 'base32',
          time: currentTime + i * 30, // ±5 minutes
        });
        if (cleanToken === testToken) {
          verified = true;
          verificationMethod = `time offset ${i * 30}s`;
          console.log(`Found match with time offset: ${i * 30} seconds`);
          break;
        }
      }
    }

    if (!verified) {
      console.log('ALL VERIFICATION METHODS FAILED');
      console.log('Secret being used:', deviceSession.twoFactorSecret);
      console.log('Current timestamp:', currentTime);

      throw new UnauthorizedException(
        'Incorrect or expired OTP. ' +
        'Please ensure your authenticator app time is synchronized with internet time.',
      );
    }

    console.log(`Token verified successfully using: ${verificationMethod}`);

    // Mark device as verified
    deviceSession.twoFactorVerified = true;
    deviceSession.lastLogin = new Date();

    await user.save();

    // Update session
    Object.assign(req?.session, {
      twoFactorPending: false,
      twoFactorVerified: true,
      authenticated: true,
    });

    await new Promise<void>((resolve, reject) =>
      req?.session.save((err) => (err ? reject(err) : resolve())),
    );

    console.log('=== 2FA VERIFICATION COMPLETED ===\n');

    return {
      message: '2FA verification successful',
      verified: true,
      method: verificationMethod,
      session: {
        twoFactorPending: req?.session.twoFactorPending,
        twoFactorVerified: req?.session.twoFactorVerified,
        authenticated: req?.session.authenticated,
      },
    };
  }
  // Debug endpoint to check 2FA status

  async getSessionData(req: Request) {
    const { session } = req;
    if (!session) {
      throw new NotFoundException('Session not found or has expired');
    }

    if (session.twoFactorPending) {
      throw new UnauthorizedException('Please verify first by 2FA');
    }

    const userId = session.user?._id as Types.ObjectId;

    const user = await this.userModel
      .findById(userId)
      .select(
        'name email role spentAmount reimbursedAmount allocatedAmount budgetLeft',
      )
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
      throw new NotFoundException('User not found');
    }

    return {
      user,
      twoFactorPending: session.twoFactorPending,
      twoFactorVerified: session.twoFactorVerified,
      authenticated: session.authenticated,
    };
  }

  clearSession(req: Request) {
    return new Promise((resolve, reject) => {
      req?.session.destroy((err) => {
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
    const users = await this.userModel
      .find({
        role: { $ne: UserRole.SUPERADMIN },
      })
      .select('-password -twoFactorSecret');

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
      password: hashedPassword,
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

    console.log('userId: ', userId);

    console.log('password: ', password);

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
