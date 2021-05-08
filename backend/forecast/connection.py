import psycopg2

PGHOST = 'localhost'
PGDATABASE = 'exchanges'
PGUSER = 'postgres'
PGPASSWORD = 'postgre'
PGPORT = '5432'

conn_string = "host=" + PGHOST + " port=" + PGPORT + " dbname=" + \
    PGDATABASE + " user=" + PGUSER + " password=" + PGPASSWORD

conn = psycopg2.connect(conn_string)
print("Connected!")
