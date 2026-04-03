import mysql.connector
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create a connection to the database with retry
import time

conn = None
for _attempt in range(30):
    try:
        conn = mysql.connector.connect(
            database=os.getenv("MYSQL_DATABASE"),
            user=os.getenv("MYSQL_USER"),
            password=os.getenv("MYSQL_ROOT_PASSWORD"),
            port=3306,
            host=os.getenv("MYSQL_HOST"))
        break
    except mysql.connector.Error:
        time.sleep(5)

if conn is None:
    raise Exception("Could not connect to MySQL after 30 attempts")

class UserCreate(BaseModel):
    name: str
    email: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None

@app.get("/users")
async def get_users():
    cursor = conn.cursor()
    sql_select_Query = "select * from utilisateur"
    cursor.execute(sql_select_Query)
    # get all records
    records = cursor.fetchall()
    print("Total number of rows in table: ", cursor.rowcount)
    # renvoyer nos données et 200 code OK
    return {'utilisateurs': records}

@app.get("/users/{user_id}")
async def get_user(user_id: int):
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM utilisateur WHERE id = %s", (user_id,))
    record = cursor.fetchone()
    if not record:
        raise HTTPException(status_code=404, detail="User not found")
    return {'utilisateur': record}

@app.post("/users", status_code=201)
async def create_user(user: UserCreate):
    cursor = conn.cursor()
    cursor.execute("INSERT INTO utilisateur (name, email) VALUES (%s, %s)", (user.name, user.email))
    conn.commit()
    return {'utilisateur': {'id': cursor.lastrowid, 'name': user.name, 'email': user.email}}

@app.put("/users/{user_id}")
async def replace_user(user_id: int, user: UserCreate):
    cursor = conn.cursor()
    cursor.execute("UPDATE utilisateur SET name = %s, email = %s WHERE id = %s", (user.name, user.email, user_id))
    conn.commit()
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {'utilisateur': {'id': user_id, 'name': user.name, 'email': user.email}}

@app.patch("/users/{user_id}")
async def update_user(user_id: int, user: UserUpdate):
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM utilisateur WHERE id = %s", (user_id,))
    existing = cursor.fetchone()
    if not existing:
        raise HTTPException(status_code=404, detail="User not found")
    name = user.name if user.name is not None else existing[1]
    email = user.email if user.email is not None else existing[2]
    cursor.execute("UPDATE utilisateur SET name = %s, email = %s WHERE id = %s", (name, email, user_id))
    conn.commit()
    return {'utilisateur': {'id': user_id, 'name': name, 'email': email}}

@app.delete("/users/{user_id}")
async def delete_user(user_id: int):
    cursor = conn.cursor()
    cursor.execute("DELETE FROM utilisateur WHERE id = %s", (user_id,))
    conn.commit()
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {'message': 'User deleted'}
