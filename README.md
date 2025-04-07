# CodeTrack - Intelligent Time Tracking for Developers

CodeTrack is a comprehensive time tracking solution designed specifically for developers. Monitor your coding sessions, manage projects and courses, and gain valuable insights into your development productivity.

## Features

- **Activity Tracking**: Log and monitor your coding activities with detailed session information
- **Project Management**: Organize your work into projects and courses
- **Time Analytics**: View statistics and insights about your coding time
- **User Authentication**: Secure login and user management with Clerk
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Prerequisites
- Node.js and npm/yarn installed
- PostgreSQL database
- Accounts and API keys for:
  - Clerk (for authentication)
  - Stripe (for payments)
  - Vercel (for deployment)

## Local Development Setup

1. Clone the repository:
   ```
   git clone <repository-url>
   cd code-tracker-app
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory based on `.env.example`:
   ```
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/codetrack?schema=public"

   # Authentication (Clerk)
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"
   CLERK_SECRET_KEY="your_clerk_secret_key"
   NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
   NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"

   # Payments (Stripe)
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="your_stripe_publishable_key"
   STRIPE_SECRET_KEY="your_stripe_secret_key"
   STRIPE_WEBHOOK_SECRET="your_stripe_webhook_secret"

   # Application
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

4. Configure features:
   In `config.ts`, set the desired features:
   ```typescript
   const config = {
     auth: {
       enabled: true, // Set to false if not using Clerk
     },
     payments: {
       enabled: true, // Set to false if not using Stripe
     }
   };
   ```

5. Set up the database:
   Run Prisma migrations:
   ```
   npx prisma migrate dev
   ```

6. Start the development server:
   ```
   npm run dev
   ```

7. Open your browser and navigate to `http://localhost:3000` to see your application running.

## Vercel Deployment

1. **Create a Vercel Account**:
   - Sign up at [vercel.com](https://vercel.com) if you don't have an account

2. **Install Vercel CLI** (optional):
   ```
   npm install -g vercel
   ```

3. **Deploy to Vercel**:
   - Connect your GitHub repository to Vercel
   - Or use the Vercel CLI:
     ```
     vercel
     ```

4. **Configure Environment Variables**:
   - In the Vercel dashboard, go to your project settings
   - Navigate to the "Environment Variables" section
   - Add all the environment variables from your `.env` file
   - Make sure to update `NEXT_PUBLIC_APP_URL` to your Vercel deployment URL

5. **Set Up Database**:
   - Create a PostgreSQL database (Vercel Postgres, Supabase, or any other provider)
   - Update the `DATABASE_URL` in your Vercel environment variables
   - Run migrations on your production database:
     ```
     npx prisma migrate deploy
     ```

6. **Configure Authentication**:
   - Set up Clerk webhooks in the Clerk dashboard
   - Add the webhook URL: `https://your-vercel-url.vercel.app/api/auth/webhook`

7. **Configure Payments** (if using):
   - Set up Stripe webhooks in the Stripe dashboard
   - Add the webhook URL: `https://your-vercel-url.vercel.app/api/payments/webhook`

8. **Deploy**:
   - Vercel will automatically deploy your application when you push to your repository
   - You can also manually deploy from the Vercel dashboard

## Additional Configuration

- **Custom Domains**: Configure your custom domain in the Vercel dashboard
- **Analytics**: Enable Vercel Analytics for performance monitoring
- **Edge Functions**: Consider using Vercel Edge Functions for improved performance

## Important Security Notes

- Never commit your `.env` file to version control
- Use environment variables for all sensitive information
- Regularly update dependencies to patch security vulnerabilities
- Enable Row Level Security (RLS) in your database to ensure data protection

## Learn More

Refer to the documentation of the individual technologies used in this project:
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Clerk Documentation](https://clerk.dev/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
