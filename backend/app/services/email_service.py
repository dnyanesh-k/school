import asyncio
import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.core.config import settings

logger = logging.getLogger(__name__)


def _smtp_configured() -> bool:
    return bool(settings.smtp_user and settings.smtp_password and settings.smtp_from_email)


def _send_sync(to_email: str, subject: str, text_body: str, html_body: str) -> None:
    message = MIMEMultipart("alternative")
    message["Subject"] = subject
    message["From"] = f"{settings.smtp_from_name} <{settings.smtp_from_email}>"
    message["To"] = to_email
    message.attach(MIMEText(text_body, "plain"))
    message.attach(MIMEText(html_body, "html"))

    with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=20) as server:
        server.starttls()
        server.login(settings.smtp_user, settings.smtp_password)
        server.sendmail(settings.smtp_from_email, [to_email], message.as_string())


async def send_welcome_email(to_email: str, admin_name: str, institute_name: str) -> None:
    subject = f"Welcome to {settings.smtp_from_name} — Registration Received"
    text_body = (
        f"Hi {admin_name},\n\n"
        f"Thank you for registering {institute_name} on {settings.smtp_from_name}.\n\n"
        "Our team will review your application and activate your account shortly. "
        "You'll receive another email once it's approved.\n\n"
        "Once approved, you can log in at: https://vidyatrackai.com\n\n"
        f"— The {settings.smtp_from_name} Team"
    )
    html_body = f"""
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111116; max-width: 480px;">
      <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 8px;">Welcome, {admin_name}!</h2>
      <p>Thank you for registering <strong>{institute_name}</strong> on {settings.smtp_from_name}.</p>
      <p>Our team will review your application and activate your account shortly.
         You will receive another email once it is approved.</p>
      <p>Once approved, log in at:
         <a href="https://vidyatrackai.com" style="color: #4f46e5; font-weight: 600;">vidyatrackai.com</a>
      </p>
      <p style="color: #6b6b80; font-size: 14px; margin-top: 24px;">— The {settings.smtp_from_name} Team</p>
    </div>
    """

    if not _smtp_configured():
        logger.info("SMTP not configured — skipping welcome email for %s", to_email)
        if settings.debug:
            print(f"[DEV] Welcome email to {to_email} ({institute_name})")
        return

    try:
        await asyncio.to_thread(_send_sync, to_email, subject, text_body, html_body)
    except Exception:
        logger.exception("Failed to send welcome email to %s", to_email)


async def send_password_reset_otp(to_email: str, otp: str) -> None:
    subject = f"{settings.smtp_from_name} password reset code"
    text_body = (
        f"Your password reset code is: {otp}\n\n"
        f"This code expires in {settings.otp_expire_minutes} minutes.\n"
        "If you did not request this, you can ignore this email."
    )
    html_body = f"""
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111116;">
      <p>Use this code to reset your password:</p>
      <p style="font-size: 28px; font-weight: 700; letter-spacing: 0.3em; margin: 16px 0;">{otp}</p>
      <p style="color: #6b6b80; font-size: 14px;">
        Expires in {settings.otp_expire_minutes} minutes.
      </p>
    </div>
    """

    if not _smtp_configured():
        logger.warning(
            "SMTP not configured — password reset OTP for %s: %s",
            to_email,
            otp,
        )
        if settings.debug:
            print(f"[DEV] Password reset OTP for {to_email}: {otp}")
        return

    await asyncio.to_thread(_send_sync, to_email, subject, text_body, html_body)
