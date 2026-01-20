import mysql.connector
try:
    mydb = mysql.connector.connect(host="127.0.0.1", user="root", password="Evolvetechsolutions123@")
    mycursor = mydb.cursor()
    mycursor.execute("DROP DATABASE IF EXISTS eletrostart_db")
    mydb.commit()
    print("Dropped database.")
except Exception as e:
    print(f"Error dropping database: {e}")
