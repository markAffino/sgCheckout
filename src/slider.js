
import Glide from '@glidejs/glide';

const dateSlider = new Glide('.glide', {
  type: 'slider',
  perView: 8,
  gap: 5,
  focusAt: 0,
  bound: true,
  rewind: false,
  breakpoints: {
    800: {
      perView: 6,
    },
    600: {
      perView: 5,
    },
    480: {
      perView: 4,
    },
    380: {
      perView: 3,
    },
  },
});

export { dateSlider as default };
