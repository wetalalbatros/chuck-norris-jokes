const selectJokeTypeRadio = document.querySelectorAll('#select-joke-form input[type=radio][name="joke-type"]');
        selectJokeTypeRadio.forEach(elem => elem.addEventListener("click", function() {
            const jokeTypes = [{
                name: "joke-from-category",
                callback: getJokeCategoriesList,
                containerSelector: "#joke-categories-list"
            }, {
                name: "search-joke",
                callback: showJokeSearchField,
                containerSelector: "#joke-search-field"
            }];

            const form = this.closest('form');
            const additionalParams = form.querySelectorAll(".additon-parameters");
            additionalParams.forEach(elem => elem.innerHTML = "");

            if (this.value !== "random-joke") {
                const {
                    callback,
                    containerSelector
                } = jokeTypes.find(({
                    name
                }) => name === this.value);
                const jokeCategoriesList = form.querySelector(containerSelector);
                jokeCategoriesList.insertAdjacentHTML("beforeend", callback());
                if (this.value === "joke-from-category") {
                    jokeCategoriesList.addEventListener("click", function({
                        target
                    }) {
                        switchItems(this, target, "joke-category", "selected");
                    });
                }
            }

            form.querySelector("input[type=submit]").removeAttribute("disabled");
        }));


        
        const jokeList = document.getElementById("joke-list");
        const favoriteJokesList = document.getElementById("favorite-jokes-feed"); 
        
        
        let favoriteJokes = [];
        if(localStorage.getItem("favorite-jokes")) {
            favoriteJokes = JSON.parse(localStorage.getItem("favorite-jokes"));
            const jokesArr = favoriteJokes.map(joke => createFavoriteJoke(joke));
            favoriteJokesList.append(...jokesArr);            
        }
               
        const findJokeForm = document.getElementById("select-joke-form");
        findJokeForm.addEventListener("submit", function(e) {
            e.preventDefault();
            const additionalParams = this.querySelectorAll(".additon-parameters");
            let url = this.action;
            const jokeType = this.querySelector('input[type=radio][name="joke-type"]:checked').value;
            if (jokeType === "random-joke") {
                url += "random";
            } else if (jokeType === "search-joke") {
                const searchPharse = this.querySelector('input[name="search-joke-text"]').value;
                url += `search?query=${searchPharse}`;
            } else if (jokeType === "joke-from-category") {
                const {
                    category
                } = this.querySelector('#joke-categories-list .joke-category.selected').dataset;
                url += `random?category=${category}`;
            }
            fetch(url).
            then(response => response.json()).
            then(result => {
                if (result.total) {
                    const jokesArr = result.result.map(joke => {
                        const favoriteJoke = favoriteJokes.find(item => item.id === joke.id);
                        joke.active = favoriteJoke ? "active" : false;
                        const newJoke = createJoke(joke);
                        return newJoke;
                    });
                    jokeList.append(...jokesArr);
                } else {
                    const jokeItem = createJoke(result);
                    jokeList.insertAdjacentElement("beforeend", jokeItem);
                }
            });
        });

        function getJokeCategoriesList() {
            return `<div class="joke-categories">
                        <span class="joke-category selected" data-category="animal">animal</span>
                        <span class="joke-category" data-category="career">career</span>
                        <span class="joke-category" data-category="celebrity">celebrity</span>
                        <span class="joke-category" data-category="dev">dev</span>
                    </div>`;
        }

        function switchItems(itemsList, target, itemClass, itemActiveClass) {
            if (target.classList.contains(itemClass)) {
                const prevSelectedElem = itemsList.querySelector(`.${itemClass}.${itemActiveClass}`);
                prevSelectedElem.classList.remove(itemActiveClass);
                target.classList.add(itemActiveClass);
            }
        }

        function showJokeSearchField() {
            return `<input class="search-field" type="text" name="search-joke-text" placeholder="Free text search...">`;
        }

        function createJoke({id, updated_at, url, categories, value, active}) {
            const jokeCreateDate = new Date(updated_at);
            const hoursAfteUpdate = Math.ceil((new Date() - jokeCreateDate) / (1000 * 3600));
            const joke = document.createElement("div");
            joke.className = "joke-item";
            joke.dataset.id = id;
            joke.insertAdjacentHTML("beforeend", `
                        <span class="joke-type">
                            <i class="joke-type-text-icon">
                                <span class="joke-type-text-line"></span>
                                <span class="joke-type-text-line"></span>
                                <span class="joke-type-text-line"></span>
                            </i>
                        </span>
                        <span class="joke-favorite-icon ${active || ""}"></span>
                        <p class="joke-id">ID: <a href="${url}" class="joke-id-link">${id} <i class="joke-id-link-icon"></i></a></p>
                        <p class="joke-text">${value}</p>
                        <div class="joke-info">
                            <span class="joke-last-update">Last update: ${hoursAfteUpdate} hours ago</span>
                            ${(categories[0]) ? `<span class="joke-category">${categories[0]}</span>` : ""}
                        </div>`);
            joke.addEventListener("click", function({target}) {
                const {classList} = target;
                if(classList.contains("joke-favorite-icon")) {
                    
                    if(!classList.contains("active")) {
                        const favoritejokeInfo = {id, updated_at, url, categories, value, active: "active"};
                        favoriteJokes.push(favoritejokeInfo);
                        localStorage.setItem("favorite-jokes", JSON.stringify(favoriteJokes));
                        const favoriteJoke = createFavoriteJoke(favoritejokeInfo);  
                        favoriteJokesList.insertAdjacentElement("beforeend", favoriteJoke);
                    }
                    else {
                        const deleteFavoriteJoke = document.querySelector(`.favorite-joke-item[data-id=${id}]`);
                        deleteFavoriteJoke.remove();
                        const index = favoriteJokes.findIndex(item => item.id === id);
                        localStorage.setItem("favorite-jokes", JSON.stringify(favoriteJokes));
                        favoriteJokes.splice(index, 1);
                    }
                    classList.toggle("active");
                }
            });
            return joke;
        }
        
        function createFavoriteJoke({id, updated_at, url, categories, value}) {
            const jokeCreateDate = new Date(updated_at);
            const hoursAfteUpdate = Math.ceil((new Date() - jokeCreateDate) / (1000 * 3600));
            const joke = document.createElement("div");
            joke.className = "favorite-joke-item";
            joke.dataset.id = id;
            joke.insertAdjacentHTML("beforeend", `
                        <span class="joke-type">
                            <i class="joke-type-text-icon joke-type-grey favorite-joke-type">
                                <span class="joke-type-text-line"></span>
                                <span class="joke-type-text-line"></span>
                                <span class="joke-type-text-line"></span>
                            </i>
                        </span>
                        <span class="joke-favorite-icon sidebar-favorite-icon active"></span>
                        <p class="joke-id">ID: <a href="${url}" class="joke-id-link">${id} <i class="joke-id-link-icon"></i></a></p>
                        <p class="favorite-joke-text">${value}</p>
                        <div class="joke-info">
                            <p class="joke-last-update">Last update: ${hoursAfteUpdate} hours ago</p>
                        </div>`);
            joke.addEventListener("click", function({target}) {
                if(target.classList.contains("joke-favorite-icon")) {
                    const deleteFavoriteJoke = document.querySelector(`.favorite-joke-item[data-id="${id}"]`);
                    deleteFavoriteJoke.querySelector(".joke-favorite-icon").classList.remove("active");
                    const deleteJoke = document.querySelector(`.joke-list .joke-item[data-id="${id}"]`);
                    if(deleteJoke) {
                        deleteJoke.querySelector(".joke-favorite-icon").classList.remove("active");        
                    }
                                
                    const index = favoriteJokes.findIndex(item => item.id === id);
                    favoriteJokes.splice(index, 1);
                    localStorage.setItem("favorite-jokes", JSON.stringify(favoriteJokes));
                    this.remove();
                }
            });
            return joke;
        }        
      

const favoriteOpenBtn = document.getElementById("menuToggle").addEventListener("click",()=>{
    const menuToggleInput = document.getElementById("menuToggleInput");
    const rightSide = document.getElementById("favorite-jokes-sidebar");
    const blocker = document.getElementById("blocker")
    if (menuToggleInput.checked) {
        rightSide.classList.add("active");
        blocker.classList.add("active");
    } else {
        rightSide.classList.remove("active");
        blocker.classList.remove("active");
    }
})
