// ✅ cart.js
console.log("✅ cart.js is connected");

// Firebase config
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

// Load cart when page is ready
document.addEventListener("DOMContentLoaded", () => {
  loadCart();
  loadEventDetails();

  function loadEventDetails() {
    const eventDetailsContainer = document.getElementById("event-details");
    const eventData = JSON.parse(localStorage.getItem("eventDetails"));

    if (!eventData) {
      eventDetailsContainer.innerHTML = "<p>No event details found.</p>";
      return;
    }

    eventDetailsContainer.innerHTML = `
      <p><strong>Event:</strong> ${eventData.eventName}</p>
      <p><strong>Date:</strong> ${eventData.eventDate}</p>
      <p><strong>Time:</strong> ${eventData.eventTime}</p>
      <p><strong>People:</strong> ${eventData.numPeople}</p>
      <hr/>
    `;
  }

  window.placeOrder = async function () {
    const user = firebase.auth().currentUser;
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const eventData = JSON.parse(localStorage.getItem("eventDetails"));
    const status = document.getElementById("order-status");

    if (!user) {
      status.innerText = "You must be logged in to place an order.";
      status.style.color = "red";
      return;
    }

    if (cart.length === 0) {
      status.innerText = "Your cart is empty.";
      status.style.color = "red";
      return;
    }

    if (!eventData) {
      status.innerText = "Event details are missing.";
      status.style.color = "red";
      return;
    }

    const numPeople = parseInt(eventData.numPeople) || 1;
    const totalPerPerson = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const total = totalPerPerson * numPeople;

    try {
      await db.collection("orders").add({
        userId: user.uid,
        cart: cart,
        total: total,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        status: "Pending",
        eventDetails: eventData
      });

      localStorage.removeItem("cart");
      document.getElementById("cart-items").innerHTML = "";
      document.getElementById("total-price").textContent = "Total: ₹0";
      status.innerText = "✅ Order placed successfully!";
      status.style.color = "green";
    } catch (err) {
      console.error("Order failed", err);
      status.innerText = "Order failed: " + err.message;
      status.style.color = "red";
    }
  };
});

// 🔄 Load cart UI
function loadCart() {
  const cartItemsContainer = document.getElementById("cart-items");
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const eventData = JSON.parse(localStorage.getItem("eventDetails"));
  const numPeople = eventData ? parseInt(eventData.numPeople) || 1 : 1;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = "<p>Your cart is empty.</p>";
    document.getElementById("total-price").textContent = "Total: ₹0";
    return;
  }

  let total = 0;
  cartItemsContainer.innerHTML = "";

  cart.forEach((item, index) => {
    const itemTotal = item.price * item.quantity * numPeople;
    total += itemTotal;

    const div = document.createElement("div");
    div.innerHTML = `
      <p><strong>${item.name}</strong> (₹${item.price}) x ${item.quantity} × ${numPeople} person(s) = ₹${itemTotal}</p>
      <button onclick="removeItem(${index})">Remove</button>
      <hr/>
    `;
    cartItemsContainer.appendChild(div);
  });

  document.getElementById("total-price").textContent = `Total: ₹${total}`;
}

// 🗑 Remove item from cart
function removeItem(index) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  loadCart();
}

// 🧹 Clear full cart
function clearCart() {
  localStorage.removeItem("cart");
  loadCart();
}

// 🔙 Go back to product list
function goBack() {
  window.location.href = "product.html";
}

// 🔓 Logout function
function logout() {
  auth.signOut()
    .then(() => {
      localStorage.removeItem("cart");

      const ordersList = document.getElementById("ordersList");
      if (ordersList) {
        ordersList.innerHTML = "<p>Logged out. Please login to see orders.</p>";
      }

      alert("Logged out successfully");
      window.location.href = "index.html";
    })
    .catch((error) => {
      alert("Logout failed: " + error.message);
    });
}
