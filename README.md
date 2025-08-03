React Recipe App with Firebase
A dynamic and interactive web application for discovering, creating, and managing your favorite recipes. Built with React for a responsive user interface and powered by Firebase for a scalable, real-time backend.

✨ Features
Browse & Discover: Explore a wide collection of recipes, categorized for easy navigation.

Powerful Search & Filter: Quickly find recipes by keywords, ingredients, cuisine, meal type, or dietary restrictions.

Detailed Recipe Views: Access comprehensive recipe information, including ingredients, step-by-step instructions, prep/cook times, and user reviews.

Personalized Collections: Save your favorite recipes, create custom meal plans, and build shopping lists.

User Authentication: Securely sign up, log in, and manage your profile.

Add & Manage Recipes: Create, edit, and delete your own recipes with ease.

Real-time Updates: Experience instant synchronization of data across all users.

<img width="1917" height="935" alt="Screenshot 2025-08-03 234027" src="https://github.com/user-attachments/assets/52c7253e-4307-4019-876f-3a07969d4ba2" />
<img width="1888" height="908" alt="Screenshot 2025-08-04 003524" src="https://github.com/user-attachments/assets/b0c5f887-c5e5-4f90-9234-25d8782e6c3a" />
<img width="1845" height="905" alt="Screenshot 2025-08-04 004046" src="https://github.com/user-attachments/assets/6bedd39b-efe4-4466-9cac-677817e81e39" />
<img width="1895" height="902" alt="Screenshot 2025-08-04 004115" src="https://github.com/user-attachments/assets/a15b9ddd-32e9-49e5-b408-27084cd1f286" />





🚀 Technologies Used
This application leverages a modern tech stack to deliver a robust and efficient experience:

Frontend:

React - A JavaScript library for building user interfaces.

Tailwind CSS - A utility-first CSS framework for rapid UI development.


Backend & Database:

Firebase - Google's mobile and web application development platform.

Firestore: NoSQL cloud database for storing recipe data, user profiles, and comments.

Firebase Authentication: Secure user authentication and management.

Firebase Storage: Cloud storage for user-uploaded recipe images.

Firebase Hosting: Fast and secure web hosting for the React application.

🛠️ Setup and Installation
Follow these steps to get the project up and running on your local machine.

Prerequisites
Node.js (LTS version recommended)

npm or yarn

1. Clone the Repository
git clone <your-repository-url>
cd react-recipe-app

2. Install Dependencies
npm install
# or
yarn install

3. Firebase Project Setup
Create a Firebase Project: Go to the Firebase Console and create a new project.

Register Your App: Add a new web app to your Firebase project.

Get Firebase Config: Copy your Firebase configuration object. It will look something like this:

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

Enable Services:

In the Firebase Console, enable Firestore Database and start it in production mode (or test mode for development).

Enable Authentication and set up your desired sign-in methods (e.g., Email/Password, Google).

Enable Storage.

Configure Environment Variables:
Create a .env file in the root of your project and add your Firebase configuration:

REACT_APP_FIREBASE_API_KEY=YOUR_API_KEY
REACT_APP_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
REACT_APP_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
REACT_APP_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
REACT_APP_FIREBASE_APP_ID=YOUR_APP_ID

Replace YOUR_... with your actual Firebase config values.

4. Run the Application
npm start
# or
yarn start

The application will open in your browser at http://localhost:3000.

💡 Usage
Sign Up/Log In: Create an account or log in to access personalized features.

Explore: Use the navigation or search bar to find recipes.

Add Recipe: Click the "Add New Recipe" button to contribute your own culinary creations.

Manage: Access your profile to view and manage your saved or created recipes.

🤝 Contributing
Contributions are always welcome! If you have suggestions for improvements, new features, or bug fixes, please open an issue or submit a pull request.

Fork the repository.

Create a new branch (git checkout -b feature/your-feature-name).

Make your changes.

Commit your changes (git commit -m 'Add new feature').

Push to the branch (git push origin feature/your-feature-name).

Open a Pull Request.

📄 License
This project is licensed under the MIT License - see t
