
import mysql.connector
import requests
import time
import subprocess
import os
import sys

def verify_database():
    print("🔍 Verifying database tables...")
    try:
        connection = mysql.connector.connect(
            host='127.0.0.1',
            port=3306,
            user='root',
            password='Evolvetechsolutions123@',
            database='eletrostart_db'
        )
        print(f"   MySQL Connector Version: {mysql.connector.__version__}")
        
        cursor = connection.cursor()
        cursor.execute("SHOW DATABASES")
        dbs = [db[0] for db in cursor.fetchall()]
        print(f"   Databases found: {dbs}")
        
        cursor.execute("SHOW TABLES")
        tables = [table[0] for table in cursor.fetchall()]
        print(f"   Tables found: {tables}")
        
        expected_tables = ['contact_messages', 'admin_users', 'tags', 'products', 'orders']
        missing = [t for t in expected_tables if t not in tables]
        
        if missing:
            print(f"❌ Missing tables: {missing}")
            return False
        
        print("✅ Database verification passed.")
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

def test_api_integration():
    print("\n🚀 Testing API integration...")
    
    # Payload similar to site form
    payload = {
        "nome": "Integration Test User",
        "email": "test@integration.com",
        "telefone": "11999999999",
        "assunto": "Teste de Integração MySQL",
        "mensagem": "Esta é uma mensagem de teste para verificar a gravação no MySQL."
    }
    
    try:
        response = requests.post("http://127.0.0.1:3001/api/messages", json=payload)
        
        if response.status_code in [200, 201]:
            print(f"✅ API Request successful: {response.status_code}")
            return True
        else:
            print(f"❌ API Request failed: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ API Request error: {e}")
        return False

def verify_record_in_db():
    print("\n🔍 Verifying record in database...")
    try:
        connection = mysql.connector.connect(
            host='127.0.0.1',
            port=3306,
            user='root',
            password='Evolvetechsolutions123@',
            database='eletrostart_db'
        )
        cursor = connection.cursor()
        cursor.execute("SELECT name, email, message FROM contact_messages WHERE email = 'test@integration.com'")
        record = cursor.fetchone()
        
        if record:
            print(f"✅ Record found in MySQL: {record}")
            return True
        else:
            print("❌ Record NOT found in MySQL")
            return False
            
    except Exception as e:
        print(f"❌ Database check failed: {e}")
        return False

if __name__ == "__main__":
    verify_database()
    
    # We assume server is running separately or we can try to wait for it
    # For now, let's just run the API test and DB check
    if test_api_integration():
        time.sleep(1)
        verify_record_in_db()
