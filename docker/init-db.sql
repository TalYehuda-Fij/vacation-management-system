SELECT 'CREATE DATABASE vacation_test'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'vacation_test')\gexec
