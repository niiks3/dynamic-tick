const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");

admin.initializeApp();

const db = admin.firestore();
const app = express();

app.use(cors({origin: true}));

app.get("/register", async (req, res) => {
  const eventId = req.query.id;

  if (!eventId) {
    return res.status(400).send("Event ID is required");
  }

  try {
    const eventDoc = await db.collection("events").doc(eventId).get();

    if (!eventDoc.exists) {
      return res.status(404).send("Event not found");
    }

    const eventData = eventDoc.data();
    res.set("Cache-Control", "public, max-age=300, s-maxage=600");
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${eventData.title}</title>
        <link rel="stylesheet" href="/styles.css">
        <script src="https://www.gstatic.com/firebasejs/9.1.0/firebase-app.js">
        </script>
        <script src="https://www.gstatic.com/firebasejs/9.1.0/firebase-firestore.js">
        </script>
        <script src="https://www.gstatic.com/firebasejs/9.1.0/firebase-auth.js">
        </script>
        <script src="/firebase.js"></script>
      </head>
      <body>
        <div id="event-details">
          <h1 id="event-title">${eventData.title}</h1>
          <p id="event-description">${eventData.description}</p>
          <p id="event-date">
            Date: 
            ${new Date(eventData.startTime.seconds * 1000).
      toLocaleString()}
          </p>
          <p id="event-location">
          Location: ${eventData.location}</p>
          ${eventData.isFree ? "" : `<p id="ticket-price">
            Ticket Price: $${eventData.ticketPrice}</p>`}
        </div>
        <div id="registration-form">
          <h2>Register for this Event</h2>
          <form id="form">
            <input type="text" id="first-name"
             placeholder="First Name" required>
            <input type="text" id="last-name"
             placeholder="Last Name" required>
            <input type="text" id="phone-number"
             placeholder="Phone Number" required>
            <input type="email" id="email" placeholder="Your Email" required>
            <button type="submit">Register</button>
          </form>
        </div>
        <div id="confirmation" style="display: none;">
          <h2>Thank you for registering!</h2>
          <p>We have received your registration.</p>
        </div>
        <script src="/app.js"></script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error("Error fetching event data:", error);
    res.status(500).send("Internal Server Error");
  }
});

exports.app = functions.https.onRequest(app);
