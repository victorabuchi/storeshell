import type { BrandContent } from '../../src/brand/types';

// Replace images/placeholder.jpg with the brand's own photos.
const placeholder = require('./images/placeholder.jpg');

const content: BrandContent = {
  tagline: 'Your brand line goes here.',
  welcome: { image: placeholder, headline: 'Early access to drops, and the best of the brand.' },
  hero: {
    image: placeholder,
    eyebrow: 'New season',
    title: 'Headline goes here.',
    subtitle: 'A short line about the collection.',
    cta: 'Shop',
  },
  onboarding: {
    intro: { title: 'A few quick questions to personalise your experience.', images: [placeholder, placeholder] },
    shopFor: {
      title: 'Who do you shop for most?',
      options: [
        { id: 'men', label: "Men's", image: placeholder },
        { id: 'women', label: "Women's", image: placeholder },
      ],
    },
    activities: {
      title: 'What are you into?',
      options: [
        { id: 'everyday', label: 'Everyday', image: placeholder },
        { id: 'sport', label: 'Sport', image: placeholder },
      ],
    },
    size: { title: "What's your size?", options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    notifications: { title: 'Be first when new drops land', body: "We'll only notify you about drops and your orders." },
  },
};

export default content;
