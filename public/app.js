document.addEventListener('DOMContentLoaded', function () {
  // Get event ID from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get('id');

  console.log('Event ID:', eventId);

  if (eventId) {
    // Fetch event data from Firestore
    db.collection('events').doc(eventId).get().then(doc => {
      if (doc.exists) {
        const eventData = doc.data();
        document.title = eventData.name; // Set the page title to the event title
        document.getElementById('event-title').textContent = eventData.name;
        document.getElementById('event-description').textContent = eventData.details;
        document.getElementById('event-date').textContent = `Date: ${new Date(eventData.date.seconds * 1000).toLocaleString()}`;
        document.getElementById('event-location').textContent = `Location: ${eventData.venue}`;
        if (eventData.is_paid) {
          document.getElementById('ticket-price').textContent = `Ticket Price: $${eventData.price}`;
        }
      } else {
        alert('Event not found');
      }
    }).catch(error => {
      console.error('Error fetching event data:', error);
    });
  }

  // Add event listener to the form
  const form = document.getElementById('form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault(); // Prevent default form submission

      // Get form values
      const firstName = document.getElementById('first-name').value;
      const lastName = document.getElementById('last-name').value;
      const phoneNumber = document.getElementById('phone-number').value;
      const email = document.getElementById('email').value;

      console.log('Form Data:', {
        eventId: eventId,
        firstName: firstName,
        lastName: lastName,
        phoneNumber: phoneNumber,
        email: email,
      });

      // Save registration data to Firestore
      db.collection('guests').add({
        eventId: eventId,
        firstName: firstName,
        lastName: lastName,
        phoneNumber: phoneNumber,
        email: email,
        registrationDate: firebase.firestore.FieldValue.serverTimestamp()
      }).then(() => {
        console.log('Registration successful');
        document.getElementById('registration-form').style.display = 'none';
        document.getElementById('confirmation').style.display = 'block';

        // Generate QR code data
        const qrCodeData = `Event=${eventId}&Guest=${firstName} ${lastName}&Phone=${phoneNumber}&Email=${email}`;

        // Generate and download PDF ticket
        generatePDF(eventId, firstName, lastName, phoneNumber, email, qrCodeData);
      }).catch(error => {
        console.error('Error saving registration:', error);
        alert('Error during registration');
      });
    });
  } else {
    console.error('Form element not found');
  }
});

function generatePDF(eventId, firstName, lastName, phoneNumber, email, qrCodeData) {
  // Create a new jsPDF instance
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Add text to the PDF
  doc.setFontSize(22);
  doc.text('Event Ticket', 20, 20);

  doc.setFontSize(16);
  doc.text(`Event ID: ${eventId}`, 20, 40);
  doc.text(`Name: ${firstName} ${lastName}`, 20, 50);
  doc.text(`Phone: ${phoneNumber}`, 20, 60);
  doc.text(`Email: ${email}`, 20, 70);

  // Generate QR code and add it to the PDF
  QRCode.toDataURL(qrCodeData, { width: 100, margin: 2 }, function (err, url) {
    if (err) {
      console.error('Error generating QR code:', err);
      return;
    }
    doc.addImage(url, 'PNG', 20, 80, 100, 100);

    // Save the PDF
    doc.save(`Ticket_${firstName}_${lastName}.pdf`);
  });
}
