import os
import hmac
import hashlib
import json
import sqlite3
import time
import secrets
from urllib.parse import parse_qsl

from flask import Flask, request, jsonify
from flask_cors import CORS


# =========================================================
# AG EARN HUB — BACKEND V2
# =========================================================

app = Flask(__name__)

CORS(
    app,
    resources={r"/api/*": {"origins": "*"}},
    methods=["GET", "POST", "OPTIONS"]
)


# =========================================================
# CONFIG
# =========================================================

DB_PATH = os.environ.get(
    "DATABASE_PATH",
    "ag_earn_hub.db"
)

# Render / server environment variable
# DO NOT put the real bot token directly in this file.
BOT_TOKEN = os.environ.get("8020765987:AAG0zRVNV4v6nMRr1JH7s7uWIwfHj0gGz_Q", "")

ADMIN_IDS = {
    "6650444747",
    "6597366825"
}

AUTH_MAX_AGE = 24 * 60 * 60

NORMAL_DAILY_TASK_LIMIT = 10
PREMIUM_DAILY_TASK_LIMIT = 20

TASK_MIN_SECONDS = 10


# =========================================================
# TASK CONFIG
# =========================================================
#
# Actual AD NETWORK links / zone IDs will be inserted later.
#
# "verification": "manual"
# means the task is NOT automatically verified.
#
# Later supported ad-network postback/callback can change
# this to server-side verification.
#

TASKS = [

    {
        "id": "task_01",
        "title": "AD TASK 01",
        "network": "Monetag",
        "reward": 5,
        "url": "",
        "verification": "manual"
    },

    {
        "id": "task_02",
        "title": "AD TASK 02",
        "network": "Adsterra",
        "reward": 5,
        "url": "",
        "verification": "manual"
    },

    {
        "id": "task_03",
        "title": "AD TASK 03",
        "network": "AdMaven",
        "reward": 5,
        "url": "",
        "verification": "manual"
    },

    {
        "id": "task_04",
        "title": "AD TASK 04",
        "network": "Monetag",
        "reward": 5,
        "url": "",
        "verification": "manual"
    },

    {
        "id": "task_05",
        "title": "AD TASK 05",
        "network": "Adsterra",
        "reward": 5,
        "url": "",
        "verification": "manual"
    },

    {
        "id": "task_06",
        "title": "AD TASK 06",
        "network": "AdMaven",
        "reward": 5,
        "url": "",
        "verification": "manual"
    },

    {
        "id": "task_07",
        "title": "AD TASK 07",
        "network": "Monetag",
        "reward": 5,
        "url": "",
        "verification": "manual"
    },

    {
        "id": "task_08",
        "title": "AD TASK 08",
        "network": "Adsterra",
        "reward": 5,
        "url": "",
        "verification": "manual"
    },

    {
        "id": "task_09",
        "title": "AD TASK 09",
        "network": "AdMaven",
        "reward": 5,
        "url": "",
        "verification": "manual"
    },

    {
        "id": "task_10",
        "title": "AD TASK 10",
        "network": "Monetag",
        "reward": 5,
        "url": "",
        "verification": "manual"
    }

]


# =========================================================
# PREMIUM PLANS
# =========================================================

PREMIUM_PLANS = {

    "1_day": {
        "name": "1 Day",
        "duration_days": 1,
        "price": 10
    },

    "7_day": {
        "name": "7 Days",
        "duration_days": 7,
        "price": 50
    },

    "30_day": {
        "name": "30 Days",
        "duration_days": 30,
        "price": 150
    }

}


# =========================================================
# DATABASE
# =========================================================

def db():

    connection = sqlite3.connect(
        DB_PATH,
        timeout=30
    )

    connection.row_factory = sqlite3.Row

    return connection


