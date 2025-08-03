import React, { useState, useEffect, createContext, useContext } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, signInAnonymously, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// --- Firebase Context for easy access ---
const FirebaseContext = createContext(null);

const FirebaseProvider = ({ children }) => {
  const [firebaseApp, setFirebaseApp] = useState(null);
  const [auth, setAuth] = useState(null);
  const [db, setDb] = useState(null);
  const [storage, setStorage] = useState(null);
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [projectId, setProjectId] = useState(null); // State to store projectId for context

  useEffect(() => {
    // DIRECTLY USE YOUR FIREBASE CONFIG HERE
    const firebaseConfig = {
      apiKey: "AIzaSyDxGpNGYFtPXbK2-XKBgtw5rFRt7HQ_3EY",
      authDomain: "sample-59e1e.firebaseapp.com",
      projectId: "sample-59e1e",
      storageBucket: "sample-59e1e.firebasestorage.app",
      messagingSenderId: "674409452019",
      appId: "1:674409452019:web:a230ed4740c8ef61f14286"
    };

    // Store projectId in state so it can be passed through context
    setProjectId(firebaseConfig.projectId);
    
    // In a non-Canvas environment, initialAuthToken is typically null
    const initialAuthToken = null; 

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const authInstance = getAuth(app);
    const dbInstance = getFirestore(app);
    const storageInstance = getStorage(app);

    setFirebaseApp(app);
    setAuth(authInstance);
    setDb(dbInstance);
    setStorage(storageInstance);

    // Sign in with custom token or anonymously
    const signInUser = async () => {
      try {
        if (initialAuthToken) {
          await signInWithCustomToken(authInstance, initialAuthToken);
        } else {
          await signInAnonymously(authInstance);
        }
      } catch (error) {
        console.error("Firebase authentication failed:", error);
      } finally {
        setLoadingAuth(false);
      }
    };

    // Set up auth state change listener
    const unsubscribe = onAuthStateChanged(authInstance, (currentUser) => {
      setUser(currentUser);
      if (loadingAuth) setLoadingAuth(false);
    });

    signInUser();

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  if (loadingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="text-lg font-semibold">Loading Firebase...</div>
      </div>
    );
  }

  return (
    <FirebaseContext.Provider value={{ firebaseApp, auth, db, storage, user, projectId }}>
      {children}
    </FirebaseContext.Provider>
  );
};

// --- Auth Components ---
const Auth = () => {
  const { auth, user } = useContext(FirebaseContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignUp = async () => {
    try {
      setError('');
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSignIn = async () => {
    try {
      setError('');
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSignOut = async () => {
    try {
      setError('');
      await signOut(auth);
    } catch (err) {
      setError(err.message);
    }
  };

  if (!auth) return <div className="text-center text-gray-500">Loading authentication...</div>;

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md mx-auto my-8 border border-gray-700">
      {user ? (
        <div className="text-center">
          <h2 className="text-2xl font-bold text-green-400 mb-4">Welcome, {user.email || 'Guest'}!</h2>
          <button
            onClick={handleSignOut}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline transition duration-200"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <div>
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Join the Recipe Community</h2>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 mb-4 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 mb-6 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
          <div className="flex flex-col space-y-3">
            <button
              onClick={handleSignIn}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline transition duration-200"
            >
              Sign In
            </button>
            <button
              onClick={handleSignUp}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline transition duration-200"
            >
              Sign Up
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Add Recipe Component ---
const AddRecipe = () => {
  const { db, storage, user, projectId } = useContext(FirebaseContext); // Get projectId from context
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [instructions, setInstructions] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [servings, setServings] = useState('');
  const [category, setCategory] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setUploading(true);

    if (!user) {
      setError('You must be logged in to add a recipe.');
      setUploading(false);
      return;
    }

    let imageUrl = '';
    if (imageFile) {
      try {
        const storageRef = ref(storage, `recipe_images/${user.uid}/${imageFile.name}_${Date.now()}`);
        const snapshot = await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(snapshot.ref);
      } catch (err) {
        setError('Failed to upload image: ' + err.message);
        setUploading(false);
        return;
      }
    }

    try {
      // Use projectId from context for the collection path
      const recipesCollectionRef = collection(db, `artifacts/${projectId}/public/data/recipes`); 
      // If you're NOT using the 'artifacts/{appId}/public/data/' pathing,
      // change it to: const recipesCollectionRef = collection(db, 'recipes');

      await addDoc(recipesCollectionRef, {
        name,
        description,
        ingredients: ingredients.split('\n').filter(item => item.trim() !== ''),
        instructions: instructions.split('\n').filter(step => step.trim() !== ''),
        prepTime: parseInt(prepTime) || 0,
        cookTime: parseInt(cookTime) || 0,
        servings: parseInt(servings) || 0,
        category,
        imageUrl,
        authorId: user.uid,
        authorEmail: user.email,
        createdAt: serverTimestamp(),
      });
      setSuccess('Recipe added successfully!');
      // Clear form
      setName('');
      setDescription('');
      setIngredients('');
      setInstructions('');
      setPrepTime('');
      setCookTime('');
      setServings('');
      setCategory('');
      setImageFile(null);
      if (e.target.image) e.target.image.value = ''; // Clear file input
    } catch (err) {
      setError('Failed to add recipe: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center text-gray-400 p-8">
        Please sign in to add recipes.
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-2xl mx-auto my-8 border border-gray-700">
      <h2 className="text-3xl font-bold text-white mb-6 text-center">Add New Recipe</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-gray-300 text-sm font-bold mb-2">Recipe Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-gray-300 text-sm font-bold mb-2">Description:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="3"
            className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          ></textarea>
        </div>
        <div>
          <label htmlFor="ingredients" className="block text-gray-300 text-sm font-bold mb-2">Ingredients (one per line):</label>
          <textarea
            id="ingredients"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            rows="5"
            className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          ></textarea>
        </div>
        <div>
          <label htmlFor="instructions" className="block text-gray-300 text-sm font-bold mb-2">Instructions (one step per line):</label>
          <textarea
            id="instructions"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows="7"
            className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          ></textarea>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="prepTime" className="block text-gray-300 text-sm font-bold mb-2">Prep Time (min):</label>
            <input type="number" id="prepTime" value={prepTime} onChange={(e) => setPrepTime(e.target.value)} className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div>
            <label htmlFor="cookTime" className="block text-gray-300 text-sm font-bold mb-2">Cook Time (min):</label>
            <input type="number" id="cookTime" value={cookTime} onChange={(e) => setCookTime(e.target.value)} className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div>
            <label htmlFor="servings" className="block text-gray-300 text-sm font-bold mb-2">Servings:</label>
            <input type="number" id="servings" value={servings} onChange={(e) => setServings(e.target.value)} className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
        </div>
        <div>
          <label htmlFor="category" className="block text-gray-300 text-sm font-bold mb-2">Category:</label>
          <input
            type="text"
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label htmlFor="image" className="block text-gray-300 text-sm font-bold mb-2">Recipe Image:</label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
          />
        </div>
        {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
        {success && <p className="text-green-500 text-sm mt-4 text-center">{success}</p>}
        <button
          type="submit"
          disabled={uploading}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:shadow-outline transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Adding Recipe...' : 'Add Recipe'}
        </button>
      </form>
    </div>
  );
};

// --- View Recipes Component ---
const ViewRecipes = () => {
  const { db, projectId } = useContext(FirebaseContext); // Get projectId from context
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        setError('');
        // Using projectId from context for the collection path
        const recipesCollectionRef = collection(db, `artifacts/${projectId}/public/data/recipes`); 
        // If you're NOT using the 'artifacts/{appId}/public/data/' pathing,
        // change it to: const recipesCollectionRef = collection(db, 'recipes');
        
        const q = query(recipesCollectionRef, orderBy('createdAt', 'desc')); 
        const querySnapshot = await getDocs(q);
        const fetchedRecipes = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setRecipes(fetchedRecipes);
      } catch (err) {
        setError('Failed to fetch recipes: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (db && projectId) { // Ensure db and projectId are available before fetching
      fetchRecipes();
    }
  }, [db, projectId]); // Add projectId to dependency array

  if (loading) {
    return <div className="text-center text-gray-400 p-8">Loading recipes...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 p-8">Error: {error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto my-8 p-6 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
      <h2 className="text-3xl font-bold text-white mb-6 text-center">All Recipes</h2>
      {recipes.length === 0 ? (
        <p className="text-center text-gray-400">No recipes yet. Be the first to add one!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="bg-gray-700 rounded-lg shadow-md overflow-hidden border border-gray-600">
              {recipe.imageUrl && (
                <img 
                  src={recipe.imageUrl} 
                  alt={recipe.name} 
                  className="w-full h-48 object-cover" 
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x300/374151/FFFFFF?text=No+Image'; }}
                />
              )}
              {!recipe.imageUrl && (
                <img 
                  src="https://placehold.co/400x300/374151/FFFFFF?text=No+Image" 
                  alt="No Image Available" 
                  className="w-full h-48 object-cover" 
                />
              )}
              <div className="p-4">
                <h3 className="text-xl font-bold text-white mb-2">{recipe.name}</h3>
                <p className="text-gray-300 text-sm mb-3">{recipe.description}</p>
                <div className="text-gray-400 text-xs mb-2">
                  <span className="bg-gray-600 px-2 py-1 rounded-full">{recipe.category || 'Uncategorized'}</span>
                </div>
                <p className="text-gray-400 text-sm">Prep: {recipe.prepTime} min | Cook: {recipe.cookTime} min</p>
                <p className="text-gray-400 text-sm">Servings: {recipe.servings}</p>
                <p className="text-gray-500 text-xs mt-2">By: {recipe.authorEmail || 'Unknown'}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- Main App Component ---
const App = () => {
  const [currentPage, setCurrentPage] = useState('home'); // 'home', 'add-recipe', 'view-recipes'
  const { user } = useContext(FirebaseContext);

  return (
    <div className="min-h-screen bg-gray-900 font-sans text-white">
      {/* Navbar */}
      <nav className="bg-gray-950 p-4 shadow-md border-b border-gray-800">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-extrabold text-white">Recipe Book</h1>
          <div className="space-x-4">
            <button
              onClick={() => setCurrentPage('home')}
              className={`px-4 py-2 rounded-md font-semibold transition duration-200 ${
                currentPage === 'home' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              Home
            </button>
            {user && (
              <button
                onClick={() => setCurrentPage('add-recipe')}
                className={`px-4 py-2 rounded-md font-semibold transition duration-200 ${
                  currentPage === 'add-recipe' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                Add Recipe
              </button>
            )}
            <button
              onClick={() => setCurrentPage('view-recipes')}
              className={`px-4 py-2 rounded-md font-semibold transition duration-200 ${
                currentPage === 'view-recipes' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              View Recipes
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto p-4">
        {currentPage === 'home' && (
          <div className="text-center py-20">
            <h2 className="text-5xl font-extrabold text-white mb-6">Welcome to the Collaborative Recipe Book!</h2>
            <p className="text-xl text-gray-300 mb-8">
              Discover, share, and manage your favorite recipes with a vibrant community.
            </p>
            {!user ? (
              <p className="text-lg text-gray-400">
                <span className="text-blue-400 font-semibold">Sign up or Log in</span> to start adding and sharing your delicious creations.
              </p>
            ) : (
              <p className="text-lg text-gray-400">
                You are logged in as <span className="text-green-400 font-semibold">{user.email || 'Guest'}</span>. Start exploring or add a new recipe!
              </p>
            )}
          </div>
        )}
        {currentPage === 'add-recipe' && <AddRecipe />}
        {currentPage === 'view-recipes' && <ViewRecipes />}
      </main>

      {/* Auth component (always visible for login/logout) */}
      <div className="fixed bottom-4 right-4 z-50">
        <Auth />
      </div>
    </div>
  );
};

// Wrap the App with FirebaseProvider
const RootApp = () => (
  <FirebaseProvider>
    <App />
  </FirebaseProvider>
);

export default RootApp;
