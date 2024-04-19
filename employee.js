document.addEventListener('DOMContentLoaded', function() {
    fetchProperties();
});

var propertyRatings = {};  // Object to store ratings for each property

function fetchProperties() {
    fetch('http://localhost:3027/api/properties')
    .then(response => response.json())
    .then(properties => {
        const list = document.getElementById('property-list');
        list.innerHTML = '';
        properties.forEach(property => {
            const item = document.createElement('li');
            item.textContent = `${property.name} - ${property.location}`;
            item.onclick = () => showDetails(property);
            list.appendChild(item);
        });
    })
    .catch(err => console.error('Failed to load properties:', err));
}

function showDetails(property) {
    const details = document.getElementById('details');
    details.innerHTML = `
        <h2>Details for ${property.name}</h2>
        <p>Location: ${property.location}</p>
        <p>Description: ${property.description}</p>
        <p>Availability: ${property.availability}</p>
        <div id="rating-container"></div>
        <button onclick="hideDetails()">Close Details</button>
    `;
    const ratingContainer = document.getElementById('rating-container');
    const existingRating = propertyRatings[property._id];
    if (existingRating) {
        ratingContainer.innerHTML = `Your Rating: ${existingRating}`;
    } else {
        ratingContainer.innerHTML = `
            <input type="number" id="ratingInput" min="1" max="5" placeholder="Rate (1-5)">
            <button onclick="rateProperty('${property._id}')">Submit Rating</button>
        `;
    }
    details.style.display = 'block';
}

function rateProperty(propertyId) {
    const ratingInput = document.getElementById('ratingInput');
    const rating = parseInt(ratingInput.value);
    if (isNaN(rating) || rating < 1 || rating > 5) {
        alert("Please enter a valid rating between 1 and 5.");
        return;
    }
    fetch(`http://localhost:3027/api/properties/${propertyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newRating: rating, userId: 'some-user-id' })  // Assuming 'some-user-id' is your user identifier
    })
    .then(response => {
        if (!response.ok) throw new Error('Failed to submit rating');
        return response.json();
    })
    .then(updatedProperty => {
        propertyRatings[propertyId] = rating;
        document.getElementById('rating-container').innerHTML = `Your Rating: ${rating}`;
        alert('Rating submitted successfully');
    })
    .catch(err => alert('Error submitting rating: ' + err.message));
}

function hideDetails() {
    document.getElementById('details').style.display = 'none';
}

function filterProperties() {
    var input = document.getElementById('searchBar').value.toLowerCase();
    var properties = document.querySelectorAll('#property-list li');
    properties.forEach(property => {
        const isVisible = property.textContent.toLowerCase().includes(input);
        property.style.display = isVisible ? 'block' : 'none';
    });
}
