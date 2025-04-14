console.log("✅ admin.js is connected");

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

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const ordersList = document.getElementById("adminOrdersList");
const adminContent = document.getElementById("adminContent");

// 🔐 Check if user is admin
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    adminContent.innerHTML = "Access denied. Please login.";
    return;
  }

  console.log("👤 Logged in UID:", user.uid);

  try {
    const adminDoc = await db.collection("admins").doc(user.uid).get();
    if (adminDoc.exists && adminDoc.data().isAdmin === true) {
      console.log("✅ Admin access granted");
      loadAllOrders();
    } else {
      adminContent.innerHTML = "Access denied. Admins only.";
      console.warn("❌ Not an admin or admin doc missing");
    }
  } catch (err) {
    adminContent.innerHTML = "Error checking admin access.";
    console.error("🔥 Error checking admin:", err);
  }
});

// 📦 Load all orders
function loadAllOrders() {
  db.collection("orders")
    .orderBy("timestamp", "desc")
    .onSnapshot(snapshot => {
      if (snapshot.empty) {
        ordersList.innerHTML = "<p>No orders found.</p>";
        return;
      }

      ordersList.innerHTML = "";
      snapshot.forEach(doc => {
        const order = doc.data();
        const orderId = doc.id;

        const div = document.createElement("div");
        div.style.border = "1px solid black";
        div.style.padding = "10px";
        div.style.margin = "10px 0";

        div.innerHTML = `
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>User ID:</strong> ${order.userId}</p>
          <p><strong>Status:</strong> ${order.status || "Pending"}</p>
          <p><strong>Total:</strong> ₹${order.total}</p>
          <p><strong>Event:</strong> ${order.eventDetails?.eventName || "-"} on ${order.eventDetails?.eventDate} at ${order.eventDetails?.eventTime}</p>
          <p><strong>People:</strong> ${order.eventDetails?.numPeople}</p>
          <p><strong>Timestamp:</strong> ${order.timestamp?.toDate().toLocaleString()}</p>
          <p><strong>Items:</strong></p>
          <ul>
            ${order.cart.map(item => `<li>${item.name} x ${item.quantity} = ₹${item.price * item.quantity}</li>`).join("")}
          </ul>
          <button onclick="deleteOrder('${orderId}')">🗑️ Delete</button>
          <button onclick="markCompleted('${orderId}')">✅ Mark as Completed</button>
        `;
        ordersList.appendChild(div);
      });
    });
}

// 🗑️ Delete
function deleteOrder(orderId) {
  if (confirm("Are you sure?")) {
    db.collection("orders").doc(orderId).delete()
      .then(() => alert("Deleted"))
      .catch(err => alert("Failed: " + err.message));
  }
}

// ✅ Mark Completed
function markCompleted(orderId) {
  db.collection("orders").doc(orderId).update({
    status: "Completed"
  }).then(() => alert("Marked Completed"))
    .catch(err => alert("Failed: " + err.message));
}

// 🚪 Logout
function logout() {
  auth.signOut().then(() => {
    alert("Logged out");
    window.location.href = "index.html";
  });
}
