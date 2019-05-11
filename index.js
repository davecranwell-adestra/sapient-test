import { Carousel } from './components/index.js';

const init = () => {
    Carousel.init();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    setTimeout(init, 0);
}
