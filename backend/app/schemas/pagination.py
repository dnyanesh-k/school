from typing import Generic, TypeVar

from pydantic import BaseModel, Field

T = TypeVar("T")

DEFAULT_PAGE = 1
DEFAULT_PAGE_SIZE = 15
MAX_PAGE_SIZE = 50


class PaginatedResponse(BaseModel, Generic[T]):
    items: list[T]
    total: int
    page: int
    page_size: int
    total_pages: int


def normalize_page(page: int, page_size: int) -> tuple[int, int]:
    safe_page = max(page, 1)
    safe_size = min(max(page_size, 1), MAX_PAGE_SIZE)
    return safe_page, safe_size


def total_pages(total: int, page_size: int) -> int:
    if total <= 0:
        return 1
    return (total + page_size - 1) // page_size


def build_paginated(items: list[T], total: int, page: int, page_size: int) -> PaginatedResponse[T]:
    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages(total, page_size),
    )
