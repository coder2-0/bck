function toggleForm() {
    var form = document.getElementById('property-form');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

var storedFiles = [];

function previewFiles() {
    var files = document.getElementById('file-input').files;
    var preview = document.getElementById('image-preview');
    preview.innerHTML = '';
    Array.from(files).forEach(file => {
        if (!/\.(jpe?g|png|webp)$/i.test(file.name)) {
            alert("Only image files (.jpg, .jpeg, .png, .webp) are allowed.");
            return;
        }
        var reader = new FileReader();
        reader.onload = function(e) {
            var img = document.createElement('img');
            img.src = e.target.result;
            preview.appendChild(img);
        };
        reader.readAsDataURL(file);
        storedFiles.push(file); 
    });
}

function addProperty() {
    var formData = new FormData();
    formData.append('name', document.getElementById('property-name').value);
    formData.append('location', document.getElementById('location').value);
    formData.append('description', document.getElementById('description').value);
    formData.append('availability', document.getElementById('availability').value);
    storedFiles.forEach(file => formData.append('images', file));

    axios.post('/api/properties', formData)
        .then(function (response) {
            console.log('Property added successfully');
            displayProperties(); // Reload the list
            resetForm();
        })
        .catch(function (error) {
            console.error('Error adding property:', error);
        });
}

function displayProperties() {
    axios.get('/api/properties')
        .then(function (response) {
            const propertiesList = document.getElementById('properties');
            propertiesList.innerHTML = '';
            response.data.forEach(function(property) {
                const li = document.createElement("li");
                li.innerHTML = `Name: ${property.name}, Location: ${property.location}, Description: ${property.description}, 
                                Availability: ${property.availability}, Images: ${property.images.join(", ")}
                                <button onclick='editProperty("${property._id}")'>Edit</button>
                                <button onclick='deleteProperty("${property._id}")'>Delete</button>`;
                propertiesList.appendChild(li);
            });
        })
        .catch(function (error) {
            console.error('Error loading properties:', error);
        });
}

function deleteProperty(id) {
    axios.delete(`/api/properties/${id}`)
        .then(function () {
            console.log('Property deleted successfully');
            displayProperties(); // Reload the list
        })
        .catch(function (error) {
            console.error('Error deleting property:', error);
        });
}

function editProperty(id) {
    const property = document.querySelector(`[data-id='${id}']`);
    document.getElementById('property-name').value = property.dataset.name;
    document.getElementById('location').value = property.dataset.location;
    document.getElementById('description').value = property.dataset.description;
    document.getElementById('availability').value = property.dataset.availability;
    document.getElementById('property-form').style.display = 'block';
}

function resetForm() {
    document.getElementById('property-name').value = '';
    document.getElementById('location').value = '';
    document.getElementById('description').value = '';
    document.getElementById('availability').value = 'Available';
    document.getElementById('file-input').value = '';
    storedFiles = [];
    document.getElementById('image-preview').innerHTML = '';
    document.getElementById('property-form').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', displayProperties);
