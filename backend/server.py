import os
import hmac
import hashlib
import json
from urllib.parse import parse_qsl

from flask import Flask, request, jsonify

app = Flask(__name__)

# =========================
# ADMIN UID
# =========================

ADMIN_IDS = {
    "6650444747",
    "6597366825"
}


# =========================
# TELEGRAM INIT DATA VERIFY
# =========================

def verify_telegram_data(init_data):

    bot_token = os.environ.get("8020765987:AAG0zRVNV4v6nMRr1JH7s7uWIwfHj0gGz_Q")

    if not bot_token:
        return None

    try:
        data = dict(parse_qsl(init_data, keep_blank_values=True))

        received_hash = data.pop("hash", None)

        if not received_hash:
            return None

        data_check_string = "\n".join(
            f"{key}={data[key]}"
            for key in sorted(data)
        )

        secret_key = hmac.new(
            b"WebAppData",
            bot_token.encode(),
            hashlib.sha256
        ).digest()

        calculated_hash = hmac.new(
            secret_key,
            data_check_string.encode(),
            hashlib.sha256
        ).hexdigest()

        if not hmac.compare_digest(
            calculated_hash,
            received_hash
        ):
            return None

        return data

    except Exception:
        return None


# =========================
# ADMIN AUTHENTICATION
# =========================

@app.post("/api/admin/auth")
def admin_auth():

    body = request.get_json(silent=True) or {}

    init_data = body.get("initData", "")

    if not init_data:
        return jsonify({
            "ok": False,
            "message": "Telegram data missing"
        }), 400

    data = verify_telegram_data(init_data)

    if not data:
        return jsonify({
            "ok": False,
            "message": "Invalid Telegram authentication"
        }), 401

    try:
        user = json.loads(data.get("user", "{}"))
        user_id = str(user.get("id", ""))

    except Exception:
        return jsonify({
            "ok": False,
            "message": "Invalid user data"
        }), 401

    if user_id not in ADMIN_IDS:

        return jsonify({
            "ok": False,
            "message": "Access denied"
        }), 403

    return jsonify({
        "ok": True,
        "admin": True,
        "user_id": user_id,
        "message": "Admin authentication successful"
    })


# =========================
# HEALTH CHECK
# =========================

@app.get("/")
def home():

    return jsonify({
        "ok": True,
        "service": "AG EARN HUB Admin API"
    })


# =========================
# RUN
# =========================

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 5000))
)
