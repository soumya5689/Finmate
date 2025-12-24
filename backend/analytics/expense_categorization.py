def categorize_expense(row):
    recipient = str(row.get("recipient_merchant", "")).lower()
    remarks = str(row.get("cleaned_remarks", "")).lower()
    payment = str(row.get("payment_method", "")).lower()

    # FOOD
    if any(x in recipient for x in ["swiggy", "zomato", "cafe", "coffee", "restaurant"]):
        return "Food"

    # SHOPPING
    if any(x in recipient for x in ["amazon", "flipkart", "meesho", "myntra"]):
        return "Shopping"

    # UTILITIES
    if any(x in remarks for x in ["recharge", "electricity", "gas", "bill"]):
        return "Utilities"

    # HEALTHCARE
    if any(x in recipient for x in ["pharmacy", "apollo", "medical"]):
        return "Healthcare"

    # RENT / HOUSING
    if any(x in remarks for x in ["rent", "house"]):
        return "Housing"

    # TRANSFER
    if "upi" in payment or "bank" in payment:
        return "Transfer"

    return "Others"
