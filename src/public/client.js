let store = {
    user: { name: "Student" },
    apod: '',
    rovers: ['Curiosity', 'Opportunity', 'Spirit'],
    photos: [],
    selectedRover: '',
}

// add our markup to the page
const root = document.getElementById('root')

const updateStore = (store, newState) => {
    store = Object.assign(store, newState)
    render(root, store)
}

const render = async (root, state) => {
    root.innerHTML = App(state)
}


// create content
const App = (state) => {
    let { rovers, apod, selectedRover } = state

    if (!selectedRover) {
        updateStore(state, { selectedRover: rovers[0] });
    }

    return `
        <header></header>
        <main>
            ${Greeting(store.user.name)}
            <section>
                ${TabRovers(store, roverTabBtn)}
            </section>
        </main>
        <footer></footer>
    `
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, store);
    // For the 1st time, click the 1st button
    document.getElementById(store.selectedRover + '-btn').click();
})

// ------------------------------------------------------  COMPONENTS

// Pure function that renders conditional information -- THIS IS JUST AN EXAMPLE, you can delete it.
const Greeting = (name) => {
    if (name) {
        return `
            <h1>Welcome, ${name}!</h1>
        `
    }

    return `
        <h1>Hello!</h1>
    `
}

// Example of a pure function that renders infomation requested from the backend
const ImageOfTheDay = (apod) => {

    // If image does not already exist, or it is not from today -- request it again
    const today = new Date()
    const photodate = new Date(apod.date)
    console.log(photodate.getDate(), today.getDate());

    console.log(photodate.getDate() === today.getDate());
    if (!apod || apod.date === today.getDate() ) {
        getImageOfTheDay(store)
    }

    // check if the photo of the day is actually type video!
    if (apod.media_type === "video") {
        return (`
            <p>See today's featured video <a href="${apod.url}">here</a></p>
            <p>${apod.title}</p>
            <p>${apod.explanation}</p>
        `)
    } else {
        // Fix in case apod or apod.image are undefined
        if (apod && apod.image && apod.image.url) {
            return (`
                <img src="${apod.image.url}" height="350px" width="100%" />
                <p>${apod.image.explanation}</p>
            `)
        }
    }
}

const TabRovers = (state, roverTabBtn) => {
    let result = `<div class="tab">`;
    let { rovers } = state;

    // Append buttons tab for each item in rovers array
     for (let i = 0; i < rovers.length; i++) {
        result = result.concat(roverTabBtn(rovers[i]));
     }

     // Close the <div> buttons tag
     result = result.concat(`</div>`);

    // Rover content
    if (state.selectedRover) {
        result = result.concat(Rover(state.selectedRover));
    }

    return result;
}

const roverTabBtn = (rover) => {
    return `<button id="${rover + '-btn'}" class="tablinks ${(rover === store.selectedRover) ? 'active' : ''}" onclick="openTab(event)">${rover}</button>`;
}

const Rover = (rover) => {

    return (`
        <div id="rover" class="tabcontent">
            <h3>${rover}</h3>
            <div id="rover-content" class="row">${Images(convertImageToDiv)}</div>
        </div>
        `);
}

const Images = (convertImageToDiv) => {
    const images = Immutable.List(store.photos.photos).map(image => convertImageToDiv(image));

    return images.join('');
}

const convertImageToDiv = (image) => {
    return (`
        <div class="col-12 col-sm-6 col-md-4 mb-4">
            <div class="image-container">
                <img src="${image.img_src}" alt="${image.id}">
                <div class="overlay">Launch Date: ${image.rover.launch_date}</div>
                <div class="overlay">Landing Date: ${image.rover.landing_date}</div>
                <div class="overlay">Status: ${image.rover.status}</div>
                <div class="overlay">Most recent taken photos: ${image.rover.max_date}</div>
            </div>
        </div>
    `);
}

const openTab = (evt) => {
    let tablinks;

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    evt.currentTarget.className += " active";
    // Regenerate content of rover div
    document.getElementById("rover").innerHTML = `<div><h3>Loading...</h3></div>`;

    // Show Information on the tab
    generateInformation(evt.currentTarget.textContent);
}

const generateInformation = (rover) => {
    // Get photos first
    getPhotos(rover).then((data) => {
        updateStore(store, { photos: data.photos, selectedRover: rover });
    });

}

// ------------------------------------------------------  API CALLS

// Example API call
const getImageOfTheDay = (state) => {
    let { apod } = state

    fetch(`http://localhost:3000/apod`)
        .then(res => res.json())
        .then(apod => updateStore(store, { apod }))

    // return data
}

const getPhotos = async (rover) => {
    return fetch(`http://localhost:3000/rovers?rover=${rover}`)
        .then(res => res.json())
        .then(photos => {return photos});
}