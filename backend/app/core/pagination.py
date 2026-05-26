from app.schemas.pagination import DEFAULT_PAGE, DEFAULT_PAGE_SIZE, normalize_page


def slice_page(page: int, page_size: int) -> tuple[int, int, int]:
    page, page_size = normalize_page(page, page_size)
    offset = (page - 1) * page_size
    return page, page_size, offset
