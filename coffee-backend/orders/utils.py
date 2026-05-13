import re

def format_kenyan_phone(phone):

    if not phone:
        return None

    # remove everything except digits
    phone = re.sub(r"\D", "", phone)

    # 07XXXXXXXX → 2547XXXXXXXX
    if phone.startswith("0"):
        phone = "254" + phone[1:]

    # 7XXXXXXXX or 1XXXXXXXX → 2547XXXXXXXX
    elif phone.startswith("7") or phone.startswith("1"):
        phone = "254" + phone

    # validate final format
    if not phone.startswith("254") or len(phone) != 12:
        raise ValueError(f"Invalid Kenyan phone format: {phone}")

    return phone