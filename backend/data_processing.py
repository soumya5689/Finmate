import pandas as pd
import re
import nltk
from nltk.tokenize import word_tokenize
from nltk.tag import pos_tag
from datetime import date

try:
    nltk.data.find('taggers/averaged_perceptron_tagger')
except Exception:
    nltk.download('averaged_perceptron_tagger')
try:
    nltk.data.find('tokenizers/punkt')
except Exception:
    nltk.download('punkt')

def extract_payment_method_nltk(remark):
    words = word_tokenize(remark.lower())
    tagged_words = pos_tag(words)
    for word, tag in tagged_words:
        if word in ["paytm", "googlepay", "gpay", "bharatpe", "phonepe"]:
            return word.capitalize()
        elif word == "upi":
            for prev_word, prev_tag in tagged_words[:tagged_words.index((word, tag))]:
                if prev_tag == "IN" or prev_word == "via":
                    for next_word, next_tag in tagged_words[tagged_words.index((word, tag)) + 1:]:
                        if next_tag == "NNP" or next_tag == "NNPS":
                            return f"UPI via {next_word}"
                    break
            return "UPI"
        elif word == "eze": return "PhonePe"
        elif word == "mab": return "Bank Transfer"
        elif word == "vyapar": return "Other Merchant App"
        elif "@ok" in remark.lower(): return "BHIM/UPI"
        elif "stk-" in remark.lower(): return "Other Merchant Platform"
        elif "apollopharmacy" in remark.lower(): return "Apollo Pharmacy"
        elif re.search(r'/\w+/', remark):
            parts = remark.split('/')
            if len(parts) > 3:
                bank_code = parts[4] if len(parts) > 4 and '@' not in parts[4] else parts[3]
                return f"UPI via {bank_code}"
    return "Unknown"

def extract_recipient_nltk(remark):
    parts = remark.split('/DR/')
    if len(parts) > 1:
        recipient_part = parts[1].split('/')[0].strip()
        return recipient_part
    return "Unknown"

def clean_remarks_nltk(remark):
    parts = remark.split('/')
    if len(parts) > 4:
        return parts[-1].strip()
    return remark.strip()

def process_excel(file_path):
    
    try:
        excel_df = pd.read_excel(file_path)
        withdrawal_col = None
        for col in excel_df.columns:
            if 'withdrawal' in col.lower():
                withdrawal_col = col
                break
        if 'Remarks' in excel_df.columns and withdrawal_col:
            df = pd.DataFrame()
            df['Withdrawals'] = excel_df[withdrawal_col]
            df['Payment_Method'] = excel_df['Remarks'].apply(extract_payment_method_nltk)
            df['Recipient/Merchant'] = excel_df['Remarks'].apply(extract_recipient_nltk)
            df['Remarks'] = excel_df['Remarks']
            df['Cleaned Remarks'] = excel_df['Remarks'].apply(clean_remarks_nltk)
            df['Transaction_Date'] = date.today()
            return df
        else:
            return pd.DataFrame({'Error': ['Excel sheet must contain "Remarks" and a column with "withdrawal" in its name.']})
    except FileNotFoundError:
        return pd.DataFrame({'Error': ['File not found.']})
    except Exception as e:
        return pd.DataFrame({'Error': [f'An error occurred: {e}']})