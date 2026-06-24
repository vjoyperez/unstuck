const cardNumbers = {
  stuck: [3, 5, 7, 9, 11, 13, 17, 19, 21, 23, 25, 27, 29, 33, 35, 37, 39, 41, 43, 45, 47, 49, 51, 53],
  unstuck: [4, 6, 8, 10, 12, 14, 18, 20, 22, 24, 26, 28, 30, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54],
  wildcard: [1, 2, 15, 16, 31, 32],
};

const labels = { stuck: "STUCK", unstuck: "UNSTUCK", wildcard: "WILDCARD" };
const backs = {
  stuck: "assets/backs/STUCK - BACK.png",
  unstuck: "assets/backs/UNSTUCK - BACK.png",
  wildcard: "assets/backs/WILDCARD - BACK.png",
};

const tierNumbers = {
  A: [1, 2, 7, 8, 15, 16, 17, 18, 19, 20, 21, 22, 25, 26, 28, 31, 32, 45, 51, 52],
  B: [3, 4, 5, 6, 9, 10, 13, 14, 23, 24, 27, 29, 30, 37, 38, 40, 41, 42, 44, 46, 47, 48, 49, 50, 53, 54],
  C: [11, 12, 33, 34, 35, 36, 39, 43],
};

const tierByNumber = new Map(
  Object.entries(tierNumbers).flatMap(([tier, numbers]) =>
    numbers.map(number => [number, tier])
  )
);

const wildcardContributorByNumber = {
  1: "jeff-goodby",
  2: "rich-silverstein",
  15: "andy-pearson",
  16: "andy-pearson",
  31: "jesse-juriga",
  32: "jesse-juriga",
};

function contributorForCard(category, number) {
  if (category === "wildcard") return wildcardContributorByNumber[number];
  const pairedNumber = number % 2 === 0 ? number - 1 : number;
  return `stuck-unstuck-pair-${pairedNumber}`;
}

const correctedStuckFronts = new Set([7, 9, 11, 13, 17, 19, 21]);

function frontPathForCard(category, number) {
  const label = labels[category];
  const filename = category === "stuck" && correctedStuckFronts.has(number)
    ? `${number} ${label} - FRONT CORRECTED.png`
    : `${number} ${label} - FRONT.png`;
  return `assets/fronts/${category}/${filename}`;
}

const allCards = Object.entries(cardNumbers).flatMap(([category, numbers]) =>
  numbers.map(number => ({
    number,
    category,
    tier: tierByNumber.get(number),
    contributor: contributorForCard(category, number),
    front: frontPathForCard(category, number),
    back: backs[category],
  }))
);

const cardEl = document.querySelector("#card");
const frontImage = document.querySelector("#front-image");
const backImage = document.querySelector("#back-image");
const flipButton = document.querySelector("#flip");
const shuffleButton = document.querySelector("#shuffle");
const emptyMessage = document.querySelector("#empty-message");
const categories = [...document.querySelectorAll(".category")];

let selectedCategory = "all";
const deckStates = {};
let currentCard = null;
let revealTimer = null;
let anticipationTimer = null;
let releaseTimer = null;
let autoRevealPending = false;
let lastDrawnContributor = null;

function clearRevealSequence() {
  window.clearTimeout(revealTimer);
  window.clearTimeout(anticipationTimer);
  window.clearTimeout(releaseTimer);
  cardEl.classList.remove("anticipating");
  autoRevealPending = false;
  cardEl.disabled = false;
  shuffleButton.disabled = false;
  shuffleButton.textContent = "Shuffle";
  flipButton.textContent = "Flip";
}

function setRevealSequence(active) {
  autoRevealPending = active;
  cardEl.disabled = active;
  shuffleButton.disabled = active;
  flipButton.disabled = active;
  shuffleButton.textContent = active ? "Shuffling…" : "Shuffle";
  flipButton.textContent = active ? "Revealing…" : "Flip";
}

function cardsForCategory(category) {
  return category === "all"
    ? allCards
    : allCards.filter(card => card.category === category);
}

function resetDeckState(category) {
  deckStates[category] = {
    remaining: [...cardsForCategory(category)],
    drawCount: 0,
    firstCategory: null,
  };
}

function canFinishWithoutContributorRepeat(cards, precedingContributor) {
  const counts = new Map();
  cards.forEach(card => {
    counts.set(card.contributor, (counts.get(card.contributor) || 0) + 1);
  });

  let previous = precedingContributor;
  for (let index = 0; index < cards.length; index += 1) {
    const next = [...counts.entries()]
      .filter(([contributor, count]) => count > 0 && contributor !== previous)
      .sort((left, right) => right[1] - left[1])[0];

    if (!next) return false;
    const [contributor, count] = next;
    counts.set(contributor, count - 1);
    previous = contributor;
  }

  return true;
}

