# <div align="center"> <img src="public/logo.png" alt="Collab-Sphere Logo" width="150"> <br> Collab-Sphere - Ignite Your Open Source Journey! 🚀 </div>

[![Deployed on NETLIFY](https://img.shields.io/badge/Deployed%20on-Netlify-Red?style=for-the-badge&logo=netlify)](https://thunderous-tanuki-dab88d.netlify.app/)

Hey fellow coders! 👋 Ever felt that itch to contribute to open source but didn't know where to start? Or maybe you've got a cool project idea brewing and need some awesome collaborators? That's exactly why we built **Collab-Sphere**!

Collab-Sphere is a platform designed by students, for students, to make diving into the world of open source less daunting and more collaborative. We aim to connect aspiring contributors with beginner-friendly projects and provide a space for project initiators to find enthusiastic collaborators. Let's build something awesome together!

## 🎯 Problem Statement

Finding those "perfect first issues" or connecting with like-minded individuals to bring your project ideas to life can be a real struggle. Collab-Sphere tackles this head-on by providing a centralized hub where students can:

* **Discover beginner-friendly open-source projects.**
* **Share their own project ideas and find collaborators with the right skills.**
* **Easily express interest in contributing to projects.**
* **Engage in focused discussions and collaborate effectively.**

## ✨ Key Features

Here's what Collab-Sphere brings to the table:

### Core Functionalities

* **Share Project Ideas:** Got a brilliant idea? Post it here! Include the skills you're looking for in potential collaborators.
* **Express Interest:** See a project that sparks your interest? Hit the "I'm Interested" button and let the project owner know!
* **Dedicated Discussion Areas:** Each project gets its own space for discussions, brainstorming, and coordinating contributions.
* **Project Explorer:** Browse a curated list of projects, filter by skills, and find the perfect fit for your interests and abilities.

### 🔥 My Enhancements 

We're always looking to make Collab-Sphere even better! Here's a sneak peek at what's in the pipeline:

* **AI-Powered Contribution Guide:** When you click "I'm Interested," our platform will leverage the GitHub API and Google Generative AI to fetch relevant info to give you a head-start on how to contribute!
* **Project Vibe Check & Skill Matching:** Our AI will analyze project discussion areas for sentiment (e.g., "Highly Collaborative," "Needs More Activity") to give you a sense of the project's environment. Plus, we'll match projects with users based on their listed skills, making it easier to find the perfect match!

## 🛠️ Tech Stack

We're using some cool tech to power Collab-Sphere:

* **Frontend:** Vue 3 + Vite - For a snappy and modern user interface.
* **Backend:** Firebase (Authentication + Firestore) - Providing secure authentication and a flexible NoSQL database.
* **AI Integration:** Google Generative AI - For those smart future enhancements!
* **API:** GitHub REST API - To fetch project details and make your contribution journey smoother.

## ⚙️ Setup Instructions

Ready to dive in and contribute to Collab-Sphere itself or set up a local development environment? Here's how:

### Prerequisites

* **Node.js** (version >= 18 recommended) and **npm** (or **yarn** or **pnpm**) installed on your machine.
* **Firebase CLI** installed globally (`npm install -g firebase-tools`).
* A **Google Cloud Project** with Firebase enabled.
* A **GitHub Personal Access Token** with read access to public repositories (you might need this for future AI features if you're developing them).

### Local Setup
1.  **Clone the Repository:**
    Open your terminal or command prompt and run the following command, replacing `<repository-url>` with the actual URL of your GitHub repository:
    ```bash
    git clone <https://github.com/1mystic8u/collab_sphere.git>
    ```
    *Example:*
    ```bash
    git clone https://github.com/1mystic8u/collab_sphere.git
    ```

2.  **Navigate to Project Directory:**
    Change into the newly cloned project folder:
    ```bash
    cd collab_sphere-main
    ```
    *(Check the actual folder name once)*

3.  **Install Dependencies:**
    Install the necessary Node.js packages defined in `package.json`. Choose one of the following commands based on your preferred package manager:

    *Using npm:*
    ```bash
    npm install
    ```

    *Using Yarn:*
    ```bash
    yarn install
    ```
    *(or simply `yarn`)*

4.  **Set Up Environment Variables:**
    This project requires API keys and configuration details for Firebase and Google Generative AI. These should *never* be committed directly into the repository.

    *   Create a new file named `.env` in the root directory of the project (the same directory as `package.json` and `vite.config.js`).
    *   Open the `.env` file and add the following variables, replacing the placeholder values (`your_..._here`) with your actual credentials:

        ```env
        # Firebase Configuration (Get these from your Firebase project settings)
        VITE_FIREBASE_API_KEY=your_firebase_api_key_here
        VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain_here
        VITE_FIREBASE_PROJECT_ID=your_firebase_project_id_here
        VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket_here
        VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id_here
        VITE_FIREBASE_APP_ID=your_firebase_app_id_here
        VITE_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id_here 

        # Google Generative AI (Gemini API Key)
        VITE_GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_api_key_here
        ```

    *   **Important:** The `.gitignore` file in this repository should already include `.env` to prevent accidentally committing your secret keys. Double-check that `.env` is listed in your `.gitignore` file.
    *   **Note:** Vite requires environment variables exposed to the client-side code to be prefixed with `VITE_`.

5.  **Run the Development Server:**
    Once dependencies are installed and the `.env` file is configured, you can start the local development server:

    *Using npm:*
    ```bash
    npm run dev
    ```

    *Using Yarn:*
    ```bash
    yarn dev
    ```

    This command will typically start the server on `http://localhost:5173` (Vite's default, but check the terminal output for the exact URL). The application will automatically reload when you make changes to the code.

## Building for Production

When you are ready to deploy your application, you can create an optimized production build:

*Using npm:*
```bash
npm run build

## 🖼️ Project UI Shots (Coming Soon!)

We're still polishing the UI, but stay tuned! We'll be adding some screenshots here to give you a visual taste of Collab-Sphere in action.

## 🙌 Contributing

We'd love for you to contribute to Collab-Sphere! Whether you're a seasoned open-source contributor or just starting out, there are many ways to get involved:

* **Report bugs:** If you find something not working as expected, please open an issue.
* **Suggest enhancements:** Have a great idea to make Collab-Sphere better? Let us know!
* **Submit pull requests:** If you're a developer, feel free to fork the repository, make your changes, and submit a pull request.

Please follow our [Contribution Guidelines](CONTRIBUTING.md) (we'll add this file soon!) for more details.
