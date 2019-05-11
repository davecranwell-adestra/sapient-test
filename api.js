const API_KEY = '9656065-a4094594c34f9ac14c7fc4c39';

export default function getImages(search, count) {
    return fetch(`https://pixabay.com/api/?key=${API_KEY}&q=${search}&image_type=photo&per_page=${count}`)
        .then(response => response.json())
}