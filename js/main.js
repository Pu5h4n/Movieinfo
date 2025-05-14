$(document).ready(() => {
  // Initialize search handler
  $('#searchForm').on('submit', (e) => {
    e.preventDefault();
    const query = $('#searchText').val().trim();
    if (!query) {
      showAlert('Please enter a movie or TV show title to search.');
      return;
    }
    searchMedia(query);
  });
});

// Search OMDB for movies and TV shows
function searchMedia(query) {
  $('#movies').html('<div class="text-center text-muted">Searching...</div>');
  axios.get(`https://www.omdbapi.com/?apikey=cfec9709&s=${encodeURIComponent(query)}`)
    .then((res) => {
      if (res.data.Response === 'False') {
        showAlert(res.data.Error);
        $('#movies').empty();
      } else {
        displayResults(res.data.Search);
      }
    })
    .catch((err) => {
      console.error(err);
      showAlert('An error occurred while fetching data.');
    });
}

// Render search results grid
function displayResults(items) {
  let html = '';
  items.forEach(item => {
    html += `
      <div class="col-sm-6 col-md-4 col-lg-3 mb-4">
        <div class="card h-100 bg-dark text-white border-secondary">
          <img src="${item.Poster !== 'N/A' ? item.Poster : 'https://via.placeholder.com/300x445?text=No+Image'}" 
               class="card-img-top" alt="${item.Title}">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${item.Title}</h5>
            <p class="card-text flex-grow-1">${item.Year}</p>
            <button onclick="selectMedia('${item.imdbID}')" 
                    class="btn btn-primary mt-auto">Details</button>
          </div>
        </div>
      </div>
    `;
  });
  $('#movies').html(html);
}

// Save selected ID and go to details page
function selectMedia(id) {
  sessionStorage.setItem('mediaId', id);
  window.location.href = 'details.html';
}

// Show alert message
function showAlert(message) {
  const alertHtml = `
    <div class="alert alert-warning alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>`;
  $('.container').first().prepend(alertHtml);
}

// Fetch and render single item details (on details.html)
function loadDetails() {
  const id = sessionStorage.getItem('mediaId');
  if (!id) {
    showAlert('No media selected.');
    return;
  }
  $('#details').html('<div class="text-center text-muted">Loading details...</div>');
  axios.get(`https://www.omdbapi.com/?apikey=cfec9709&i=${id}&plot=full`)
    .then(res => {
      if (res.data.Response === 'False') {
        showAlert(res.data.Error);
      } else {
        renderDetails(res.data);
      }
    })
    .catch(err => {
      console.error(err);
      showAlert('Failed to load details.');
    });
}

// Render the item details on the page
function renderDetails(media) {
  const html = `
    <div class="row mb-4">
      <div class="col-md-4">
        <img src="${media.Poster !== 'N/A' ? media.Poster : 'https://via.placeholder.com/300x445?text=No+Image'}" 
             class="img-fluid rounded" alt="${media.Title}">
      </div>
      <div class="col-md-8 text-white">
        <h2>${media.Title} <small class="text-muted">(${media.Year})</small></h2>
        <p><strong>Genre:</strong> ${media.Genre}</p>
        <p><strong>Released:</strong> ${media.Released}</p>
        <p><strong>Rated:</strong> ${media.Rated}</p>
        <p><strong>IMDB Rating:</strong> ${media.imdbRating}</p>
        <p><strong>Director:</strong> ${media.Director}</p>
        <p><strong>Writer:</strong> ${media.Writer}</p>
        <p><strong>Actors:</strong> ${media.Actors}</p>
      </div>
    </div>
    <div class="row">
      <div class="col-12">
        <div class="bg-secondary text-white p-3 rounded">
          <h3>Plot</h3>
          <p>${media.Plot}</p>
          <a href="https://www.imdb.com/title/${media.imdbID}" target="_blank" 
             class="btn btn-outline-light me-2">View on IMDB</a>
          <a href="index.html" class="btn btn-outline-light">Back to Search</a>
        </div>
      </div>
    </div>
  `;
  $('#details').html(html);
}
