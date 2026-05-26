from datetime import datetime, timedelta, timezone

from jose import jwt, JWTError
from passlib.context import CryptContext

from app.core.config import settings

# ─── Password Hashing ────────────────────────────────────────────────

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)


def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)


def verify_password(
    plain: str,
    hashed: str,
) -> bool:
    return pwd_context.verify(plain, hashed)


# ─── JWT Token ───────────────────────────────────────────────────────

def create_access_token(
    data: dict,
    expires_delta: timedelta | None = None,
):

    to_encode = data.copy()

    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(days=1)
    )

    to_encode.update({
        "exp": expire
    })

    return jwt.encode(
        to_encode,
        settings.secret_key,
        algorithm=settings.algorithm,
    )


def decode_access_token(token: str):

    try:

        payload = jwt.decode(
            token,
            settings.secret_key,
            algorithms=[settings.algorithm],
        )

        return payload

    except JWTError:

        return None