def init_db():

    connection = db()

    cursor = connection.cursor()

    # -----------------------------------------
    # USERS
    # -----------------------------------------

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (

            id INTEGER PRIMARY KEY,

            username TEXT,
            first_name TEXT,
            last_name TEXT,

            coins INTEGER NOT NULL DEFAULT 0,

            premium INTEGER NOT NULL DEFAULT 0,

            premium_plan TEXT,
            premium_expires INTEGER DEFAULT 0,

            referral_code TEXT UNIQUE,
            referred_by TEXT,

            bonus_day INTEGER NOT NULL DEFAULT 1,
            bonus_last_claim INTEGER DEFAULT 0,

            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL

        )
    """)


    # -----------------------------------------
    # TASKS
    # -----------------------------------------

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS task_completions (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            user_id INTEGER NOT NULL,

            task_id TEXT NOT NULL,

            reward INTEGER NOT NULL,

            status TEXT NOT NULL DEFAULT 'started',

            started_at INTEGER NOT NULL,

            completed_at INTEGER DEFAULT 0,

            UNIQUE(user_id, task_id),

            FOREIGN KEY(user_id)
                REFERENCES users(id)

        )
    """)


    # -----------------------------------------
    # COIN LEDGER
    # -----------------------------------------

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS coin_ledger (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            user_id INTEGER NOT NULL,

            amount INTEGER NOT NULL,

            reason TEXT NOT NULL,

            reference TEXT,

            created_at INTEGER NOT NULL,

            FOREIGN KEY(user_id)
                REFERENCES users(id)

        )
    """)


    # -----------------------------------------
    # PAYMENTS
    # -----------------------------------------

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS payments (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            user_id INTEGER NOT NULL,

            method TEXT NOT NULL,

            plan TEXT NOT NULL,

            amount REAL NOT NULL,

            transaction_id TEXT NOT NULL,

            status TEXT NOT NULL DEFAULT 'pending',

            created_at INTEGER NOT NULL,

            verified_at INTEGER DEFAULT 0,

            verified_by INTEGER DEFAULT 0

        )
    """)


    # -----------------------------------------
    # REFERRALS
    # -----------------------------------------

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS referrals (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            referrer_id INTEGER NOT NULL,

            referred_id INTEGER NOT NULL,

            reward INTEGER NOT NULL DEFAULT 0,

            created_at INTEGER NOT NULL,

            UNIQUE(referrer_id, referred_id)

        )
    """)


    connection.commit()
    connection.close()


init_db()


# =========================================================
# HELPERS
# =========================================================

def now():
    return int(time.time())


def get_user(user_id):

    connection = db()

    user = connection.execute(
        """
        SELECT *
        FROM users
        WHERE id = ?
        """,
        (user_id,)
    ).fetchone()

    connection.close()

    return user


def create_referral_code(user_id):

    return "AG" + str(user_id)


def create_user(user):

    user_id = int(user["id"])

    timestamp = now()

    referral_code = create_referral_code(
        user_id
    )

    connection = db()

    connection.execute(
        """
        INSERT OR IGNORE INTO users
        (
            id,
            username,
            first_name,
            last_name,
            referral_code,
            created_at,
            updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (
            user_id,
            user.get("username"),
            user.get("first_name"),
            user.get("last_name"),
            referral_code,
            timestamp,
            timestamp
        )
    )

    connection.commit()
    connection.close()


def update_user(user):

    connection = db()

    connection.execute(
        """
        UPDATE users
        SET
            username = ?,
            first_name = ?,
            last_name = ?,
            updated_at = ?
        WHERE id = ?
        """,
        (
            user.get("username"),
            user.get("first_name"),
            user.get("last_name"),
            now(),
            int(user["id"])
        )
    )

    connection.commit()
    connection.close()


# =========================================================
# TELEGRAM AUTH
# =========================================================

