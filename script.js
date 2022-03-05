function populateList() {
  const data = Array.from({ length: 100 }).map((item, i) => `Item ${i + 1}`);

  const list = document.querySelector("#paginate .list");
  list.innerHTML = data.join("");
  return data;
}

const data = populateList();
// =================================================================================================

/**
 * @param perPage is the number of items per page to be shown in the website.
 */
const State = function (perPage) {
  this.getLocalPageData = function () {
    return localStorage.getItem("page");
  };
  this.page = this.getLocalPageData() || 1;
  this.perPage = perPage;
  this.totalPages = Math.ceil(data.length / this.perPage);
  this.maxVisible = 0;
};

const state = new State(5);
if (window.innerWidth < 370) {
  state.maxVisible = 3; //Let odd value for correct working.
} else state.maxVisible = 5;

const html = {
  get(element) {
    return document.querySelector(element);
  },
};

const controls = {
  prev() {
    state.page--;

    const firstPage = state.page < 1;
    if (firstPage) {
      state.page++;
    }
    localStorage.setItem("page", state.page);
  },
  next() {
    state.page++;

    const lastPage = state.page > state.totalPages;
    if (lastPage) {
      state.page--;
    }
    localStorage.setItem("page", state.page);
  },
  goTo(page) {
    if (!page) {
      page = 1;
    }
    if (page > state.totalPages) {
      page = state.totalPages;
    }
    state.page = +page;
    localStorage.setItem("page", state.page);
  },
  createListeners() {
    html.get(".first").addEventListener("click", function () {
      controls.goTo(1);
      update();
    });
    html.get(".last").addEventListener("click", function () {
      controls.goTo(state.totalPages);
      update();
    });
    html.get(".next").addEventListener("click", function () {
      controls.next();
      update();
    });
    html.get(".prev").addEventListener("click", function () {
      controls.prev();
      update();
    });
  },
};

const list = {
  create(item) {
    const div = document.createElement("div");
    div.classList.add("item");
    div.innerHTML = item;

    html.get(".list").appendChild(div);
  },
  update() {
    html.get(".list").innerHTML = "";

    let page = state.page - 1; //Because arrays begin in zero index value. Not 1. Reference: Ln 3 Col 44
    let start = page * state.perPage;
    let end = start + state.perPage;
    const paginatedItems = data.slice(start, end);
    paginatedItems.forEach(this.create);
  },
};

const buttons = {
  element: html.get(".pagination .numbers"),
  create(number) {
    const button = document.createElement("div");
    button.innerHTML = number;

    if (state.page == number) {
      button.classList.add("active");
    }

    button.addEventListener("click", function (event) {
      const page = event.target.innerText;

      controls.goTo(page);
      update();
    });

    this.element.appendChild(button);
  },
  update() {
    this.element.innerHTML = "";
    const { maxLeft, maxRight } = buttons.calculateMaxVisible();
    for (let page = maxLeft; page <= maxRight; page++) {
      this.create(page);
    }
  },
  calculateMaxVisible() {
    const pageNumber = +state.page;
    let maxLeft = pageNumber - Math.floor(state.maxVisible / 2);
    let maxRight = pageNumber + Math.floor(state.maxVisible / 2);
    if (maxLeft < 1) {
      maxLeft = 1;
      maxRight = state.maxVisible;
    }
    if (maxRight > state.totalPages) {
      maxLeft = state.totalPages - (state.maxVisible - 1);
      maxRight = state.totalPages;
      if (maxLeft < 1) {
        maxLeft = 1;
      }
    }
    return { maxLeft, maxRight };
  },
};

function update() {
  list.update();
  buttons.update();
}

function init() {
  controls.createListeners();
  update();
}

populateList();
init();
