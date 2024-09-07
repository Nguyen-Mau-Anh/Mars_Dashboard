let store = {
    user: { name: "Student" },
    apod: '',
    rovers: ['Curiosity', 'Opportunity', 'Spirit'],
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
    let { rovers, apod } = state

    return `
        <header></header>
        <main>
            ${Greeting(store.user.name)}
            <section>
                ${TabRovers(rovers)}
            </section>
        </main>
        <footer></footer>
    `
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, store);
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

const TabRovers = (rovers) => {
    let result = `<div class="tab">`;

    // Append buttons tab for each item in rovers array
     for (let i = 0; i < rovers.length; i++) {
        result = result.concat(roverTabBtn(rovers[i]));
     }

     // Close the <div> buttons tag
     result = result.concat(`</div>`);

     // Append a Rover component for each item in rovers item
     for (let i = 0; i < rovers.length; i++) {
        result = result.concat(Rover(rovers[i]));
     }

    return result;
}

const roverTabBtn = (rover) => {
    return `<button class="tablinks" onclick="openTab(event)">${rover}</button>`;
}

const Rover = (rover) => {
    return (`
        <div id="${rover}" class="tabcontent">
            <h3>${rover}</h3>
            <p>Content for ${rover}:</p>
            <div id="${rover + '-content'}"></div>
        </div>
        `);
}

const openTab = (evt) => {
    let tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(evt.currentTarget.textContent).style.display = "block";
    evt.currentTarget.className += " active";

    // Show Information on the tab
    generateInformation(evt.currentTarget.textContent);
}

const generateInformation = (rover) => {
    // Get photos first
    getPhotos(rover).then((photos) => {
        console.log(photos);
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

const getPhotos = (rover) => {
    return fetch(`http://localhost:3000/rovers?rover=${rover}`)
        .then(res => res.json())
        .then(photos => {return photos});
}