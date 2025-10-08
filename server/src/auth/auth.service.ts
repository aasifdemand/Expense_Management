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
    const user = await this.userModel.findOne({ name: data.name });
    if (!user) throw new UnauthorizedException('User not found');

    const passwordMatches = await argon2.verify(user.password, data.password);
    if (!passwordMatches) throw new UnauthorizedException('Invalid password');

    const currentSessionDeviceId = req?.session.deviceId;

    // Check if we have a valid session already
    if (req?.session.authenticated && req?.session.deviceId) {
      const existingDevice = user.sessions?.find((s) =>
        s.deviceId === req.session.deviceId && s.twoFactorVerified
      );

      if (existingDevice) {
        // ✅ Already authenticated - just return user data
        return {
          qr: null,
          deviceId: existingDevice.deviceId,
          user: {
            id: user._id,
            name: user.name,
            role: user.role,
            twoFactorPending: false,
            twoFactorVerified: true,
            authenticated: true,
          },
        };
      }
    }

    // Check by session deviceId
    const existingDevice = user.sessions?.find((s) => s.deviceId === currentSessionDeviceId);

    let qrCodeDataUrl: string | null = null;
    let deviceSecret: string | undefined;
    let deviceId: string;

    if (existingDevice && existingDevice.deviceId === currentSessionDeviceId) {
      deviceId = existingDevice.deviceId;
      deviceSecret = existingDevice.twoFactorSecret;

      if (existingDevice.twoFactorVerified) {
        // ✅ Update session without regenerating
        req.session.deviceId = deviceId;
        req.session.twoFactorSecret = deviceSecret;
        req.session.twoFactorPending = false;
        req.session.twoFactorVerified = true;
        req.session.authenticated = true;
        req.session.user = user;

        await new Promise<void>((resolve, reject) =>
          req.session.save((err) => err ? reject(err) : resolve())
        );

        existingDevice.lastLogin = new Date();
        await user.save();

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
        // 🚨 FIX: Generate QR code for existing unverified device
        existingDevice.lastLogin = new Date();
        deviceSecret = existingDevice.twoFactorSecret;
        deviceId = existingDevice.deviceId;

        // Regenerate QR code from existing secret
        const otpauth_url = speakeasy.otpauthURL({
          secret: deviceSecret,
          label: encodeURIComponent(`ExpenseManagement:${user.name}`),
          issuer: 'ExpenseManagement',
          encoding: 'base32'
        });

        qrCodeDataUrl = await qrcode.toDataURL(otpauth_url);
      }
    } else {
      // 🚨 CHECK: Is user already logged in on another device?
      const verifiedSessions = user.sessions?.filter(s => s.twoFactorVerified) || [];
      if (verifiedSessions.length > 0) {
        throw new UnauthorizedException(
          'User already logged in on another device. Please logout from other devices first.'
        );
      }

      // NEW device - first time login or no verified sessions
      deviceId = uuidv4();
      const secret = speakeasy.generateSecret({
        name: `ExpenseManagement:${user.name}`,
        issuer: 'ExpenseManagement',
        length: 20,
      });

      const newSession = {
        deviceId,
        lastLogin: new Date(),
        twoFactorVerified: false,
        twoFactorSecret: secret.base32,
      };

      user.sessions = user.sessions || [];
      user.sessions.push(newSession);

      deviceSecret = secret.base32;
      qrCodeDataUrl = await qrcode.toDataURL(secret.otpauth_url);
    }

    await user.save();

    // Set up session for 2FA
    req.session.deviceId = deviceId;
    req.session.user = user;
    req.session.twoFactorSecret = deviceSecret;
    req.session.twoFactorPending = true;
    req.session.twoFactorVerified = false;
    req.session.authenticated = false;

    await new Promise<void>((resolve, reject) =>
      req.session.save((err) => err ? reject(err) : resolve())
    );

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

    // Find the device session by session deviceId
    const deviceSession = user.sessions.find(
      (s) => s.deviceId === req?.session.deviceId,
    );

    if (!deviceSession) {
      throw new UnauthorizedException('Device session not found');
    }

    // 🚨 CRITICAL: Check if device has a secret (should always have with new model)
    if (!deviceSession.twoFactorSecret) {
      throw new UnauthorizedException('Device configuration error. Please login again.');
    }

    const cleanToken = token.toString().trim().replace(/\s/g, '');

    if (!cleanToken || cleanToken.length !== 6 || !/^\d+$/.test(cleanToken)) {
      throw new BadRequestException('Invalid OTP - must be 6 digits');
    }

    // 🚨 SECURE OTP VERIFICATION
    const isOtpValid = speakeasy.totp.verify({
      secret: deviceSession.twoFactorSecret, // 🎯 Now using session-specific secret
      encoding: 'base32',
      token: cleanToken,
      window: 0, // Strict - only current 30-second window
    });

    if (!isOtpValid) {
      throw new UnauthorizedException(
        'Invalid OTP code. Please use the current code from your authenticator app.'
      );
    }

    // ✅ MARK DEVICE AS VERIFIED
    deviceSession.twoFactorVerified = true;
    deviceSession.lastLogin = new Date();

    await user.save();

    // ✅ UPDATE SESSION
    Object.assign(req.session, {
      twoFactorPending: false,
      twoFactorVerified: true,
      authenticated: true,
    });

    await new Promise<void>((resolve, reject) =>
      req.session.save((err) => (err ? reject(err) : resolve())),
    );

    return {
      message: '2FA verification successful',
      verified: true,
      session: {
        twoFactorPending: req.session.twoFactorPending,
        twoFactorVerified: req.session.twoFactorVerified,
        authenticated: req.session.authenticated,
      },
    };
  }

  // Add these new methods for session management
  async logout(req: Request) {
    if (!req?.session?.user || !req?.session?.deviceId) {
      throw new UnauthorizedException('No active session');
    }

    const user = await this.userModel.findById(req.session.user._id);
    if (user) {
      // Remove the current device session
      user.sessions = user.sessions.filter(s => s.deviceId !== req.session.deviceId);
      await user.save();
    }

    // Destroy session
    await new Promise<void>((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    return { message: 'Logged out successfully' };
  }

  async logoutAllDevices(req: Request) {
    if (!req?.session?.user) {
      throw new UnauthorizedException('No active session');
    }

    const user = await this.userModel.findById(req.session.user._id);
    if (user) {
      // Keep only the current device session
      user.sessions = user.sessions.filter(s => s.deviceId === req.session.deviceId);
      await user.save();
    }

    return { message: 'Logged out from all other devices' };
  }

  async getActiveSessions(req: Request) {
    if (!req?.session?.user) {
      throw new UnauthorizedException('No active session');
    }

    const user = await this.userModel.findById(req.session.user._id);
    if (!user) throw new UnauthorizedException('User not found');

    return {
      currentDevice: req.session.deviceId,
      activeSessions: user.sessions
        .filter(s => s.twoFactorVerified)
        .map(s => ({
          deviceId: s.deviceId,
          lastLogin: s.lastLogin,
          isCurrent: s.deviceId === req.session.deviceId
        }))
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