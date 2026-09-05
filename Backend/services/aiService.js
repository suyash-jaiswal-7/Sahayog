const serviceKeywords = {
  Plumbing: [
    "tap",
    "pipe",
    "leak",
    "leaking",
    "water",
    "plumber",
    "bathroom",
    "sink",
  ],

  Electrical: [
    "fan",
    "light",
    "switch",
    "wire",
    "electric",
    "electricity",
    "socket",
  ],

  Carpentry: [
    "door",
    "table",
    "chair",
    "wood",
    "furniture",
    "cabinet",
  ],

  Painting: [
    "paint",
    "painting",
    "wall",
    "colour",
    "color",
  ],

  Cleaning: [
    "clean",
    "cleaning",
    "dust",
    "floor",
    "washroom",
  ],
};

export const detectService = async (description) => {
  const text = description.toLowerCase();

  let bestService = null;
  let bestScore = 0;

  for (const [service, keywords] of Object.entries(serviceKeywords)) {
    let score = 0;

    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        score++;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestService = service;
    }
  }

  return {
    service: bestService,
    confidence: bestScore > 0 ? Math.min(bestScore / 3, 1) : 0,
  };
};