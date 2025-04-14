const firebaseConfig = {
  apiKey: "AIzaSyBrthMfhGl_ESm7A3ujk2zCgbIpJPHBJxI",
  authDomain: "catering-reservation-sys-376f7.firebaseapp.com",
  projectId: "catering-reservation-sys-376f7",
  storageBucket: "catering-reservation-sys-376f7.firebasestorage.app",
  messagingSenderId: "321662721716",
  appId: "1:321662721716:web:4a6b8a2a8b0b3bf35881e1",
  measurementId: "G-NEQPETFZZT"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

async function register() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const spinner = document.getElementById("loading-spinner");

  try {
    spinner.style.display = "block"; // Show loading spinner

    const cred = await auth.createUserWithEmailAndPassword(email, password);

    // Save user info in Firestore
    await db.collection("users").doc(cred.user.uid).set({
      email: email,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    // Sign the user out immediately after registration
    await auth.signOut();

    alert("Registered successfully! Please login now.");
  } catch (error) {
    alert(error.message);
  } finally {
    spinner.style.display = "none"; // Hide loading spinner
  }
}



async function login() {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  try {
    const cred = await auth.signInWithEmailAndPassword(email, password);
    alert("Login successful! User: " + cred.user.email);
  } catch (error) {
    alert("Login failed: " + error.message);
  }
}

// Auth state change listener
auth.onAuthStateChanged((user) => {
  const userInfo = document.getElementById("user-info");
  const logoutBtn = document.getElementById("logout-btn");
  const ordersList = document.getElementById("ordersList");

  if (user) {
    userInfo.innerText = `Logged in as: ${user.email}`;
    userInfo.style.display = "block";
    logoutBtn.style.display = "inline-block";

    // Clear any existing orders before fetching new ones
    if (ordersList) ordersList.innerHTML = "";

    fetchUserOrders();  // Only if user is logged in
  } else {
    userInfo.style.display = "none";
    logoutBtn.style.display = "none";

    // CLEAR orders when user logs out
    if (ordersList) ordersList.innerHTML = "<p>Please login to see your orders.</p>";
  }
});

function submitEvent() {
  const eventName = document.getElementById("eventName").value;
  const eventDate = document.getElementById("eventDate").value;
  const eventTime = document.getElementById("eventTime").value;
  const numPeople = document.getElementById("numPeople").value;

  const eventDetails = {
    eventName,
    eventDate,
    eventTime,
    numPeople
  };

  localStorage.setItem("eventDetails", JSON.stringify(eventDetails));

  alert("✅ Event details saved. You can now go to the cart to see them.");
}



// Logout function
function logout() {
  auth.signOut()
    .then(() => {
      // Clear cart data
      localStorage.removeItem("cart");

      // Check if ordersList element exists before trying to update it
      const ordersList = document.getElementById("ordersList");
      if (ordersList) {
        ordersList.innerHTML = "<p>Logged out. Please login to see orders.</p>";
      }

      // Notify and redirect
      alert("Logged out successfully");
      window.location.href = "index.html"; // Redirect to login/home page
    })
    .catch((error) => {
      alert("Logout failed: " + error.message);
    });
}







async function fetchUserOrders() {
  const user = auth.currentUser;

  if (!user) {
    console.log("User not logged in");
    return;
  }

  try {
    const snapshot = await db.collection("orders")
      .where("userId", "==", user.uid)
      .get();

    const ordersList = document.getElementById("ordersList");
    ordersList.innerHTML = "<h2>Your Catering Orders</h2>";

    if (snapshot.empty) {
      ordersList.innerHTML += "<p>No orders found.</p>";
      return;
    }

    const orders = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      orders.push(data);
    });

    orders.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

    orders.forEach((order) => {
      const orderItem = document.createElement("div");
      orderItem.innerHTML = `
        <h3>${order.eventName}</h3>
        <p><strong>Date:</strong> ${order.eventDate}</p>
        <p><strong>People:</strong> ${order.numPeople}</p>
        <p><strong>Menu:</strong> ${order.menu.join(", ")}</p>
        <hr/>
      `;
      ordersList.appendChild(orderItem);
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
  }
}
