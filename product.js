console.log("✅ product.js is connected");

// Firebase Config 
const firebaseConfig = {
  apiKey: "AIzaSyBrthMfhGl_ESm7A3ujk2zCgbIpJPHBJxI",
  authDomain: "catering-reservation-sys-376f7.firebaseapp.com",
  projectId: "catering-reservation-sys-376f7",
  storageBucket: "catering-reservation-sys-376f7.appspot.com",
  messagingSenderId: "321662721716",
  appId: "1:321662721716:web:4a6b8a2a8b0b3bf35881e1",
  measurementId: "G-NEQPETFZZT"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Logout function
function logout() {
  auth.signOut().then(() => {
    alert("Logged out successfully");
    window.location.href = "index.html";
  });
}

// Auth check
auth.onAuthStateChanged((user) => {
  if (user) {
    loadProducts();
  } else {
    alert("Please log in first");
    window.location.href = "index.html";
  }
});

// Load products from Firestore and categorize
async function loadProducts() {
  const vegContainer = document.getElementById("veg-products");
  const nonVegContainer = document.getElementById("nonveg-products");
  const dessertContainer = document.getElementById("dessert-products");

  // Ensure containers exist
  if (!vegContainer || !nonVegContainer || !dessertContainer) {
    console.error("One or more product containers not found in the HTML.");
    return;
  }

  try {
    const snapshot = await db.collection("products").get();

    if (snapshot.empty) {
      vegContainer.innerHTML = "<p>No products found.</p>";
      nonVegContainer.innerHTML = "<p>No products found.</p>";
      dessertContainer.innerHTML = "<p>No products found.</p>";
      return;
    }

    snapshot.forEach((doc) => {
      const product = doc.data();
      const productElement = document.createElement("div");
      productElement.classList.add("product");

      productElement.innerHTML = `
        <img src="${product.image}" alt="${product.name}" width="200" height="150" style="border-radius: 8px;">
        <h3>${product.name}</h3>
        <p>Category: ${product.category}</p>
        <p>Price: ₹${product.price}</p>
        <button onclick="addToCart('${doc.id}', '${product.name}', ${product.price})">Add to Cart</button>
        <hr/>
      `;

      if (product.category === "Veg") {
        vegContainer.appendChild(productElement);
      } else if (product.category === "Non-Veg") {
        nonVegContainer.appendChild(productElement);
      } else if (product.category === "Dessert") {
        dessertContainer.appendChild(productElement);
      }
    });

  } catch (error) {
    console.error("❌ Error fetching products:", error);
  }
}

// Make addToCart accessible from HTML
window.addToCart = addToCart;

// Cart logic
function addToCart(id, name, price) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: id,
      name: name,
      price: Number(price),
      quantity: 1
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  alert(`${name} added to cart!`);
}

// Go back to index
function goBack() {
  window.location.href = "index.html";
}

console.log("✅ Finished loading product.js");
