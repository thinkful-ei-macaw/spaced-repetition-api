# Spaced Repetition Capstone - Api

Written by Sara Mills and Brandon Leek

## Link to heroku server

https://intense-stream-48886.herokuapp.com/

## Link to live app

https://spaced-repetition-sb.now.sh/

## Link to client repo

https://github.com/thinkful-ei-macaw/spaced-repetition-client-Brandon-Sara

## Link to server repo

https://github.com/thinkful-ei-macaw/spaced-repetition-api-Brandon-Sara

## Summary

This is an app to start learning Spanish using the spaced repetition technique.

## Endpoints

POST
/api/auth/token: login route, expects
"username": string
"password": string
returns auth token

POST
/api/user register route, expects
"name": string
"username": string
"password": string
adds new user to database

GET
/api/language
retrieves user name, language, and words to practice

GET
/api/language/head
retrieves the first word to practice

POST
/api/language/guess expects
"guess": string
checks if word is correct and returns the result as well as the next word to be practiced

### Tech used

Languages/Frameworks: Javascript, Node, Express, PSQL, Knex

Middleware: Cors, Helmet, Morgan, JWT

Testing: Mocha, Chai, Supertest

### Local dev setup

If using user `dunder_mifflin`:

```bash
mv example.env .env
createdb -U dunder_mifflin spaced-repetition
createdb -U dunder_mifflin spaced-repetition-test
```

to seed tables:
psql -U dunder_mifflin -d spaced-repetition -f ./seeds/seed.tables.sql

If your `dunder_mifflin` user has a password be sure to set it in `.env` for all appropriate fields. Or if using a different user, update appropriately.

```bash
npm install
npm run migrate
env MIGRATION_DATABASE_NAME=spaced-repetition-test npm run migrate
```

And `npm test` should work at this point

## Configuring Postgres

For tests involving time to run properly, configure your Postgres database to run in the UTC timezone.

1. Locate the `postgresql.conf` file for your Postgres installation.
   1. E.g. for an OS X, Homebrew install: `/usr/local/var/postgres/postgresql.conf`
   2. E.g. on Windows, _maybe_: `C:\Program Files\PostgreSQL\11.2\data\postgresql.conf`
   3. E.g on Ubuntu 18.04 probably: '/etc/postgresql/10/main/postgresql.conf'
2. Find the `timezone` line and set it to `UTC`:

```conf
# - Locale and Formatting -

datestyle = 'iso, mdy'
#intervalstyle = 'postgres'
timezone = 'UTC'
#timezone_abbreviations = 'Default'     # Select the set of available time zone
```

## Scripts

Start the application `npm start`

Start nodemon for the application `npm run dev`

Run the tests mode `npm test`

Run the migrations up `npm run migrate`

Run the migrations down `npm run migrate -- 0`
