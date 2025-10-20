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
import type { Request } from 'express';
import { UpdateProfileDto } from './dto/profile.dto';

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) { }

  /**
   * LOGIN + Generate QR (if new user or first time setup)
   */
  async auth(data: AuthDto, req: Request) {
    const user = await this.userModel.findOne({ name: data.name });
    if (!user) throw new UnauthorizedException('User not found');

    const passwordMatches = await argon2.verify(user.password, data.password);
    if (!passwordMatches) throw new UnauthorizedException('Invalid password');

    let qrCodeDataUrl: string | null = null;

    // Generate secret + QR only if first time
    if (!user.twoFactorSecret) {
      const secret = speakeasy.generateSecret({
        name: `ExpenseManagement:${user.name}`,
        issuer: 'ExpenseManagement',
      });

      user.twoFactorSecret = secret.base32;
      await user.save();

      qrCodeDataUrl = await qrcode.toDataURL(secret.otpauth_url);
    }

    // ✅ Session state for "waiting OTP verification"
    req.session.user = user;
    req.session.twoFactorPending = true;
    req.session.twoFactorVerified = false;
    req.session.authenticated = false;
    await this.saveSession(req);

    return {
      qr: qrCodeDataUrl,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        twoFactorPending: true,
        twoFactorVerified: false,
        authenticated: false,
        has2FA: !!user.twoFactorSecret,
      },
    };
  }


  async getAll() {
    const users = await this.userModel
      .find({}, { password: 0, __v: 0 }) // exclude sensitive data
      .sort({ createdAt: -1 })
      .lean();

    if (!users || users.length === 0) {
      throw new NotFoundException('No users found in the system');
    }

    return {
      count: users.length,
      users,
    };
  }
  /**
   * Verify OTP and complete login
   */
  async verify2fa(otp: string, req: Request) {
    const user = await this.userModel.findById(req?.session?.user?._id);
    if (!user || !user.twoFactorSecret) {
      throw new UnauthorizedException('2FA not configured for this user');
    }

    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: otp,
      window: 2,
    });

    if (!isValid) {
      throw new UnauthorizedException('Invalid OTP');
    }

    // ✅ Update session to mark authenticated + verified
    req.session.user = user
    req.session.twoFactorPending = false;
    req.session.twoFactorVerified = true;
    req.session.authenticated = true;
    await this.saveSession(req);

    return {
      message: '2FA verification successful',
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


  /**
   * Logout
   */
  async logout(req: Request) {
    await new Promise<void>((resolve, reject) =>
      req.session.destroy((err) => (err ? reject(err) : resolve())),
    );
    return { message: 'Logged out successfully' };
  }

  /**
   * Fetch active session data
   */
  async getSessionData(req: Request) {
    const { session } = req;
    if (!session?.user) throw new UnauthorizedException('Session expired');

    const user = await this.userModel
      .findById(session.user._id)
      .select(
        'name email role userLoc phone spentAmount reimbursedAmount allocatedAmount budgetLeft',
      )
      .lean();

    return {
      user,
      twoFactorPending: session.twoFactorPending,
      authenticated: session.authenticated,
    };
  }

  /**
   * Create new user
   */
  async createNewUser(dto: CreateUserDto) {
    const existing = await this.userModel.findOne({ name: dto.name });
    if (existing) throw new BadRequestException('User already exists');

    const hashedPassword = await argon2.hash(dto.password);

    const newUser = new this.userModel({
      ...dto,
      password: hashedPassword,
    });
    await newUser.save();

    return {
      id: newUser._id,
      name: newUser.name,
      role: newUser.role,
      userLoc: newUser.userLoc,
    };
  }

  /**
   * Update user profile
   */
  async updateProfile(updateProfileDto: UpdateProfileDto, userId: string) {
    if (!userId || userId === 'undefined') {
      throw new BadRequestException('Invalid user ID');
    }

    const existingUser = await this.userModel.findById(userId);
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    const updateData: any = { ...updateProfileDto };

    // Email uniqueness check
    if (
      updateProfileDto.email &&
      updateProfileDto.email !== existingUser.email
    ) {
      const emailExists = await this.userModel.findOne({
        email: updateProfileDto.email,
        _id: { $ne: userId },
      });
      if (emailExists) {
        throw new ConflictException('Email already exists');
      }
    }

    // Phone uniqueness check
    if (
      updateProfileDto.phone &&
      updateProfileDto.phone !== existingUser.phone
    ) {
      const phoneExists = await this.userModel.findOne({
        phone: updateProfileDto.phone,
        _id: { $ne: userId },
      });
      if (phoneExists) {
        throw new ConflictException('Phone number already exists');
      }
    }

    // Password hashing
    if (updateProfileDto.password) {
      const hashedPassword = await argon2.hash(updateProfileDto.password);
      updateData.password = hashedPassword;
    }

    // Clean undefined values
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) delete updateData[key];
    });

    const updatedUser = await this.userModel
      .findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true,
      })
      .select('-password -twoFactorSecret');

    if (!updatedUser) {
      throw new NotFoundException('User not found after update');
    }

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

  private async saveSession(req: Request) {
    await new Promise<void>((resolve, reject) =>
      req.session.save((err) => (err ? reject(err) : resolve())),
    );
  }

  /**
 * Reset user password (admin or self-service)
 */
  async resetUserPassword(userId: string, newPassword: string) {
    if (!userId || userId === 'undefined') {
      throw new BadRequestException('Invalid user ID');
    }

    if (!newPassword || newPassword.trim().length < 6) {
      throw new BadRequestException('Password must be at least 6 characters long');
    }

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const hashedPassword = await argon2.hash(newPassword);
    user.password = hashedPassword;
    await user.save();

    return {
      message: 'Password reset successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

}
