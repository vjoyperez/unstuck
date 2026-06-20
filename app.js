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

const allCards = Object.entries(cardNumbers).flatMap(([category, numbers]) =>
  numbers.map(number => ({
    number,
    category,
    front: `assets/fronts/${category}/${number} ${labels[category]} - FRONT.png`,
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
let deck = [];
let currentCard = null;
let revealTimer = null;
let anticipationTimer = null;
let releaseTimer = null;
let autoRevealPending = false;

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

function shuffled(cards) {
  const copy = [...cards];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function cardsForSelection() {
  return selectedCategory === "all"
    ? allCards
    : allCards.filter(card => card.category === selectedCategory);
}

function updateControls() {
  flipButton.disabled = !currentCard;
  emptyMessage.hidden = Boolean(currentCard) || deck.length > 0;
  cardEl.hidden = !currentCard;
}

function resetDeck() {
  clearRevealSequence();
  deck = shuffled(cardsForSelection());
  currentCard = null;
  cardEl.classList.remove("flipped", "dealing");
  updateControls();
}

function drawCard(autoReveal = false) {
  clearRevealSequence();
  if (!deck.length) deck = shuffled(cardsForSelection());
  currentCard = deck.shift();
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
    resetDeck();
    drawCard();
  });
});

flipButton.addEventListener("click", flipCard);
cardEl.addEventListener("click", flipCard);
shuffleButton.addEventListener("click", () => {
  deck = shuffled(deck);
  drawCard(true);
});

document.addEventListener("keydown", event => {
  if (event.code === "Space") {
    event.preventDefault();
    flipCard();
  }
  if (event.code === "ArrowRight") {
    deck = shuffled(deck);
    drawCard(true);
  }
});

resetDeck();
drawCard();
