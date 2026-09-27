import type { BrandContent } from '../../src/brand/types';

const images = {
  welcome: require('./images/welcome.jpg'),
  homeHero: require('./images/home-hero.jpg'),
  men: require('./images/men.jpg'),
  women: require('./images/women.jpg'),
  skiing: require('./images/skiing.jpg'),
  snowboarding: require('./images/snowboarding.jpg'),
  hiking: require('./images/hiking.jpg'),
  everyday: require('./images/everyday.jpg'),
  summit: require('./images/summit.jpg'),
  trail: require('./images/trail.jpg'),
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
      title: "Let's set Frozenholm up for how you move. A few quick questions.",
      images: [images.summit, images.snowboarding, images.women, images.skiing, images.hiking, images.trail],
    },
    shopFor: {
      title: 'Who do you shop for most?',
      options: [
        { id: 'men', label: "Men's", image: images.men },
        { id: 'women', label: "Women's", image: images.women },
      ],
    },
    activities: {
      title: 'How do you spend winter?',
      options: [
        { id: 'skiing', label: 'Skiing', image: images.skiing },
        { id: 'snowboarding', label: 'Snowboarding', image: images.snowboarding },
        { id: 'running', label: 'Winter running', image: images.welcome },
        { id: 'hiking', label: 'Hiking', image: images.hiking },
        { id: 'everyday', label: 'Everyday', image: images.everyday },
      ],
    },
    size: {
      title: "What's your size?",
      options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    },
    notifications: {
      title: 'Be first when new drops land',
      body: "We'll only notify you about new drops, restocks and your orders.",
    },
  },
};

export default content;
