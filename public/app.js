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
              eventName: eventData.name,
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
              generatePDF(eventData.name, firstName, lastName, phoneNumber, email, qrCodeData);
            }).catch(error => {
              console.error('Error saving registration:', error);
              alert('Error during registration');
            });
          });
        } else {
          console.error('Form element not found');
        }
      } else {
        alert('Event not found');
      }
    }).catch(error => {
      console.error('Error fetching event data:', error);
    });
  }
});

function generatePDF(eventName, firstName, lastName, phoneNumber, email, qrCodeData) {
  // Create a new jsPDF instance
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('portrait', 'mm', 'a4');

  // Add background image
  const imgData = 'https://cdn.pixabay.com/photo/2016/01/07/19/06/event-1126344_1280.jpg'; // URL of the background image
  doc.addImage(imgData, 'JPEG', 0, 0, 210, 297); // Cover the whole page

  // Draw rounded rectangle for details
  const rectX = 20;
  const rectY = 30;
  const rectWidth = 170;
  const rectHeight = 80;
  const rectRadius = 10;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(rectX, rectY, rectWidth, rectHeight, rectRadius, rectRadius, 'F');

  // Add text to the rounded rectangle
  doc.setFontSize(16);
  doc.setTextColor('#000000');
  const textX = rectX + 10;
  const textY = rectY + 10;
  const lineHeight = 10;

  doc.text(`Event: ${eventName}`, textX, textY);
  doc.text(`Name: ${firstName} ${lastName}`, textX, textY + lineHeight);
  doc.text(`Phone: ${phoneNumber}`, textX, textY + lineHeight * 2);
  doc.text(`Email: ${email}`, textX, textY + lineHeight * 3);

  // Generate QR code and add it to the PDF
  const qrCodeSize = 40;
  const qrCodeX = rectX + rectWidth - qrCodeSize - 10;
  const qrCodeY = rectY + rectHeight - qrCodeSize - 10;
  const qrCodeContent = `event=${encodeURIComponent(eventName)}&name=${encodeURIComponent(firstName + ' ' + lastName)}&phone=${encodeURIComponent(phoneNumber)}&email=${encodeURIComponent(email)}`;
  
  QRCode.toDataURL(qrCodeContent, { width: qrCodeSize, margin: 2 }, function (err, url) {
    if (err) {
      console.error('Error generating QR code:', err);
      return;
    }
    doc.addImage(url, 'PNG', qrCodeX, qrCodeY, qrCodeSize, qrCodeSize);

    // Save the PDF
    doc.save(`Ticket_${firstName}_${lastName}.pdf`);
  });
}

