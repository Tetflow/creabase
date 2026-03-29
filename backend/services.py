"""
Service utilities for external integrations
"""
import os
import logging
from typing import Optional
from datetime import datetime

logger = logging.getLogger(__name__)

# Email Service
class EmailService:
    """Email notifications via SendGrid/Resend"""
    
    @staticmethod
    async def send_email(to: str, subject: str, body: str, html: Optional[str] = None):
        """Send email notification"""
        email_api_key = os.environ.get('EMAIL_API_KEY')
        
        if not email_api_key:
            logger.warning(f"Email API not configured. Would send: {subject} to {to}")
            return {"status": "mock", "message": "Email API not configured"}
        
        # TODO: Replace with actual SendGrid/Resend integration when API key provided
        logger.info(f"Sending email to {to}: {subject}")
        return {"status": "sent", "to": to}
    
    @staticmethod
    async def send_project_created(business_email: str, creator_email: str, project_title: str):
        """Notify about new project"""
        await EmailService.send_email(
            to=creator_email,
            subject=f"New Project Offer: {project_title}",
            body="You have received a new project offer. Login to Creabase to view details."
        )
        await EmailService.send_email(
            to=business_email,
            subject=f"Project Created: {project_title}",
            body="Your project has been created successfully. Waiting for creator response."
        )
    
    @staticmethod
    async def send_payment_received(creator_email: str, amount: float):
        """Notify about payment"""
        await EmailService.send_email(
            to=creator_email,
            subject=f"Payment Received: ₹{amount}",
            body=f"Congratulations! You've received a payment of ₹{amount}. Check your Creabase dashboard."
        )
    
    @staticmethod
    async def send_verification_complete(creator_email: str, platform: str):
        """Notify about successful verification"""
        await EmailService.send_email(
            to=creator_email,
            subject=f"{platform.title()} Account Verified!",
            body=f"Your {platform} account has been successfully verified on Creabase."
        )

# SMS Service
class SMSService:
    """SMS notifications via Twilio"""
    
    @staticmethod
    async def send_sms(to: str, message: str):
        """Send SMS notification"""
        twilio_sid = os.environ.get('TWILIO_ACCOUNT_SID')
        
        if not twilio_sid:
            logger.warning(f"SMS API not configured. Would send to {to}: {message}")
            return {"status": "mock"}
        
        # TODO: Replace with actual Twilio integration when credentials provided
        logger.info(f"Sending SMS to {to}")
        return {"status": "sent"}
    
    @staticmethod
    async def send_otp(phone: str, otp: str):
        """Send OTP for verification"""
        message = f"Your Creabase OTP is: {otp}. Valid for 10 minutes."
        return await SMSService.send_sms(phone, message)

# File Upload Service
class FileUploadService:
    """File uploads to S3/Object Storage"""
    
    @staticmethod
    async def upload_file(file_data: bytes, filename: str, folder: str = "uploads") -> str:
        """Upload file and return URL"""
        storage_endpoint = os.environ.get('OBJECT_STORAGE_ENDPOINT')
        
        if not storage_endpoint:
            logger.warning(f"Object storage not configured. File: {filename}")
            # Return mock URL for development
            return f"https://storage.creabase.com/{folder}/{filename}"
        
        # TODO: Replace with actual S3/Object Storage integration when credentials provided
        # Example with boto3:
        # s3_client.upload_fileobj(file_data, bucket, f"{folder}/{filename}")
        
        logger.info(f"Uploading file: {filename} to {folder}")
        return f"{storage_endpoint}/{folder}/{filename}"
    
    @staticmethod
    async def delete_file(file_url: str) -> bool:
        """Delete file from storage"""
        storage_endpoint = os.environ.get('OBJECT_STORAGE_ENDPOINT')
        
        if not storage_endpoint:
            logger.warning(f"Would delete file: {file_url}")
            return True
        
        # TODO: Implement actual deletion
        logger.info(f"Deleting file: {file_url}")
        return True

# Notification Service
class NotificationService:
    """In-app notifications"""
    
    @staticmethod
    async def create_notification(db, user_id: str, title: str, message: str, notification_type: str = "info", link: Optional[str] = None):
        """Create in-app notification"""
        notification = {
            "notification_id": f"notif_{datetime.now().timestamp()}",
            "user_id": user_id,
            "title": title,
            "message": message,
            "type": notification_type,
            "link": link,
            "read": False,
            "created_at": datetime.now()
        }
        await db.notifications.insert_one(notification)
        return notification
    
    @staticmethod
    async def send_multi_channel(db, user_id: str, email: str, phone: str, title: str, message: str):
        """Send notification via multiple channels"""
        # In-app
        await NotificationService.create_notification(db, user_id, title, message)
        # Email
        await EmailService.send_email(email, title, message)
        # SMS (for critical notifications only)
        # await SMSService.send_sms(phone, message)
