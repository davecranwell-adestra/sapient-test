import getImages from '../api.js';

function clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
};

export default class Carousel {
    constructor(element) {
        // bind class methods
        this.handleNext = this.handleNext.bind(this);
        this.handlePrev = this.handlePrev.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleResize = this.handleResize.bind(this);

        // Ref to mounted element
        this.element = element;

        // destructure configuration off dataset
        const { 
            count, 
            search, 
            template, 
            templateItem, 
        } = this.element.dataset;

        // store configuration for later use. 
        this.count = count;
        this.template = document.querySelector(template).content;
        this.templateItem = templateItem;
        this.bounds = this.element.getBoundingClientRect();

        // state
        this.selected = 0;

        // try to load images on initalisation
        getImages(search, count)
            .then(data => data.hits.length && this.render(data.hits))
    };

    render(data) {
        // find main template source and clone it
        const newCarousel = document.importNode(this.template, true);
        
        // map over each image in the retrieved data, generating a document fragment for each
        // based on the template of each list item (this.templateItem)
        const listItems = data.map(image => {
            const { previewURL, webformatURL, tags } = image;

            const newItem =  document.importNode(this.template.querySelector(this.templateItem), true);
            
            // Set picture elemtn
            const carouselPicture = newItem.querySelector('picture');
            const carouselPictureSource = carouselPicture.querySelector('source');
            carouselPictureSource.srcset = webformatURL;

            // set fallback image within picture
            const carouselImage = carouselPicture.querySelector('img');
            carouselImage.src = previewURL

            // set image title (title not supported by API? usign tags for now) 
            const imageTitle = newItem.querySelector('h2');
            imageTitle.innerHTML = tags;

            return newItem;
        });

        const listClone = newCarousel.querySelector('ul');

        // Empty the source template list before appending our enw items
        listClone.innerHTML='';
        listItems.forEach(item => listClone.appendChild(item));

        const { 
            templateNext, 
            templatePrev 
        } = this.element.dataset;

        this.templateNext = newCarousel.querySelector(templateNext);
        this.templatePrev = newCarousel.querySelector(templatePrev);

         // Empty our target element (this.element) before appending our carousel
        this.element.innerHTML = '';
        this.element.appendChild(newCarousel);
        this.list = this.element.querySelector('ul');

        this.attachHandlers();
        this.position();
    }

    position(){
        console.log('here');
        const { width } = this.bounds;

        const transform = `translate3d(${(width/2) + (200 * -this.selected) - 200/2}px,0,0)`;

        this.list.style.transform = transform;
    }

    reset() {
        this.selected = 0;
        this.position();
    }

    attachHandlers() {
        this.templateNext.addEventListener('click', this.handleNext);
        this.templatePrev.addEventListener('click', this.handlePrev);
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('resize', this.handleResize)
    }

    // Detaching useful if components are mounted/unmounted without page reloads
    // and might otherwise leave event listeners polluting behaviour unexpectedly.
    detachHandlers() {
        this.templateNext.removeEventListener('click', this.handleNext);
        this.templatePrev.removeEventListener('click', this.handlePrev);
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('resize', this.handleResize)
    }

    handleNext() {
        this.selected = clamp(this.selected + 1, 0, this.count-1);
        this.position();
    }

    handlePrev() {
        this.selected = clamp(this.selected - 1, 0, this.count-1);
        this.position();
    }

    handleKeyDown() {
        switch(event.code) {
            case "Escape":
                this.reset();
                break;
            case "KeyA":
            case "ArrowLeft":
                this.handlePrev();
                break;
            case "KeyD":
            case "ArrowRight":
                this.handleNext();
                break;
        }
    }

    handleResize() {
        this.bounds = this.element.getBoundingClientRect();
        this.position();
    }

}

// Static method allowing us to group initialisation within a component's file
// without us being required to `new Component` before it can be used.
// Initialisation could also come from another method, inherited by the class,
// such as lazy initialisation based on user intent e.g hover
Carousel.init = () => {
    const selector = '[data-component="carousel"]'

    Array.prototype.forEach.call(
        document.querySelectorAll(selector),
        element => new Carousel(element)
    );
}
