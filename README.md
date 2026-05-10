# AlumniConnect – Futuristic Student-Alumni Interaction Platform

A premium, cinematic interaction platform built with the MERN stack (MongoDB, Express, React, Node.js) designed to bridge the gap between students and alumni. Featuring immersive motion design, real-time communication, and role-based access.

![Banner](https://img.shields.io/badge/UI-Futuristic-blueviolet?style=for-the-badge)
![Tech](https://img.shields.io/badge/Stack-MERN-blue?style=for-the-badge)
![Animations](https://img.shields.io/badge/Motion-Framer_GSAP-pink?style=for-the-badge)

## ✨ Key Features

### 🌟 Immersive Landing Page
- Fullscreen cinematic hero section with animated backgrounds.
- Storytelling-style scrolling with parallax effects.
- Interactive statistics and community success stories.

### 🎓 Dual Dashboard System
- **Students**: Search alumni, send mentorship requests, view job postings, and join live webinars.
- **Alumni**: Post jobs/internships, host events, manage mentorship requests, and guide students.

### 💬 Real-Time Interaction
- **Instant Chat**: Powered by Socket.io with typing indicators and online status.
- **Notifications**: Real-time alerts for messages, requests, and platform updates.
- **Events**: Integrated platform for hosting and registering for live sessions.

### 🛡️ Admin Control
- Manage user accounts and approve alumni registrations.
- Platform-wide statistics and content moderation.

## 🛠️ Technology Stack

- **Frontend**: React.js, Vite, Tailwind CSS, Framer Motion, GSAP, Lucide React.
- **Backend**: Node.js, Express.js, MongoDB Atlas (Mongoose).
- **Authentication**: JWT (JSON Web Tokens).
- **Communication**: Socket.io (WebSockets).
- **State Management**: Zustand (Auth, Socket).

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas Account
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "Student Alumni Interaction Platform"
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```
   - Create a `.env` file in the `backend` directory using the provided template:
     ```env
     PORT=5000
     MONGODB_URI=your_mongodb_atlas_uri
     JWT_SECRET=your_jwt_secret
     JWT_EXPIRE=7d
     CLIENT_URL=http://localhost:5173
     ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Run the Application**
   - **Backend**: `npm run dev` (from /backend)
   - **Frontend**: `npm run dev` (from /frontend)

## 📦 Deployment

### Backend (Render/Railway)
1. Push the code to a GitHub repository.
2. Connect the repository to Render/Railway.
3. Add Environment Variables in the service settings.
4. Set the build command to `npm install` and start command to `node server.js`.

### Frontend (GitHub Pages/Vercel)
1. Update `VITE_API_URL` in your frontend environment if needed.
2. For GitHub Pages, use the `gh-pages` package or GitHub Actions.
3. Build the project: `npm run build`.

## 📜 License
This project is licensed under the MIT License.

---
Built with ❤️ by Antigravity AI
