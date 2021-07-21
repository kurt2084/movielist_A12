//API資料取得相關變數
const BASE_URL = "https://movie-list.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/v1/movies/";
const POSTER_URL = BASE_URL + "/posters/";
//計算分頁相關變數
const MOVIES_PER_PAGE = 12;
//存放所有電影資料變數
const movies = [];
//存放過濾後電影資料變數
let filteredMovies = [];
//電影清單檢視方法變數
let view = "";
//當前電影頁面變數
let currentPage = 1;
//網頁元素定位相關
const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const displayStyle = document.querySelector("#display-style");
const paginator = document.querySelector("#paginator");

//function area
//圖片顯示電影資料函式
function renderMovieGallery(data) {
  let rawHTML = "";
  data.forEach((item) => {
    // title, image
    rawHTML += `<div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src="${POSTER_URL + item.image}"
              class="card-img-top" alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${item.id
      }">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id
      }">+</button>
            </div>
          </div>
        </div>
      </div>`;
  });
  dataPanel.innerHTML = rawHTML;
  view = "gallery";
}

//列表顯示電影資料函式
function renderMovieList(data) {
  let rawHTML = "";
  data.forEach((item) => {
    rawHTML += `
      <div class="col-sm-10">
          <div class="card-content d-flex justify-content-around align-items-center border-bottom p-2 m-2">
            <div class="col-sm-8">
              <h4 class="card-title ml-3">${item.title}</h4>
            </div>
            <div class="card-btn col-sm-4 text-center">
              <button class="btn btn-primary btn-show-movie mr-3" data-toggle="modal" data-target="#movie-modal"
                data-id="${item.id}">More</button>
              <button class="btn btn-danger btn-add-favorite" data-id="${item.id}">Favorite</button>
            </div>
          </div>
        </div>
      `;
  });
  dataPanel.innerHTML = rawHTML;
  view = "list";
}

//加入最愛清單函式
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem("favoriteMovies")) || []; //第一次取用為空陣列
  const movie = movies.find((movie) => movie.id === id);
  if (list.some((movie) => movie.id === id)) {
    return alert("此電影已經在收藏清單中!");
  }
  list.push(movie);
  localStorage.setItem("favoriteMovies", JSON.stringify(list));
}

//顯示電影詳細資料函式
function showMovieModal(id) {
  const modalTitle = document.querySelector("#movie-modal-title");
  const modalImage = document.querySelector("#movie-modal-image");
  const modalDate = document.querySelector("#movie-modal-date");
  const modalDescription = document.querySelector("#movie-modal-description");
  axios
    .get(INDEX_URL + id)
    .then((response) => {
      const data = response.data.results;
      modalTitle.innerText = data.title;
      modalDate.innerText = "Release date: " + data.release_date;
      modalDescription.innerText = data.description;
      modalImage.innerHTML = `<img src="${POSTER_URL + data.image
        }" alt="movie-poster" class="img-fluid">`;
    })
    .catch((err) => console.log(err));
}

// 判斷要顯示何種排列
function viewCheck(page) {
  if (view === "gallery") {
    renderMovieGallery(getMoviesByPage(page));
  } else {
    renderMovieList(getMoviesByPage(page));
  }
}

//設定分頁顯示電影清單數量
function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies;
  //計算起始 index
  const startIndex = (page - 1) * MOVIES_PER_PAGE;
  //回傳切割後的新陣列
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE);
}

//顯示電影總分頁數量函式
function renderPaginator(amount, currentPage) {
  //計算總頁數
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE);
  //製作 template
  let rawHTML = "";
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`;
  }
  //放回 HTML
  paginator.innerHTML = rawHTML;
  //paginator.children[currentPage - 1].classList.add("active"); // 當前頁數的數字標示起來
}

//
//電影分頁監聽器
paginator.addEventListener("click", function onPaginatorClicked(event) {
  //如果被點擊的不是 a 標籤，結束
  if (event.target.tagName !== "A") return;
  //透過 dataset 取得被點擊的頁數存入變數中
  currentPage = Number(event.target.dataset.page);
  //使用三元運算子判斷搜尋是否有資料,如果有就將filteredMovies的內容回傳給data變數
  const data = filteredMovies.length ? filteredMovies : movies;
  //呼叫renderPaginator傳入當前頁面的資料長度顯示資料
  renderPaginator(data.length, currentPage);
  //呼叫viewCheck傳入當前頁面資料判斷顯示方式為圖片或列表式
  viewCheck(currentPage);
});

//搜尋電影監聽器
searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
  event.preventDefault();
  const keyword = searchInput.value.trim().toLowerCase();

  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  );
  //錯誤處理：無符合條件的結果
  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`);
  }
  //如果有資料將搜尋過後當前頁面的資料長度交給renderPaginator處理
  renderPaginator(filteredMovies.length, currentPage);
  //當前頁面資料傳入viewCheck判斷以圖片或列表顯示
  viewCheck(currentPage);
});

//選擇資料顯示的模式（圖片或列表模式）
displayStyle.addEventListener("click", function onDisplayClicked(event) {
  //如果搜尋的目標為table-view就將當前頁面資料呼叫分頁資料處理過後再以圖片方式顯示
  if (event.target.matches(".table-view")) {
    renderMovieGallery(getMoviesByPage(currentPage));
    //如果為列表模式,就將資料丟給列表函式處理
  } else if (event.target.matches(".list-view")) {
    renderMovieList(getMoviesByPage(currentPage));
  }
});

//監聽電影清單按鈕
dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".btn-show-movie")) {
    showMovieModal(Number(event.target.dataset.id));
  } else if (event.target.matches(".btn-add-favorite")) {
    addToFavorite(Number(event.target.dataset.id));
  }
});

//取得電影資料
axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results);
    renderPaginator(movies.length, currentPage);
    renderMovieGallery(getMoviesByPage(currentPage));
  })
  .catch((err) => console.log(err));
