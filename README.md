# CryptoGuide

CryptoGuide is an interactive Automotive Cybersecurity Platform designed to help engineers and developers choose the right cryptographic mechanisms for various vehicle security use cases. It provides recommendations based on security objectives, system context, and industry standards, including considerations for post-quantum cryptography (PQC) migration.

## Features

-   **Interactive Guided Experience:** A step-by-step wizard to define security objectives and system context (hardware capabilities, connectivity, data at rest/in transit).
-   **Intelligent Recommendations:** Tailored cryptographic recommendations based on selected inputs, complete with algorithms, key sizes, and justification.
-   **Security Analysis:** Detailed breakdown of potential risks, hardware impacts, and migration paths to quantum-resistant cryptography.
-   **Knowledge Base:** Built-in reference for cryptographic concepts, algorithms, and automotive standards (e.g., ISO/SAE 21434).
-   **AI Assistant:** An integrated chat interface to answer questions about the recommendations or general cryptography topics.
-   **Dark Automotive UI:** A clean, professional, dark-themed design language tailored for engineering tools.

## Tech Stack

-   **Framework:** [Next.js](https://nextjs.org/) (App Router)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
-   **Icons:** [Lucide React](https://lucide.dev/)
-   **Deployment:** [Vercel](https://vercel.com/)

## Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the platform.

## Deployment

The application is configured for seamless deployment on [Vercel](https://vercel.com/). You can view the live demo at:
[https://cryptoguide-demo.vercel.app](https://cryptoguide-demo.vercel.app)

To deploy your own instance:

```bash
npx vercel --prod
```

## Architecture

The application is structured to separate the introductory landing experience from the core platform:

-   `app/page.js`: The main entry point.
-   `app/components/crypto/landing.jsx`: The static introductory presentation.
-   `app/components/crypto/experience.jsx`: Manages the transition from landing to the platform.
-   `app/components/crypto/platform.jsx`: The core application shell and navigation.
-   `app/components/crypto/store.jsx`: State management for the recommendation engine.

## License

MIT

