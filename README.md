# Neema Sadeghi — Director of Photography

Portfolio website built with Next.js, Sanity CMS, and deployed on Vercel.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Sanity CMS

Content is managed through Sanity Studio at `/studio`. To set up:

1. Create a Sanity account at [sanity.io](https://www.sanity.io)
2. Create a new project and copy your Project ID
3. Fill in `.env.local`:

```
NEXT_PUBLIC_SANITY_PROJECT_ID="your-project-id"
NEXT_PUBLIC_SANITY_DATASET="production"
```

4. Visit `/studio` to start adding content

### Content Types

- **Project** — Portfolio pieces with title, categories, still image, and optional preview video URL
- **About** — Portrait, heading, bio text, and stats
- **Contact** — Email, phone, location, and social media URLs

## Deployment

Deployed on Vercel. Push to `main` triggers automatic deployment.

Add environment variables in Vercel dashboard under Settings > Environment Variables.
