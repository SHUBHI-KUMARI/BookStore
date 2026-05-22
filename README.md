# ReBook

ReBook is a full-stack bookstore marketplace where readers can buy books, sell pre-owned books, manage listings, and track orders through a polished end-to-end experience. It combines a modern storefront with an admin workflow for inventory, listing approvals, user management, and order operations.

This project was built to feel like a real product, not just a CRUD demo. The customer flow, seller flow, and admin flow all connect through one shared marketplace system.

## Why ReBook

Most bookstore demos stop at browsing a few products. ReBook goes further:

- Customers can browse new and used books, add them to cart, and complete checkout.
- Sellers can submit used-book listings with real image upload to Cloudinary.
- Admins can review pending listings, manage inventory, manage users, and update order states.
- Orders persist shipping details and use a payment mock so the buying flow works end to end without integrating a real payment gateway yet.

## Core Features

- Public storefront with home page, discovery, categories, search, and detailed book pages
- Marketplace support for both new inventory and user-submitted used books
- Role-based authentication for customers and admins
- Seller dashboard for managing personal listings and order history
- Admin dashboard for approvals, inventory, orders, users, and categories
- Shopping cart with quantity management and stock checks
- Checkout flow with shipping details and payment mock
- Review system for purchased books
- Cloudinary-powered cover image upload for seller listings

## User Flows

### Customer

- Sign up and log in
- Browse new arrivals and used books
- View book details and reviews
- Add approved books to cart
- Complete checkout with delivery details
- Track orders from the dashboard

### Seller

- Submit a used-book listing
- Upload a real cover image
- Add condition notes and seller notes
- Wait for admin approval
- Edit or delete personal listings from the dashboard

### Admin

- Review pending used-book listings
- Approve or reject marketplace submissions
- Add new store inventory
- View all orders and move them through order states
- Create categories
- Review users and moderate the platform

## Tech Stack

### Frontend

- React 19
- TypeScript
- Vite
- React Router
- Axios
- Tailwind CSS 4
- Lucide React

### Backend

- Node.js
- Express 5
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT authentication
- bcrypt password hashing

### Media / External Services

- Cloudinary for book cover uploads

## Architecture

The repository is split into two applications:

- [frontend](/Users/amanjeet/Desktop/BookStore/frontend): React client
- [backend](/Users/amanjeet/Desktop/BookStore/backend): Express + Prisma API

The backend follows a layered structure:

- `routes` for API endpoints
- `controllers` for request handling
- `services` for business logic
- `repositories` for Prisma database access
- `prisma` for schema and migrations

The frontend is organized around:

- `pages` for route-level screens
- `components` for reusable UI
- `services` for API calls
- `context` for auth and cart state
- `hooks` for shared client-side logic

## Screens and Documentation

This repository also includes supporting design and system documents:

- [UsecaseDiagram.md](/Users/amanjeet/Desktop/BookStore/UsecaseDiagram.md)
- [SequenceDiagram.md](/Users/amanjeet/Desktop/BookStore/SequenceDiagram.md)
- [ClassDiagram.md](/Users/amanjeet/Desktop/BookStore/ClassDiagram.md)
- [ERDiagram.md](/Users/amanjeet/Desktop/BookStore/ERDiagram.md)
- [Idea.md](/Users/amanjeet/Desktop/BookStore/Idea.md)

## Demo Credentials

Use these accounts to review the main product flows:

### Admin

- Email: `admin@rebook.com`
- Password: `admin123`

### Seller / Customer

- Email: `jane@example.com`
- Password: `seller123`

### Buyer / Customer

- Email: `john@example.com`
- Password: `customer123`

## Local Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd BookStore
```

### 2. Install dependencies

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd ../frontend
npm install
```

## Environment Variables

Create a `.env` file inside [backend](/Users/amanjeet/Desktop/BookStore/backend) with the following values:

```env
PORT=3000
NODE_ENV=development

DATABASE_URL=your_postgres_connection_url
DIRECT_URL=your_direct_postgres_connection_url

JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLOUDINARY_URL=your_cloudinary_url
```

### Variable Notes

- `DATABASE_URL`: primary Prisma connection
- `DIRECT_URL`: direct PostgreSQL connection used for Prisma migrations
- `JWT_SECRET`: token signing secret
- Cloudinary variables: required for seller image upload in the Sell Book flow

## Database Setup

Apply the existing Prisma migrations:

```bash
cd backend
npx prisma migrate deploy
```

Generate the Prisma client if needed:

```bash
npx prisma generate
```

## Run the Project

### Start the backend

From the `backend` directory:

```bash
npm run dev
```

The API will run on:

- [http://localhost:3000](http://localhost:3000)

Health check:

- [http://localhost:3000/api/health](http://localhost:3000/api/health)

### Start the frontend

From the `frontend` directory:

```bash
npm run dev
```

The frontend will run on:

- [http://localhost:5173](http://localhost:5173)

## Build Commands

### Backend

```bash
cd backend
npm run build
```

### Frontend

```bash
cd frontend
npm run build
```

## Helpful Scripts

### Backend

```bash
npm run dev
npm run build
npm run lint
npm run format
npx prisma migrate deploy
npx prisma generate
```

### Frontend

```bash
npm run dev
npm run build
npm run lint
npm run format
npm run preview
```

## Reviewer Guide

If you want the quickest tour of the project, review it in this order:

1. Open the storefront and browse books
2. Log in as `jane@example.com` and submit a used-book listing
3. Log in as `admin@rebook.com` and approve the listing
4. Log in as `john@example.com`, add that listing to cart, and complete checkout
5. Return to the admin panel and move the order through its statuses

This gives the clearest picture of the end-to-end product thinking behind ReBook.

## Notes

- Payment is intentionally implemented as a mock flow for now so the full checkout and order lifecycle can still be demonstrated end to end.
- Seller cover images are uploaded to Cloudinary under the `rebook/books` folder and the hosted URL is persisted to the database.
- The repository is designed to be explored both as a product demo and as a codebase showing layered backend architecture plus a modern React frontend.

## Project Name

ReBook
