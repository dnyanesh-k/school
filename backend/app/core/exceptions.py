# app/core/exceptions.py

class AppException(Exception):

    def __init__(
        self,
        status_code: int,
        message: str,
        error_code: str,
    ):
        self.status_code = status_code
        self.message = message
        self.error_code = error_code


class NotFoundError(AppException):
    def __init__(self, resource: str):
        super().__init__(
            status_code=404,
            message=f"{resource} not found",
            error_code="NOT_FOUND"
        )


class ValidationError(AppException):
    def __init__(self, message: str):
        super().__init__(
            status_code=400,
            message=message,
            error_code="VALIDATION_ERROR"
        )


class ConflictError(AppException):
    def __init__(self, message: str):
        super().__init__(
            status_code=409,
            message=message,
            error_code="CONFLICT"
        )


class UnauthorizedError(AppException):
    def __init__(self, message: str = "Unauthorized"):
        super().__init__(
            status_code=401,
            message=message,
            error_code="UNAUTHORIZED"
        )


class ForbiddenError(AppException):
    def __init__(self, message: str = "Forbidden"):
        super().__init__(
            status_code=403,
            message=message,
            error_code="FORBIDDEN"
        )
