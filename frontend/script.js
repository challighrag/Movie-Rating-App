let token = '';
let currentUser = '';
let admin = false;

function toggleAuthForm() {
  const loginCard = document.querySelector('.auth-card');
  const registerCard = document.getElementById('register-card');
  
  if (loginCard.style.display === 'none') {
    loginCard.style.display = 'block';
    registerCard.style.display = 'none';
  } else {
    loginCard.style.display = 'none';
    registerCard.style.display = 'block';
  }
};

function showAddMoviePopup() {
  document.getElementById('add-movie-popup').style.display = 'flex';
}

function hideAddMoviePopup() {
  document.getElementById('add-movie-popup').style.display = 'none';
  document.getElementById('new-movie-title').value = '';
}

async function addMovie() {
  const title = document.getElementById('new-movie-title').value.trim();
  
  if (!title) {
    alert('Please enter a movie title');
    return;
  }

  try {
    const res = await fetch('http://localhost:5000/api/admin/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ title })
    });
    
    const data = await res.json();
    if (res.ok) {
      alert('Movie added successfully');
      hideAddMoviePopup();
      loadMovies();
    } else {
      alert(data.message || 'Failed to add movie');
    }
  } catch (error) {
    console.error('Error adding movie:', error);
    alert('Error adding movie');
  }
}

function setupAdminView() {
  const addMovieBtn = document.getElementById('add-movie-btn');
  
  if (admin) {
    addMovieBtn.style.display = 'inline-block';
  } else {
    addMovieBtn.style.display = 'none';
  }
};

async function register() {
  const username = document.getElementById('reg-username').value;
  const password = document.getElementById('reg-password').value;
  const email = document.getElementById('reg-email').value;
  const isAdmin = document.getElementById('admin-register').checked;
  
  if (!username || !password || !email) {
    alert('Please enter username, password, and e-mail');
    return;
  }
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    alert('Please enter a valid email address (example@domain.com)');
    return;
  }

  try {
    const res = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, isAdmin })
    });
    const data = await res.json();
    if (data.token) {
      token = data.token;
      admin = data.isAdmin;
      currentUser = username;
      updateAuthUI(true);
      alert('Registered and logged in successfully');
      document.getElementById('reg-username').value = "";
      document.getElementById('reg-password').value = "";
      document.getElementById('reg-email').value = "";
      document.getElementById('admin-register').checked = false;
      toggleAuthForm();
      setupAdminView();
      loadMovies();
    } else {
      alert(data.message || 'Registration failed');
    }
  } catch (error) {
    alert('Error during registration');
    console.error(error);
  }
}

async function login() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  if (!username || !password) {
    alert('Please enter both username and password');
    return;
  }

  try {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.token) {
      token = data.token;
      admin = data.isAdmin || false;
      currentUser = username;
      updateAuthUI(true);
      setupAdminView();
      document.getElementById('username').value = "";
      document.getElementById('password').value = "";
      loadMovies();
    } else {
      alert(data.message || 'Login failed');
    }
  } catch (error) {
    alert('Error during login');
    console.error(error);
  }
}
function logout() {
  token = '';
  currentUser = '';
  admin = false;
  loadMovies();
  setupAdminView();
  updateAuthUI(false);
};

function updateAuthUI(isLoggedIn) {
  const authContainer = document.querySelector('.auth-container');
  const userProfile = document.getElementById('user-profile');
  const displayUsername = document.getElementById('display-username');

  if (isLoggedIn) {
    authContainer.style.display = 'none';
    userProfile.style.display = 'flex';
    displayUsername.textContent = currentUser;
  } else {
    authContainer.style.display = 'block';
    userProfile.style.display = 'none';
    // Clear form fields
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
  }
}

async function loadMovies(query = '') {
  try {
    const url = query 
      ? `http://localhost:5000/api/movies?q=${query}`
      : 'http://localhost:5000/api/movies';
      
    const res = await fetch(url);
    const movies = await res.json();
    displayMovies(movies);
  } catch (error) {
    console.error('Error loading movies:', error);
  }
}

