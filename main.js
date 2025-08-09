// Mobile menu toggle
document.getElementById('menu-toggle').addEventListener('click', function() {
    const menu = document.getElementById('mobile-menu');
    menu.classList.toggle('hidden');
});

// Image upload functionality
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const fileSelect = document.getElementById('file-select');
const previewContainer = document.getElementById('image-preview-container');
let selectedFiles = []; // To manage files for upload

fileSelect.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', handleFileInputChange);

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('border-lilac-500', 'bg-lilac-100');
});

['dragleave', 'dragend'].forEach(type => {
    dropZone.addEventListener(type, () => {
        dropZone.classList.remove('border-lilac-500', 'bg-lilac-100');
    });
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('border-lilac-500', 'bg-lilac-100');

    if (e.dataTransfer.files.length) {
        // Append new files to existing ones
        const newFiles = Array.from(e.dataTransfer.files);
        selectedFiles = [...selectedFiles, ...newFiles];
        updateFileInput();
        renderPreviews();
    }
});

function handleFileInputChange(e) {
    const files = e.target.files;
    if (files.length) {
        selectedFiles = Array.from(files); // Replace all files if selected via input
        renderPreviews();
    }
}

function updateFileInput() {
    const dataTransfer = new DataTransfer();
    selectedFiles.forEach(file => dataTransfer.items.add(file));
    fileInput.files = dataTransfer.files;
}

function renderPreviews() {
    previewContainer.innerHTML = ''; // Clear existing previews

    if (selectedFiles.length) {
        Array.from(selectedFiles).forEach((file, index) => {
            if (!file.type.match('image.*')) return;

            const reader = new FileReader();

            reader.onload = function(e) {
                const preview = document.createElement('div');
                preview.className = 'relative group';
                preview.innerHTML = `
                    <img src="${e.target.result}" alt="Preview of ${file.name}" class="w-full h-48 object-cover rounded-lg">
                    <div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                        <button class="remove-image-btn text-white bg-red-500 rounded-full p-2 hover:bg-red-600" data-index="${index}">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                        </button>
                    </div>
                `;
                previewContainer.appendChild(preview);
            };

            reader.readAsDataURL(file);
        });

        // Add event listeners to new remove buttons
        previewContainer.querySelectorAll('.remove-image-btn').forEach(button => {
            button.addEventListener('click', function() {
                const indexToRemove = parseInt(this.dataset.index);
                selectedFiles.splice(indexToRemove, 1); // Remove file from array
                updateFileInput(); // Update the file input
                renderPreviews(); // Re-render previews
            });
        });
    }
}

// Form validation and feedback
const contactForm = document.querySelector('#contact form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        // Remove previous messages
        contactForm.querySelectorAll('.error-message, .success-message').forEach(el => el.remove());
        let valid = true;
        let name = contactForm.querySelector('#name');
        let email = contactForm.querySelector('#email');
        let message = contactForm.querySelector('#message');
        if (!name.value.trim()) {
            showError(name, 'Full Name is required.');
            valid = false;
        }
        if (!email.value.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value)) {
            showError(email, 'A valid Email Address is required.');
            valid = false;
        }
        if (!message.value.trim()) {
            showError(message, 'Message is required.');
            valid = false;
        }
        if (valid) {
            showSuccess(contactForm, 'Thank you! Your message has been sent.');
            contactForm.reset();
        }
    });
}
function showError(input, msg) {
    const div = document.createElement('div');
    div.className = 'error-message';
    div.innerText = msg;
    // Insert after the input, before the next sibling
    input.parentNode.insertBefore(div, input.nextSibling);
}
function showSuccess(form, msg) {
    const div = document.createElement('div');
    div.className = 'success-message';
    div.innerText = msg;
    form.insertBefore(div, form.firstChild);
}

// Newsletter form validation
const newsletterForm = document.querySelector('form.flex.flex-col');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        newsletterForm.querySelectorAll('.error-message, .success-message').forEach(el => el.remove());
        let email = newsletterForm.querySelector('input[type="email"]');
        if (!email.value.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value)) {
            showError(email, 'Please enter a valid email address.');
        } else {
            showSuccess(newsletterForm, 'Subscribed! Thank you.');
            newsletterForm.reset();
        }
    });
}

// Upload All button logic with loading spinner and backend integration
const uploadBtn = document.querySelector('#admin button.bg-lilac-600');
if (uploadBtn) {
    uploadBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        document.querySelectorAll('.spinner, .error-message, .success-message').forEach(el => el.remove());
        
        if (!selectedFiles.length) { // Use selectedFiles array
            showError(uploadBtn.closest('div'), 'Please select images to upload.');
            return;
        }
        // Show spinner
        const spinner = document.createElement('div');
        spinner.className = 'spinner';
        uploadBtn.parentNode.insertBefore(spinner, uploadBtn);
        // Prepare form data
        const formData = new FormData();
        Array.from(selectedFiles).forEach(f => formData.append('images', f)); // Use selectedFiles
        try {
            const res = await fetch('http://localhost:4000/upload', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer your_admin_token_here' // Replace with your real token
                },
                body: formData
            });
            spinner.remove();
            if (!res.ok) {
                const err = await res.json();
                showError(uploadBtn.closest('div'), err.error || 'Upload failed.');
                return;
            }
            const data = await res.json();
            showSuccess(uploadBtn.closest('div'), 'Images uploaded! URLs: ' + data.urls.join(', '));
            selectedFiles = []; // Clear selected files after successful upload
            updateFileInput();
            renderPreviews();
        } catch (err) {
            spinner.remove();
            showError(uploadBtn.closest('div'), 'Network or server error.');
        }
    });
}

// Removed hero section animation JavaScript as it will be handled by CSS.
