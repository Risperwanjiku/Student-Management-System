# Student Management System

A web based Student Management System built for Ikonex Academy. It lets an admin manage class streams, students, and subjects, record exam and assessment scores, process results (grades, positions and class ranking), and generate PDF report cards.

## Live demo

- **App:** https://ikonex-academy-bpzn.onrender.com
- **Login:** click **Sign in as demo admin**

> Note: the app is hosted on free tiers, so if it has been idle for a while the **first load can take up to a minute** while the backend wakes up. After that it runs normally.

## Tech stack

- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Database:** MySQL
- **Auth:** JWT with bcrypt password hashing
- **Reports:** jsPDF (PDF report cards and class reports)
- **Hosting:** Render (frontend static site + backend web service) and Aiven (MySQL)

## Project structure

```
Student-Management-System/
├── client/        react frontend (vite)
├── server/        express api
│   ├── routes/    api routes (auth, students, scores, results, etc)
│   ├── db.js      mysql connection pool
│   └── setup-db.js  loads schema.sql into the database
└── schema.sql     all tables + sample data
```

## Running it locally (setup)

You need Node.js installed and a local MySQL server (I used XAMPP).

**1. Clone the repo**
```
git clone https://github.com/Risperwanjiku/Student-Management-System.git
cd Student-Management-System
```

**2. Create the database**

Create an empty database called `student_management_system` (in phpMyAdmin or the MySQL shell), then import `schema.sql` into it. This creates all the tables and adds some sample data, including the demo admin login.

**3. Start the backend**
```
cd server
npm install
```
Create a file `server/.env` with:
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=student_management_system
DB_SSL=false
JWT_SECRET=any-long-random-string
```
Then run:
```
npm run dev
```
The API runs on `http://localhost:5000`.

**4. Start the frontend**
```
cd ../client
npm install
```
Create a file `client/.env` with:
```
VITE_API_URL=http://localhost:5000
```
Then run:
```
npm run dev
```
The app runs on `http://localhost:5173`.

## Deployment

The app is deployed as three pieces:

**Database — Aiven (MySQL)**
A free MySQL service. The tables and sample data were loaded by running `node server/setup-db.js` with the `.env` pointing at the Aiven database. Aiven requires an SSL connection.

**Backend — Render web service**
- Root directory: `server`
- Build command: `npm install`
- Start command: `npm start`
- Environment variables: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_SSL` (set to `true`) and `JWT_SECRET`
- The server listens on `process.env.PORT`, which Render assigns automatically, and uses SSL to connect to Aiven.

**Frontend — Render static site**
- Root directory: `client`
- Build command: `npm install && npm run build`
- Publish directory: `dist`
- Environment variable: `VITE_API_URL` set to the live backend URL

Both Render services auto-deploy on every push to the `main` branch.

## Using the app

Log in with the admin credentials, then use the sidebar to move between pages:

- **Dashboard** - overview stats (total students, streams, subjects) and a students-per-stream breakdown.
- **Class Streams** - create, view, edit and delete streams (e.g. Form 1A, Form 1B).
- **Students** - register students into a stream, edit and delete them, and view students by stream.
- **Subjects** - create subjects and assign them to class streams.
- **Scores** - pick a stream, subject and term, then enter each student's CAT and exam marks. Duplicate score entries are blocked at the database level.
- **Results** - pick a stream to see each student's total, average, grade, subject positions and overall class position, with the class automatically ranked.
- **Reports** - generate a PDF report card for an individual student, or a PDF class performance report.
- **Settings** - edit the grading scale (the grade boundaries used in results).
- **Profile** - view your account and change your password.