// Bottone "Torna su" in basso a destra
document.addEventListener('DOMContentLoaded', () => {
    const scrollBtn = document.createElement('button');
    scrollBtn.textContent = '↑';
    scrollBtn.className = 'scroll-top-btn';
    scrollBtn.title = 'Torna su';
    document.body.appendChild(scrollBtn);

    const footer = document.getElementById('footer');
    function updateScrollBtnPosition() {
        const footerRect = footer.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        if (window.scrollY > 300) {
            scrollBtn.style.display = 'block';
        } else {
            scrollBtn.style.display = 'none';
        }
        //Animazione per fermare il bottone appena arriva al footer
        let targetBottom = 40;
        if (footerRect.top < windowHeight) {
            const overlap = windowHeight - footerRect.top;
            targetBottom = overlap + 40;
        }
        scrollBtn.style.transition = 'bottom 0.3s cubic-bezier(.4,0,.2,1)';
        scrollBtn.style.bottom = targetBottom + 'px';
    }
    window.addEventListener('scroll', updateScrollBtnPosition);
    window.addEventListener('resize', updateScrollBtnPosition);
    scrollBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    updateScrollBtnPosition();
});


// Gestione dinamica delle recensioni con filtro stelle e caricamento progressivo
document.addEventListener('DOMContentLoaded', () => {
    // Recupera tutte le recensioni dal backend (puoi modificarlo per paginazione)
    let allReviews = window.reviews || [];
    let shownReviews = 6;
    const reviewsContainer = document.getElementById('reviewsContainer');
    const filterStars = document.getElementById('filterStars');
    const loadMoreBtn = document.getElementById('loadMoreBtn');

    function renderReviews() {
        reviewsContainer.innerHTML = '';
        let filtered = allReviews;
        const selected = filterStars.value;
        if (selected !== 'all') {
            filtered = filtered.filter(r => String(r.valutazione) === selected);
        }
        filtered.slice(0, shownReviews).forEach(review => {
            const card = document.createElement('div');
            card.className = 'card mb-3 review-card';
            card.setAttribute('data-rating', review.valutazione);
            card.innerHTML = `
                <div class="card-body">
                    <h5 class="card-title overflow-hidden">${review.titolo}</h5>
                    <p class="card-text">${review.contenuto}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            ${[1,2,3,4,5].map(i => `<i class="bi ${i <= review.valutazione ? 'bi-star-fill' : 'bi-star'} text-warning"></i>`).join('')}
                        </div>
                        <small class="text-muted">${new Date(review.data_recensione).toLocaleDateString('it-IT')}</small>
                    </div>
                </div>
            `;
            reviewsContainer.appendChild(card);
        });
        // Mostra/nasconde il bottone "Carica altre recensioni"
        loadMoreBtn.style.display = filtered.length > shownReviews ? 'inline-block' : 'none';
    }

    filterStars.addEventListener('change', () => {
        shownReviews = 6;
        renderReviews();
    });

    loadMoreBtn.addEventListener('click', () => {
        shownReviews += 6;
        renderReviews();
    });

    renderReviews();
});
class ReviewsManager {
    constructor() {
        this.reviewsPerPage = 6;
        this.currentVisible = this.reviewsPerPage;
        this.reviews = document.querySelectorAll('.review-card');
        this.loadMoreBtn = document.getElementById('loadMoreBtn');
        this.init();
    }

    init() {
        // Nascondi tutte le recensioni tranne le prime 6
        this.reviews.forEach((review, idx) => {
            if (idx >= this.reviewsPerPage) {
                review.classList.add('d-none');
            }
        });

        if (this.loadMoreBtn) {
            this.loadMoreBtn.addEventListener('click', () => this.loadMoreReviews());
        }
        
    }

    loadMoreReviews() {
        let mostrati = 0;
        for (let i = this.currentVisible; i < this.reviews.length && mostrati < this.reviewsPerPage; i++) {
            this.reviews[i].classList.remove('d-none');
            mostrati++;
        }
        this.currentVisible += mostrati;
        // Il bottone resta sempre visibile
    }
}

document.addEventListener('DOMContentLoaded', () => new ReviewsManager());