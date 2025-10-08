/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/prefer-promise-reject-errors */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  ConflictException,
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
import { UpdateProfileDto } from './dto/profile.dto';

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

    const currentSessionDeviceId = req?.session.deviceId;

    console.log('🔍 AUTH DEBUG:', {
      currentSessionDeviceId,
      deviceName,
      userSessions: user.sessions?.map(s => ({
        deviceId: s.deviceId,
        deviceName: s.deviceName,
        verified: s.twoFactorVerified
      }))
    });

    // 🚨 CRITICAL SECURITY FIX: Only trust session deviceId, NEVER trust deviceName for verification
    const existingDevice = user.sessions?.find((s) => s.deviceId === currentSessionDeviceId);

    let qrCodeDataUrl: string | null = null;
    let deviceSecret: string | undefined;
    let deviceId: string;

    // 🚨 SECURITY: Only allow 2FA bypass if EXACT session deviceId matches AND device is verified
    if (existingDevice && existingDevice.deviceId === currentSessionDeviceId) {
      deviceId = existingDevice.deviceId;
      deviceSecret = existingDevice.twoFactorSecret;

      console.log('🔍 Device check:', {
        deviceId,
        currentSessionDeviceId,
        isVerified: existingDevice.twoFactorVerified,
        deviceName: existingDevice.deviceName,
        exactMatch: existingDevice.deviceId === currentSessionDeviceId
      });

      // ✅ SECURE: Only skip 2FA if EXACT session deviceId matches AND device is verified
      if (existingDevice.twoFactorVerified && existingDevice.deviceId === currentSessionDeviceId) {
        // Update last login
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

        console.log('✅ Verified EXACT device session - skipping 2FA');
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
        // ❌ Same session device but not verified - require 2FA
        console.log('⚠️ Same session device but not verified - requiring 2FA');

        existingDevice.lastLogin = new Date();
        deviceSecret = existingDevice.twoFactorSecret;
        qrCodeDataUrl = null; // No QR code for existing session devices
      }
    } else {
      // 🆕 NEW device or DIFFERENT device: Always require 2FA with QR code

      // 🚨 SECURITY: Check if device name exists but treat as NEW device for security
      const existingDeviceByName = user.sessions?.find((s) => s.deviceName === deviceName);

      if (existingDeviceByName) {
        // Device name exists but different session - REUSE the existing device but require 2FA
        console.log('🔄 Device name exists but different session - reusing device but requiring 2FA');
        deviceId = existingDeviceByName.deviceId;
        deviceSecret = existingDeviceByName.twoFactorSecret;

        // Update last login
        existingDeviceByName.lastLogin = new Date();

        // 🚨 SECURITY: Always require 2FA for different sessions, even if device was previously verified
        if (existingDeviceByName.twoFactorVerified) {
          console.log('🔒 Previously verified device but different session - requiring re-verification');
          // Keep it verified but still require 2FA for this new session
        }

        // Generate QR code from existing secret
        if (deviceSecret) {
          const otpauthUrl = speakeasy.otpauthURL({
            secret: deviceSecret,
            label: `ExpenseManagement:${user.name}`,
            issuer: 'ExpenseManagement',
            encoding: 'base32'
          });
          qrCodeDataUrl = await qrcode.toDataURL(otpauthUrl);
          console.log('📱 QR code regenerated for existing device (different session)');
        }
      } else {
        // 🆕 COMPLETELY NEW device: Generate everything
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

        deviceSecret = secret.base32;
        qrCodeDataUrl = await qrcode.toDataURL(secret.otpauth_url);
        console.log('🆕 COMPLETELY NEW DEVICE - QR code generated');
      }
    }

    await user.save();

    // Set up session for 2FA verification
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

    console.log('⏳ 2FA required for security');
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


    if (!req?.session?.user || !req?.session?.deviceId) {
      throw new UnauthorizedException('Session expired or invalid');
    }

    const user = await this.userModel.findById(req?.session.user?._id);
    if (!user) throw new UnauthorizedException('User not found');

    const deviceSession = user.sessions.find(
      (s) => s.deviceId === req?.session.deviceId,
    );
    if (!deviceSession) {
      console.log('Available sessions:', user.sessions?.map(s => ({ deviceId: s.deviceId, deviceName: s.deviceName })));
      throw new UnauthorizedException('Device session not found');
    }

    // Enhanced token cleaning
    const cleanToken = token.toString().trim().replace(/\s/g, '');
    console.log('Cleaned token:', cleanToken);

    if (!cleanToken || cleanToken.length !== 6 || !/^\d+$/.test(cleanToken)) {
      throw new BadRequestException('Invalid OTP - must be 6 digits');
    }

    // SIMPLIFIED VERIFICATION - More tolerant approach
    const currentTime = Math.floor(Date.now() / 1000);
    let verified = false;
    let verificationMethod = '';

    // Method 1: Try with very large window first (±5 minutes)
    verified = speakeasy.totp.verify({
      secret: deviceSession.twoFactorSecret,
      encoding: 'base32',
      token: cleanToken,
      window: 10, // ±5 minutes - very tolerant
    });

    if (verified) {
      verificationMethod = 'large window 10';
    } else {
      // Method 2: Manual check across wider time range
      console.log('Testing wide time range (±5 minutes):');
      for (let i = -10; i <= 10; i++) {
        const testTime = currentTime + (i * 30);
        const testToken = speakeasy.totp({
          secret: deviceSession.twoFactorSecret,
          encoding: 'base32',
          time: testTime,
        });

        const isMatch = cleanToken === testToken;
        console.log(`  Offset ${i * 30}s: ${testToken} ${isMatch ? '<<< MATCH' : ''}`);

        if (isMatch) {
          verified = true;
          verificationMethod = `time offset ${i * 30}s`;
          console.log(`FOUND MATCH: Server is ${Math.abs(i * 30)} seconds ${i > 0 ? 'ahead' : 'behind'} authenticator app`);
          break;
        }
      }
    }

    if (!verified) {
      // Generate what SHOULD be the current token for debugging
      const currentTestToken = speakeasy.totp({
        secret: deviceSession.twoFactorSecret,
        encoding: 'base32',
        time: currentTime,
      });

      console.log('VERIFICATION FAILED - TIME SYNC ISSUE DETECTED');
      console.log('Server time:', new Date().toISOString());
      console.log('Current timestamp:', currentTime);
      console.log('Token expected by server now:', currentTestToken);
      console.log('Token you provided:', cleanToken);
      console.log('Secret:', deviceSession.twoFactorSecret);

      throw new UnauthorizedException(
        `Time synchronization issue detected. ` +
        `Server expected: ${currentTestToken}, you provided: ${cleanToken}. ` +
        'Please check that your server time is synchronized with internet time.'
      );
    }

    console.log(`Token verified successfully using: ${verificationMethod}`);

    // Mark device as verified
    deviceSession.twoFactorVerified = true;
    deviceSession.lastLogin = new Date();

    await user.save();

    // Update session
    Object.assign(req.session, {
      twoFactorPending: false,
      twoFactorVerified: true,
      authenticated: true,
    });

    await new Promise<void>((resolve, reject) =>
      req.session.save((err) => (err ? reject(err) : resolve())),
    );

    console.log('=== 2FA VERIFICATION COMPLETED ===\n');

    return {
      message: '2FA verification successful',
      verified: true,
      method: verificationMethod,
      session: {
        twoFactorPending: req.session.twoFactorPending,
        twoFactorVerified: req.session.twoFactorVerified,
        authenticated: req.session.authenticated,
      },
    };
  }

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
        'name email role userLoc phone spentAmount reimbursedAmount allocatedAmount budgetLeft',
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



  async updateProfile(updateProfileDto: UpdateProfileDto, userId: string,) {

    // Validate userId before using it
    if (!userId || userId === 'undefined') {
      throw new BadRequestException('Invalid user ID');
    }
    // Check if user exists
    const existingUser = await this.userModel.findById(userId);
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Prepare update data
    const updateData: any = { ...updateProfileDto };

    // Handle email uniqueness check
    if (updateProfileDto.email && updateProfileDto.email !== existingUser.email) {
      const emailExists = await this.userModel.findOne({
        email: updateProfileDto.email,
        _id: { $ne: userId }
      });
      if (emailExists) {
        throw new ConflictException('Email already exists');
      }
    }

    // Handle phone uniqueness check
    if (updateProfileDto.phone && updateProfileDto.phone !== existingUser.phone) {
      const phoneExists = await this.userModel.findOne({
        phone: updateProfileDto.phone,
        _id: { $ne: userId }
      });
      if (phoneExists) {
        throw new ConflictException('Phone number already exists');
      }
    }

    // Handle password hashing if provided
    if (updateProfileDto.password) {
      const hashedPassword = await argon2.hash(updateProfileDto.password);
      updateData.password = hashedPassword;
    }

    // Remove undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    // Update user
    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -twoFactorSecret -sessions'); // Exclude sensitive fields

    if (!updatedUser) {
      throw new NotFoundException('User not found after update');
    }

    // Return sanitized user object (matching your existing pattern)
    return {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role,
      department: updatedUser.department,
      userLoc: updatedUser.userLoc,
      spentAmount: updatedUser.spentAmount,
      reimbursedAmount: updatedUser.reimbursedAmount,
      allocatedAmount: updatedUser.allocatedAmount,
      budgetLeft: updatedUser.budgetLeft,
    };
  }
}