function initializeDeckStates() {
  ["all", "stuck", "unstuck", "wildcard"].forEach(resetDeckState);
}

function tiersAvailableForDraw(drawNumber) {
  if (drawNumber <= 2) return new Set(["A"]);
  if (drawNumber <= 7) return new Set(["A", "B"]);
  return new Set(["A", "B", "C"]);
}

function drawFromActiveDeck() {
  if (!deckStates[selectedCategory].remaining.length) {
    resetDeckState(selectedCategory);
  }

  const state = deckStates[selectedCategory];
  const drawNumber = state.drawCount + 1;
  const availableTiers = tiersAvailableForDraw(drawNumber);
  let candidates = state.remaining.filter(card => availableTiers.has(card.tier));

  if (selectedCategory === "all" && drawNumber <= 2) {
    candidates = candidates.filter(card => card.category !== "wildcard");
  }

  if (
    selectedCategory === "all" &&
    drawNumber === 2 &&
    ["stuck", "unstuck"].includes(state.firstCategory)
  ) {
    const requiredCategory = state.firstCategory === "stuck" ? "unstuck" : "stuck";
    candidates = candidates.filter(card => card.category === requiredCategory);
  }

  candidates = candidates.filter(card => card.contributor !== lastDrawnContributor);

  const sequenceSafeCandidates = candidates.filter(candidate => {
    const remainingAfterDraw = state.remaining.filter(card => card !== candidate);
    return canFinishWithoutContributorRepeat(remainingAfterDraw, candidate.contributor);
  });
  if (sequenceSafeCandidates.length) candidates = sequenceSafeCandidates;

  // The supplied tier assignments guarantee an eligible card at every draw.
  // This guard keeps the deck usable if its contents are edited in the future.
  if (!candidates.length) {
    const nonRepeatingRemaining = state.remaining.filter(
      card => card.contributor !== lastDrawnContributor
    );
    candidates = nonRepeatingRemaining.length
      ? nonRepeatingRemaining
      : [...state.remaining];
  }

  const chosenCard = candidates[Math.floor(Math.random() * candidates.length)];
  const chosenIndex = state.remaining.indexOf(chosenCard);
  state.remaining.splice(chosenIndex, 1);
  state.drawCount += 1;
  lastDrawnContributor = chosenCard.contributor;

  if (drawNumber === 1) state.firstCategory = chosenCard.category;

  return chosenCard;
}

function updateControls() {
  flipButton.disabled = !currentCard;
  emptyMessage.hidden = Boolean(currentCard) || deckStates[selectedCategory].remaining.length > 0;
  cardEl.hidden = !currentCard;
}

function drawCard(autoReveal = false) {
  clearRevealSequence();
  currentCard = drawFromActiveDeck();
  cardEl.classList.remove("flipped", "dealing");
  frontImage.src = currentCard.front;
  frontImage.alt = `${labels[currentCard.category]} card ${currentCard.number}`;
  backImage.src = currentCard.back;
  cardEl.hidden = false;
  void cardEl.offsetWidth;
  cardEl.classList.add("dealing");
  window.setTimeout(() => cardEl.classList.remove("dealing"), 470);
  updateControls();
  if (autoReveal) {
    setRevealSequence(true);
    anticipationTimer = window.setTimeout(() => cardEl.classList.add("anticipating"), 450);
    revealTimer = window.setTimeout(() => {
      cardEl.classList.add("flipped");
    }, 700);
    releaseTimer = window.setTimeout(() => {
      clearRevealSequence();
      updateControls();
    }, 1260);
  }
}

function flipCard() {
  if (autoRevealPending) return;
  clearRevealSequence();
  if (currentCard) cardEl.classList.toggle("flipped");
}

categories.forEach(button => {
  button.addEventListener("click", () => {
    selectedCategory = button.dataset.category;
    categories.forEach(item => item.classList.toggle("active", item === button));
    drawCard(true);
  });
});

flipButton.addEventListener("click", flipCard);
cardEl.addEventListener("click", flipCard);
shuffleButton.addEventListener("click", () => {
  drawCard(true);
});

document.addEventListener("keydown", event => {
  if (event.code === "Space") {
    event.preventDefault();
    flipCard();
  }
  if (event.code === "ArrowRight") {
    drawCard(true);
  }
});

initializeDeckStates();
drawCard(true);
