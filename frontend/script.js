let token = '';

async function register() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const res = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if (data.token) {
    token = data.token;
    alert('Registered and logged in');
  }
};

async function login() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const res = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if (data.token) {
    token = data.token;
    alert('Logged in');
  }
};

document.getElementById('search').addEventListener('input', async (e) => {
  const query = e.target.value;
  const res = await fetch(`http://localhost:5000/api/movies?q=${query}`);
  const movies = await res.json();
  document.getElementById('movies').innerHTML = movies.map(movie => `
    <div>
      <h3>${movie.title}</h3>
      <p>Rating: ${movie.averageRating.toFixed(1)} ⭐ (${movie.reviewCount} reviews)</p>
      <textarea id="comment-${movie._id}" placeholder="Leave a review"></textarea>
      <input type="number" id="rating-${movie._id}" min="1" max="5" placeholder="Rating (1-5)">
      <button onclick="submitReview('${movie._id}')">Submit Review</button>
    </div>
  `).join('');
});
window.addEventListener('load', async () => {
  const res = await fetch(`http://localhost:5000/api/movies`);
  const movies = await res.json();
  document.getElementById('movies').innerHTML = movies.map(movie => `
    <div>
      <h3>${movie.title}</h3>
      <p>Rating: ${movie.averageRating?.toFixed(1) || 'N/A'} ⭐ (${movie.reviewCount || 0} reviews)</p>
    </div>
  `).join('');
});

async function submitReview(movieId) {
  const rating = document.getElementById(`rating-${movieId}`).value;
  const comment = document.getElementById(`comment-${movieId}`).value;

  const res = await fetch('http://localhost:5000/api/reviews', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ movieId, rating, comment })
  });
  const data = await res.json();
  if (res.ok) alert('Review submitted');
  else alert(data.message || 'Failed to submit review');
};