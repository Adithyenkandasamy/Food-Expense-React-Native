"""
MessMate - Utility helpers
Unique ID generation, invite code generation, pagination helpers.
"""
import random
import string
from typing import Optional


def generate_unique_user_id() -> str:
    """
    Generate a unique user ID in the format MM-XXXXXX
    where X is an alphanumeric uppercase character.
    Example: MM-5GFK28
    """
    chars = string.ascii_uppercase + string.digits
    random_part = "".join(random.choices(chars, k=6))
    return f"MM-{random_part}"


def generate_invite_code(length: int = 8) -> str:
    """
    Generate a random invite code for groups.
    Example: A8K3M2P1
    """
    chars = string.ascii_uppercase + string.digits
    return "".join(random.choices(chars, k=length))


def paginate_params(
    page: int = 1,
    page_size: int = 20,
) -> dict:
    """Convert page/page_size to offset/limit for SQL queries."""
    page = max(1, page)
    page_size = max(1, min(100, page_size))
    return {
        "offset": (page - 1) * page_size,
        "limit": page_size,
        "page": page,
        "page_size": page_size,
    }
