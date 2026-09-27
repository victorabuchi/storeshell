import type { BrandContent } from '../../src/brand/types';

const images = {
  welcome: require('./images/welcome.jpg'),
  homeHero: require('./images/home-hero.jpg'),
  men: require('./images/men.jpg'),
  women: require('./images/women.jpg'),
  wall: require('./images/wall.jpg'),
  outerwear: require('./images/outerwear.jpg'),
  knitwear: require('./images/knitwear.jpg'),
  denim: require('./images/denim.jpg'),
  essentials: require('./images/essentials.jpg'),
  footwear: require('./images/footwear.jpg'),
  accessories: require('./images/accessories.jpg'),
};

const content: BrandContent = {
  logo: require('./logo.png'),
  logoAspectRatio: 736 / 127,
  tagline: "Greatness doesn't wait for good conditions.",
  welcome: {
    image: images.welcome,
    headline: 'Scandinavian fashion, early access to new drops, and the best of Frozenholm.',
  },
  hero: {
    image: images.homeHero,
    eyebrow: 'New season',
    title: "Greatness doesn't wait for good opportunities.",
    cta: 'Shop',
  },
  onboarding: {
    intro: {
      title: 'Tell us what you wear. A few quick questions.',
      images: [images.welcome, images.essentials, images.women, images.denim, images.wall, images.homeHero],
    },
    shopFor: {
      title: 'Who do you shop for?',
      options: [
        { id: 'men', label: 'Men', image: images.men },
        { id: 'women', label: 'Women', image: images.women },
      ],
    },
    categories: {
      title: 'What are you looking for?',
      sectionTitle: 'Shop by category',
      options: [
        { id: 'outerwear', label: 'Outerwear', image: images.outerwear },
        { id: 'knitwear', label: 'Knitwear', image: images.knitwear },
        { id: 'denim', label: 'Denim', image: images.denim },
        { id: 'essentials', label: 'Essentials', image: images.essentials },
        { id: 'footwear', label: 'Footwear', image: images.footwear },
        { id: 'accessories', label: 'Accessories', image: images.accessories },
      ],
    },
    size: {
      title: "What's your size?",
      options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    },
    notifications: {
      title: 'Be first to new drops',
      body: "We'll only notify you about new drops, restocks and your orders.",
    },
  },
};

export default content;