function displayMovies(movies) {
  const moviesContainer = document.getElementById('movies');
  
  moviesContainer.innerHTML = movies.map(movie => `
    <div class="movie-card">
      <div class="movie-content">
        <h3>${movie.title}</h3>
        <div class="rating">
          <span class="rating-value">${movie.averageRating?.toFixed(1) || 'N/A'} ⭐</span>
          <span class="review-count" onclick="showReviews('${movie._id}', '${movie.title}')">
            (${movie.reviewCount || 0} reviews)
          </span>
        </div>
        ${token ? `
        <div class="review-form">
          <textarea id="comment-${movie._id}" placeholder="Leave a review"></textarea>
          <div>
            <input type="number" id="rating-${movie._id}" min="1" max="5" placeholder="Rate">
            <button onclick="submitReview('${movie._id}')">Submit Review</button>
          </div>
        </div>
        ` : '<p>Log in to leave a review</p>'}
      </div>
    </div>
  `).join('');
}

async function showReviews(movieId, movieTitle) {
  try {
    const res = await fetch(`http://localhost:5000/api/reviews/${movieId}`);
    const reviews = await res.json();
    
    const modal = document.getElementById('reviews-modal');
    const modalTitle = document.getElementById('modal-title');
    const reviewsList = document.getElementById('reviews-list');
    
    modalTitle.textContent = `Reviews for ${movieTitle}`;
    reviewsList.innerHTML = reviews.length > 0 
    ? reviews.map(review => `
      <div class="review-item" data-review-id="${review._id}">
        <div class="review-user">${review.user?.username || 'Anonymous'}</div>
        <div class="review-rating">Rating: ${review.rating} ⭐</div>
        <div class="review-text"><b>Comment:</b> ${review.comment}</div>
        ${admin ? `<button class="delete-review-btn" onclick="deleteReview('${review._id}')">Delete review</button>` : ''}
      </div>
      `).join('')
    : '<p>No reviews yet for this movie.</p>';

    modal.style.display = 'block';
  } catch (error) {
    console.error('Error fetching reviews:', error);
    alert('Failed to load reviews');
  }
}
async function deleteReview(reviewId) {
  if (!confirm('Are you sure you want to delete this review?')) return;
  
  try {
    const res = await fetch(`http://localhost:5000/api/admin/delete/${reviewId}`, {
      method: 'DELETE',
      headers: {'Authorization': `Bearer ${token}`}
    });
    if (res.status === 403) {
      admin = false;
      setupAdminView();
      alert('Admin privileges revoked');
      return;
    }
    const data = await res.json();
    if (res.ok) {
      alert('Review deleted successfully');
      // Remove the review from the UI
      document.querySelector(`.review-item[data-review-id="${reviewId}"]`).remove();
      loadMovies(document.getElementById('search').value);
    } else {
      alert(data.message || 'Failed to delete review');
    }
  } catch (error) {
    console.error('Error deleting review:', error);
    alert('Error deleting review');
  }
}

async function submitReview(movieId) {
  const rating = document.getElementById(`rating-${movieId}`).value;
  const comment = document.getElementById(`comment-${movieId}`).value;

  if (!rating || rating < 1 || rating > 5) {
    alert('Please enter a valid rating between 1 and 5');
    return;
  }

  try {
    const res = await fetch('http://localhost:5000/api/reviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ movieId, rating, comment })
    });
    
    const data = await res.json();
    if (res.ok) {
      alert('Review submitted successfully');
      document.getElementById(`comment-${movieId}`).value = '';
      document.getElementById(`rating-${movieId}`).value = '';
      loadMovies(document.getElementById('search').value);
    } else {
      alert(data.message || 'Failed to submit review');
    }
  } catch (error) {
    console.error('Error submitting review:', error);
    alert('Error submitting review');
  }
}

document.getElementById('search').addEventListener('input', (e) => {
  loadMovies(e.target.value);
});

document.querySelector('.close-btn').addEventListener('click', () => {
  document.getElementById('reviews-modal').style.display = 'none';
});

window.addEventListener('click', (e) => {
  const modal = document.getElementById('reviews-modal');
  if (e.target === modal) {
    modal.style.display = 'none';
  }
});

window.addEventListener('load', () => {
  loadMovies();
});