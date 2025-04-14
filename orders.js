// ✅ orders.js
console.log("✅ orders.js is connected");

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

document.addEventListener("DOMContentLoaded", () => {
  auth.onAuthStateChanged(user => {
    if (user) {
      loadUserOrders(user.uid);
    } else {
      document.getElementById("ordersList").innerHTML = "<p>Please log in to view your orders.</p>";
    }
  });
});

function loadUserOrders(userId) {
  db.collection("orders")
    .where("userId", "==", userId)
    .orderBy("timestamp", "desc")
    .get()
    .then(snapshot => {
      const ordersList = document.getElementById("ordersList");
      if (snapshot.empty) {
        ordersList.innerHTML = "<p>You have no orders yet.</p>";
        return;
      }

      ordersList.innerHTML = ""; // Clear loading text

      snapshot.forEach(doc => {
        const order = doc.data();
        const div = document.createElement("div");
        div.innerHTML = `
          <hr/>
          <p><strong>🧾 Order ID:</strong> ${doc.id}</p>
          <p><strong>Status:</strong> ${order.status}</p>
          <p><strong>Total:</strong> ₹${order.total}</p>
          <p><strong>Event:</strong> ${order.eventDetails?.eventName} on ${order.eventDetails?.eventDate} at ${order.eventDetails?.eventTime}</p>
          <p><strong>People:</strong> ${order.eventDetails?.numPeople}</p>
          <p><strong>Ordered At:</strong> ${order.timestamp?.toDate().toLocaleString()}</p>
          <p><strong>Items:</strong></p>
          <ul>
            ${order.cart.map(item => `<li>${item.name} x ${item.quantity} (₹${item.price})</li>`).join('')}
          </ul>
        `;
        ordersList.appendChild(div);
      });
    })
    .catch(error => {
      console.error("Error fetching orders:", error);
      document.getElementById("ordersList").innerHTML = "<p>Error loading orders.</p>";
    });
}

function logout() {
  auth.signOut()
    .then(() => {
      alert("Logged out!");
      window.location.href = "index.html";
    })
    .catch((error) => {
      alert("Logout failed: " + error.message);
    });
}
