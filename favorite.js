const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const movies = JSON.parse(localStorage.getItem('favoriteMovies'))

const MOVIES_PER_PAGE = 12
let filteredMovies = []
let nowPage = 1
let nowMode = 'card'

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const mode = document.querySelector('#mode')
const cardMode = document.querySelector('#card-mode')
const listMode = document.querySelector('#list-mode')

function showModeMovieList() {
  const movieData = getMoviesByPage(nowPage)
  nowMode === 'card' ? renderCardModeMovieList(movieData) : renderListModeMovieList(movieData)
}


mode.addEventListener('click', function onModeClicked(event) {
  if (event.target.matches('#card-mode')) {
    nowMode = 'card'
    cardMode.classList.add('now-mode')
    listMode.classList.remove('now-mode')
  } else if (event.target.matches('#list-mode')) {
    nowMode = 'list'
    listMode.classList.add('now-mode')
    cardMode.classList.remove('now-mode')
  }
  showModeMovieList()
})


function renderCardModeMovieList(data) {
  let rawHTML = ''
  data.forEach(item => {
    rawHTML += `
     <div class="col-sm-4 col-md-3">
        <div class="mb-2">
          <div class="card" style="max-width: 20rem;">
            <img src="${POSTER_URL + item.image}" class="card-img-top" alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-toggle="modal"
                data-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">X</button>
            </div>
          </div>
        </div>
      </div>
    `
  });
  dataPanel.innerHTML = rawHTML
}


function renderListModeMovieList(data) {
  let rawHTML = ''
  rawHTML += '<table class="table"><tbody>'
  data.forEach(item => {
    rawHTML += `
     <tr>
       <td>
         <h5 class="card-title">${item.title}</h5>
      </td>
       <td>
         <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">More</button>
         <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">X</button>
       </td>
     </tr>
    `
  });
  rawHTML += '</tbody></table>'
  dataPanel.innerHTML = rawHTML
}


function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}


function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `
      <li class="page-item">
       <a class="page-link" href="#" data-page="${page}">${page}</a>
     </li>
    `
  }
  paginator.innerHTML = rawHTML
}


paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== "A") return
  nowPage = Number(event.target.dataset.page)
  showModeMovieList()
})


searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()
  if (!keyword.length) {
    return alert('請輸入有效字串！')
  }
  filteredMovies = movies.filter((movie =>
    movie.title.toLowerCase().includes(keyword)
  ))
  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
  }
  renderPaginator(filteredMovies.length)
  nowPage = 1
  showModeMovieList()
})


function showMovieModal(id) {
  const modalTitle = document.querySelector("#movie-modal-title")
  const modalImage = document.querySelector("#movie-modal-image")
  const modalDate = document.querySelector("#movie-modal-date")
  const modalDescription = document.querySelector('#movie-modal-description')
  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`
  })
}


function removeFromFavorite(id) {
  if (!movies) return
  const movieIndex = movies.findIndex((movie) => movie.id === id)
  if (movieIndex === -1) return
  movies.splice(movieIndex, 1)
  localStorage.setItem('favoriteMovies', JSON.stringify(movies))
  renderPaginator(movies.length)
  showModeMovieList(movies)
}


dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-remove-favorite')) {
    removeFromFavorite(Number(event.target.dataset.id))
  }
})


renderPaginator(movies.length)
showModeMovieList()