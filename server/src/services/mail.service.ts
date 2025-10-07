/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

export interface EmailOptions {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
    attachments?: Array<{
        filename: string;
        path?: string;
        content?: Buffer;
        contentType?: string;
    }>;
}

@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);
    private transporter: nodemailer.Transporter;

    constructor() {

        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        });
    }


    async sendEmail(options: EmailOptions): Promise<boolean> {
        try {
            const mailOptions = {
                from: process.env.GMAIL_FROM || `"ExpenseTracker" <${process.env.GMAIL_USER}>`,
                ...options,
            };

            const result = await this.transporter.sendMail(mailOptions);
            this.logger.log(`✅ Email sent to ${options.to}: ${result.messageId}`);
            return true;
        } catch (error) {
            this.logger.error('❌ Failed to send email:', error);
            return false;
        }
    }
}