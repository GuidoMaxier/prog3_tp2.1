class Card {
    constructor(name, img) {
        this.name = name;
        this.img = img;
        this.isFlipped = false;
        this.element = this.#createCardElement();
    }

    #createCardElement() {
        const cardElement = document.createElement("div");
        cardElement.classList.add("cell");
        cardElement.innerHTML = `
          <div class="card" data-name="${this.name}">
              <div class="card-inner">
                  <div class="card-front"></div>
                  <div class="card-back">
                      <img src="${this.img}" alt="${this.name}">
                  </div>
              </div>
          </div>
      `;
        return cardElement;
    }

    #flip() {
        const cardElement = this.element.querySelector(".card");
        cardElement.classList.add("flipped");
    }

    #unflip() {
        const cardElement = this.element.querySelector(".card");
        cardElement.classList.remove("flipped");
    }

    //1.- INICIO 
    toggleFlip() {
        if (this.isFlipped) {
            this.#unflip();
        } else {
            this.#flip();
        }
        this.isFlipped = !this.isFlipped; 
    }

    matches(otherCard) {
        return this.name === otherCard.name;
    }
    // FIN

}

class Board {
    constructor(cards) {
        this.cards = cards;
        this.fixedGridElement = document.querySelector(".fixed-grid");
        this.gameBoardElement = document.getElementById("game-board");
    }

    #calculateColumns() {
        const numCards = this.cards.length;
        let columns = Math.floor(numCards / 2);

        columns = Math.max(2, Math.min(columns, 12));

        if (columns % 2 !== 0) {
            columns = columns === 11 ? 12 : columns - 1;
        }

        return columns;
    }

    #setGridColumns() {
        const columns = this.#calculateColumns();
        this.fixedGridElement.className = `fixed-grid has-${columns}-cols`;
    }

    render() {
        this.#setGridColumns();
        this.gameBoardElement.innerHTML = "";
        this.cards.forEach((card) => {
            card.element
                .querySelector(".card")
                .addEventListener("click", () => this.onCardClicked(card));
            this.gameBoardElement.appendChild(card.element);
        });
    }

    onCardClicked(card) {
        if (this.onCardClick) {
            this.onCardClick(card);
        }
    }

    //2.- INICIO
    shuffleCards() {
        this.cards.sort(() => Math.random() - 0.5);
        this.render();
    }
    flipDownAllCards() {
        this.cards.forEach((card) => {
            card.isFlipped = false;
            card.element.querySelector(".card").classList.remove("flipped");
        });   
    }

    reset() {
        this.flippedCards = [];
        this.matchedCards = [];
        this.shuffleCards();
    }
    // FIN
}

class MemoryGame {
    constructor(board, flipDuration = 500) {
        this.board = board;
        this.flippedCards = [];
        this.matchedCards = [];
        if (flipDuration < 350 || isNaN(flipDuration) || flipDuration > 3000) {
            flipDuration = 350;
            alert(
                "La duración de la animación debe estar entre 350 y 3000 ms, se ha establecido a 350 ms"
            );
        }
        this.flipDuration = flipDuration;
        this.board.onCardClick = this.#handleCardClick.bind(this);
        this.board.reset();


        //Adicional
        this.moves = 0;
        this.timer = null;
        this.totalTimeSeconds = 0;
        this.score = 0;
        this.startTimer();
        this.resetMoves();

    }

    #handleCardClick(card) {
        if (this.flippedCards.length < 2 && !card.isFlipped) {
            card.toggleFlip();
            this.flippedCards.push(card);

            if (this.flippedCards.length === 2) {
                setTimeout(() => this.checkForMatch(), this.flipDuration);
            }
        }
        this.incrementMoves();
    }
    //3.- INICIO
    checkForMatch() {
        const [card1, card2] = this.flippedCards;

        if (card1.matches(card2)) {
            this.matchedCards.push(card1, card2);

            if (this.matchedCards.length === this.board.cards.length) {
                
                this.calculateScore();
                this.stopTimer();
                this.showCongratulationsMessage();

            }
        } else {
            card1.toggleFlip();
            card2.toggleFlip();
        }

        this.flippedCards = [];
    }


    showCongratulationsMessage() {
        Swal.fire({
            title: '¡Felicidades!',
            text: '¡Has ganado! - Puntuacion: ' + this.score,
            icon: 'success',
            confirmButtonText: 'Aceptar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.resetGame();
            }
        });
    }

    resetGame() {
        this.board.flipDownAllCards();
        this.board.reset();

        this.stopTimer();
        this.resetMoves();
        this.score = 0;
 
    }
    // FIN

    //EJEERCICIO A DICIONAL
    incrementMoves() {
        this.moves++;
        document.getElementById("moves").textContent = `Movimientos: ${this.moves}`;
    }

    resetMoves() {
        this.moves = 0;
        document.getElementById("moves").textContent = `Movimientos: ${this.moves}`;
    }

    startTimer() {
        let seconds = 0;
        let minutes = 0;
        let timerElement = document.getElementById("timer");

        this.timer = setInterval(() => {
            seconds++;
            this.totalTimeSeconds++;
            if (seconds === 60) {
                minutes++;
                seconds = 0;
            }
            timerElement.textContent = `Tiempo: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    stopTimer() {
        clearInterval(this.timer);
        this.timer = null;
        this.totalTimeSeconds = 0;

    }

    calculateScore(){

        //maximo puntaje 1_000, son 12 cartas, 12s sino falla
        const totalScore = 1024;
        this.score = totalScore - (this.moves + this.totalTimeSeconds);
        if (this.score < 0){
            this.score = 0;
        }

    }

    resetScore() {
        this.score = 0;
    }

}

document.addEventListener("DOMContentLoaded", () => {
    const cardsData = [
        { name: "Python", img: "./img/Python.svg"}, 
        { name: "JavaScript", img: "./img/JS.svg"},
        { name: "Java", img: "./img/Java.svg"},
        { name: "CSharp", img: "./img/CSharp.svg"},
        { name: "Go", img: "./img/Go.svg" },
        { name: "Ruby", img: "./img/Ruby.svg" },
    ];

    const cards = cardsData.flatMap((data) => [
        new Card(data.name, data.img),
        new Card(data.name, data.img),
    ]);
    const board = new Board(cards);
    const memoryGame = new MemoryGame(board, 1000);

    document.getElementById("restart-button").addEventListener("click", () => {
        memoryGame.resetGame();
        memoryGame.startTimer();
    });
});
