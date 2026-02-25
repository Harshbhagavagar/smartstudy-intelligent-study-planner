from datetime import date


def calculate_priority_score(*, deadline: date, effort: int, complexity: int) -> float:
    """
    Simple, explainable scoring:

    - Base urgency from days left (sooner deadline -> higher score).
    - Effort and complexity add weight.

    Example used in Phase 2 docs:
    - Task A: due in 2 days, effort 8
    - Task B: due in 10 days, effort 3

    Task A should rank higher.
    """
    today = date.today()
    days_left = max((deadline - today).days, 0)

    # Invert days_left so smaller days_left -> larger urgency component.
    # Adding 1 to avoid division by zero.
    urgency = 1 / (days_left + 1)

    # Effort and complexity increase the score linearly.
    score = urgency * 100 + effort * 2 + complexity
    return float(score)