def verify_telegram_data(init_data):

    if not BOT_TOKEN:
        return None

    if not init_data:
        return None

    try:

        data = dict(
            parse_qsl(
                init_data,
                keep_blank_values=True
            )
        )

        received_hash = data.pop(
            "hash",
            None
        )

        if not received_hash:
            return None


        auth_date = int(
            data.get(
                "auth_date",
                "0"
            )
        )

        # Prevent very old initData
        if now() - auth_date > AUTH_MAX_AGE:
            return None


        data_check_string = "\n".join(
            f"{key}={data[key]}"
            for key in sorted(data)
        )


        secret_key = hmac.new(
            b"WebAppData",
            BOT_TOKEN.encode(),
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


# =========================================================
# AUTH MIDDLEWARE HELPER
# =========================================================

def authenticated_user():

    init_data = request.headers.get(
        "X-Telegram-Init-Data",
        ""
    )

    if not init_data:

        body = request.get_json(
            silent=True
        ) or {}

        init_data = body.get(
            "initData",
            ""
        )


    data = verify_telegram_data(
        init_data
    )

    if not data:
        return None


    try:

        user = json.loads(
            data.get(
                "user",
                "{}"
            )
        )

        if not user.get("id"):
            return None

        create_user(user)
        update_user(user)

        return user

    except Exception:
        return None


# =========================================================
# SERIALIZE USER
# =========================================================

def user_payload(user_id):

    user = get_user(user_id)

    if not user:
        return None


    premium_active = (
        int(user["premium"]) == 1
        and int(user["premium_expires"] or 0) > now()
    )


    if (
        int(user["premium"]) == 1
        and not premium_active
    ):

        connection = db()

        connection.execute(
            """
            UPDATE users
            SET
                premium = 0,
                premium_plan = NULL
            WHERE id = ?
            """,
            (user_id,)
        )

        connection.commit()
        connection.close()

        user = get_user(user_id)


    return {
        "id": user["id"],
        "username": user["username"],
        "first_name": user["first_name"],
        "last_name": user["last_name"],

        "coins": user["coins"],

        "premium": premium_active,
        "premium_plan": (
            user["premium_plan"]
            if premium_active
            else None
        ),

        "premium_expires": (
            user["premium_expires"]
            if premium_active
            else 0
        ),

        "referral_code": user["referral_code"],

        "bonus_day": user["bonus_day"],
        "bonus_last_claim": user["bonus_last_claim"]
    }


# =========================================================
# HEALTH
# =========================================================

@app.get("/")
def home():

    return jsonify({
        "ok": True,
        "service": "AG EARN HUB API",
        "version": "2.0",
        "database": "online"
    })


# =========================================================
# AUTH
# =========================================================

@app.post("/api/auth")
def auth():

    user = authenticated_user()

    if not user:

        return jsonify({
            "ok": False,
            "message": "Invalid Telegram authentication"
        }), 401


    return jsonify({
        "ok": True,
        "user": user_payload(
            int(user["id"])
        )
    })


# =========================================================
# ADMIN AUTH
# =========================================================

@app.post("/api/admin/auth")
def admin_auth():

    user = authenticated_user()

    if not user:

        return jsonify({
            "ok": False,
            "message": "Invalid Telegram authentication"
        }), 401


    user_id = str(
        user["id"]
    )

    if user_id not in ADMIN_IDS:

        return jsonify({
            "ok": False,
            "message": "Access denied"
        }), 403


    return jsonify({
        "ok": True,
        "admin": True,
        "user_id": user_id
    })


# =========================================================
# GET USER
# =========================================================

@app.get("/api/user")
def api_user():

    user = authenticated_user()

    if not user:

        return jsonify({
            "ok": False,
            "message": "Authentication required"
        }), 401


    return jsonify({
        "ok": True,
        "user": user_payload(
            int(user["id"])
        )
    })


# =========================================================
# GET TASKS
# =========================================================

@app.get("/api/tasks")
def get_tasks():

    user = authenticated_user()

    if not user:

        return jsonify({
            "ok": False,
            "message": "Authentication required"
        }), 401


    user_id = int(user["id"])

    current_user = get_user(
        user_id
    )


    premium_active = (
        int(current_user["premium"]) == 1
        and int(current_user["premium_expires"] or 0) > now()
    )


    limit = (
        PREMIUM_DAILY_TASK_LIMIT
        if premium_active
        else NORMAL_DAILY_TASK_LIMIT
    )


    connection = db()

    completed_rows = connection.execute(
        """
        SELECT task_id, status, completed_at
        FROM task_completions
        WHERE user_id = ?
        """,
        (user_id,)
    ).fetchall()

    connection.close()


    completed = {
        row["task_id"]: row["status"]
        for row in completed_rows
    }


    output = []


    for task in TASKS:

        output.append({
            **task,
            "completed": (
                completed.get(task["id"])
                == "completed"
            )
        })


    completed_count = sum(
        1
        for value in completed.values()
        if value == "completed"
    )


    return jsonify({

        "ok": True,

        "limit": limit,

        "completed_count":
            completed_count,

        "premium":
            premium_active,

        "tasks":
            output

    })


# =========================================================
# START TASK
# =========================================================

@app.post("/api/tasks/start")
def start_task():

    user = authenticated_user()

    if not user:

        return jsonify({
            "ok": False,
            "message": "Authentication required"
        }), 401


    body = request.get_json(
        silent=True
    ) or {}


    task_id = body.get(
        "task_id",
        ""
    )


    task = next(
        (
            item
            for item in TASKS
            if item["id"] == task_id
        ),
        None
    )


    if not task:

        return jsonify({
            "ok": False,
            "message": "Task not found"
        }), 404


    user_id = int(
        user["id"]
    )


    connection = db()


    existing = connection.execute(
        """
        SELECT *
        FROM task_completions
        WHERE user_id = ?
        AND task_id = ?
        """,
        (
            user_id,
            task_id
        )
    ).fetchone()


    if existing and existing["status"] == "completed":

        connection.close()

        return jsonify({
            "ok": False,
            "message": "Task already completed"
        }), 400


    timestamp = now()


    if existing:

        connection.execute(
            """
            UPDATE task_completions
            SET
                status = 'started',
                started_at = ?,
                completed_at = 0
            WHERE user_id = ?
            AND task_id = ?
            """,
            (
                timestamp,
                user_id,
                task_id
            )
        )

    else:

        connection.execute(
            """
            INSERT INTO task_completions
            (
                user_id,
                task_id,
                reward,
                status,
                started_at
            )
            VALUES (?, ?, ?, 'started', ?)
            """,
            (
                user_id,
                task_id,
                task["reward"],
                timestamp
            )
        )


    connection.commit()
    connection.close()


    return jsonify({

        "ok": True,

        "task": task,

        "message":
            "Task started",

        "minimum_seconds":
            TASK_MIN_SECONDS

    })


# =========================================================
# COMPLETE TASK
# =========================================================
#
# IMPORTANT:
# This endpoint does NOT claim that an external ad was
# actually viewed/clicked.
#
# It only completes tasks configured for manual/internal
# verification.
#
# Real network postback can be added later.
# =========================================================

@app.post("/api/tasks/complete")
def complete_task():

    user = authenticated_user()

    if not user:

        return jsonify({
            "ok": False,
            "message": "Authentication required"
        }), 401


    body = request.get_json(
        silent=True
    ) or {}


    task_id = body.get(
        "task_id",
        ""
    )


    task = next(
        (
            item
            for item in TASKS
            if item["id"] == task_id
        ),
        None
    )


    if not task:

        return jsonify({
            "ok": False,
            "message": "Task not found"
        }), 404


    user_id = int(
        user["id"]
    )


    connection = db()


    row = connection.execute(
        """
        SELECT *
        FROM task_completions
        WHERE user_id = ?
        AND task_id = ?
        """,
        (
            user_id,
            task_id
        )
    ).fetchone()


    if not row:

        connection.close()

        return jsonify({
            "ok": False,
            "message": "Start the task first"
        }), 400


    if row["status"] == "completed":

        connection.close()

        return jsonify({
            "ok": False,
            "message": "Task already completed"
        }), 400


    elapsed = now() - int(
        row["started_at"]
    )


    if elapsed < TASK_MIN_SECONDS:

        connection.close()

        return jsonify({
            "ok": False,
            "message":
                f"Please wait {TASK_MIN_SECOND
