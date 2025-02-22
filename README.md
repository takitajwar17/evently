# Evently 🎉

A modern event management platform built with Next.js 14, featuring real-time event creation, ticket management, and social interactions.

## Features 🚀

- **Authentication** - Secure user authentication powered by Clerk
- **Event Management** - Create, update, and delete events
- **Ticket System** - Generate and manage event tickets with QR codes
- **Payment Integration** - Seamless payment processing with Stripe
- **Comments & Social** - Rich commenting system with mentions and nested replies (up to 6 levels)
- **Real-time Updates** - Instant updates using Next.js server actions
- **Responsive Design** - Beautiful UI built with Tailwind CSS and Shadcn UI
- **File Upload** - Image upload functionality with uploadthing
- **Form Handling** - Robust form management with React Hook Form and Zod validation
- **Report Generation** - Comprehensive event reports for organizers with analytics
- **Ticket Management** - Download and share tickets in PDF format with QR codes

## Tech Stack 💻

- **Framework**: [Next.js 14 (App Router)](https://nextjs.org/)
- **Language**: TypeScript
- **Auth**: [Clerk](https://clerk.dev/)
- **Database**: MongoDB with Mongoose
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/)
- **Forms**: [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/)
- **Payments**: [Stripe](https://stripe.com/)
- **File Upload**: [uploadthing](https://uploadthing.com/)
- **QR Code**: [qrcode.react](https://www.npmjs.com/package/qrcode.react)
- **PDF Generation**: [@react-pdf/renderer](https://react-pdf.org/)

## Getting Started 🏁

### Prerequisites

- Node.js 18+
- MongoDB database
- Clerk account
- Stripe account
- Uploadthing account

### Installation

1. Clone the repository:

```bash
git clone https://github.com/takitajwar17/evently.git
cd evently
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:

```env
# Next.js
NEXT_PUBLIC_SERVER_URL=http://localhost:3000/

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key
WEBHOOK_SECRET=your_webhook_secret

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# MongoDB
MONGODB_URI=your_mongodb_connection_string

# Uploadthing
UPLOADTHING_SECRET=your_uploadthing_secret
UPLOADTHING_APP_ID=your_uploadthing_app_id

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

> ⚠️ Never commit the `.env` file with real credentials. Make sure it's included in your `.gitignore`.

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure 📁

```
evently/
├── app/                   # Next.js app router pages
├── components/
│   ├── shared/           # Reusable components
│   └── ui/               # UI components (shadcn)
├── lib/
│   ├── actions/          # Server actions
│   ├── database/         # Database models and config
│   └── utils/            # Utility functions
├── public/               # Static assets
└── types/                # TypeScript type definitions
```

## License 📝

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Thank you 🙏
