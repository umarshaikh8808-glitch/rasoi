/**
 * RASOI 3D — Main Application Controller
 * Manages search, rendering, 3D card tilt binding, modals, YouTube redirection,
 * cooking mode, kitchen timer, and bookmarking.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Application State
  const state = {
    currentRecipes: [],
    activeCategory: 'all',
    activeFilter: 'featured',
    searchQuery: '',
    favorites: JSON.parse(localStorage.getItem('rasoi_favorites') || '[]'),
    activeRecipe: null,
    cookingMode: {
      active: false,
      currentStep: 0,
      steps: []
    },
    timer: {
      interval: null,
      remainingSeconds: 300,
      totalSeconds: 300,
      isRunning: false
    }
  };

  // DOM Elements
  const searchInput = document.getElementById('recipe-search-input');
  const searchSubmitBtn = document.getElementById('search-submit-btn');
  const searchClearBtn = document.getElementById('search-clear-btn');
  const recipeGrid = document.getElementById('recipe-grid');
  const loadingSpinner = document.getElementById('loading-spinner');
  const emptyState = document.getElementById('empty-state');
  const emptyResetBtn = document.getElementById('empty-reset-btn');
  const resultsTitle = document.getElementById('results-title');
  const resultsCount = document.getElementById('results-count');
  const sortFilterSelect = document.getElementById('sort-filter-select');
  const categoryScrollWrapper = document.getElementById('category-scroll-wrapper');
  const favoritesCountBadge = document.getElementById('favorites-count');
  const soundToggleBtn = document.getElementById('sound-toggle-btn');
  const soundIcon = document.getElementById('sound-icon');
  const navExplore = document.getElementById('nav-explore');
  const navBookmarks = document.getElementById('nav-bookmarks');
  const navSurprise = document.getElementById('nav-surprise');

  // Modal Elements
  const modalBackdrop = document.getElementById('recipe-modal-backdrop');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalRecipeImg = document.getElementById('modal-recipe-img');
  const modalRecipeCuisine = document.getElementById('modal-recipe-cuisine');
  const modalRecipeTitle = document.getElementById('modal-recipe-title');
  const modalRecipeTags = document.getElementById('modal-recipe-tags');
  const modalCategoryText = document.getElementById('modal-category-text');
  const modalTimeEst = document.getElementById('modal-time-est');
  const modalServings = document.getElementById('modal-servings');
  const modalFavBtn = document.getElementById('modal-fav-btn');
  const modalYtRedirectBtn = document.getElementById('modal-yt-redirect-btn');
  const modalYtPreviewBtn = document.getElementById('modal-yt-preview-btn');
  const ytPlayerContainer = document.getElementById('yt-player-container');
  const modalYtIframe = document.getElementById('modal-yt-iframe');
  const modalIngredientsList = document.getElementById('modal-ingredients-list');
  const modalStepsList = document.getElementById('modal-steps-list');
  const ingredientsCountPill = document.getElementById('ingredients-count-pill');
  const copyIngredientsBtn = document.getElementById('copy-ingredients-btn');
  const shareRecipeBtn = document.getElementById('share-recipe-btn');
  const startCookingModeBtn = document.getElementById('start-cooking-mode-btn');

  // Cooking Mode Elements
  const cookingModeModal = document.getElementById('cooking-mode-modal');
  const closeCookingModeBtn = document.getElementById('close-cooking-mode-btn');
  const cookingModeDishName = document.getElementById('cooking-mode-dish-name');
  const cookingStepIndicator = document.getElementById('cooking-step-indicator');
  const cookingStepText = document.getElementById('cooking-step-text');
  const cookingProgressFill = document.getElementById('cooking-progress-fill');
  const cookingPrevBtn = document.getElementById('cooking-prev-btn');
  const cookingNextBtn = document.getElementById('cooking-next-btn');
  const cookingStepDots = document.getElementById('cooking-step-dots');

  // Kitchen Timer Elements
  const quickTimerBtn = document.getElementById('quick-timer-btn');
  const quickTimerDisplay = document.getElementById('quick-timer-display');
  const kitchenTimerDrawer = document.getElementById('kitchen-timer-drawer');
  const closeTimerDrawer = document.getElementById('close-timer-drawer');
  const timerDisplayBig = document.getElementById('timer-display-big');
  const startPauseTimerBtn = document.getElementById('start-pause-timer-btn');
  const resetTimerBtn = document.getElementById('reset-timer-btn');
  const timerPresetBtns = document.querySelectorAll('.timer-preset');

  // =========================================================================
  // Helper: Toast Notifications
  // =========================================================================
  window.showToast = function(message, icon = '✨') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3600);
  };

  // Helper: Country Flags mapping
  const areaFlags = {
    'Indian': '🇮🇳 Indian',
    'Italian': '🇮🇹 Italian',
    'American': '🇺🇸 American',
    'British': '🇬🇧 British',
    'Chinese': '🇨🇳 Chinese',
    'French': '🇫🇷 French',
    'Mexican': '🇲🇽 Mexican',
    'Japanese': '🇯🇵 Japanese',
    'Spanish': '🇪🇸 Spanish',
    'Turkish': '🇹🇷 Turkish',
    'Greek': '🇬🇷 Greek',
    'Thai': '🇹🇭 Thai',
    'Moroccan': '🇲🇦 Moroccan'
  };

  function getAreaLabel(area) {
    return areaFlags[area] || `🌍 ${area || 'International'}`;
  }

  // =========================================================================
  // Initialize UI & Bind Listeners
  // =========================================================================
  function initApp() {
    updateFavoritesBadge();
    updateSoundIcon();
    setupEventListeners();
    setupVoiceSearch();

    // Load initial signature recipes
    loadRecipes('');
  }

  // Update Sound Icon
  function updateSoundIcon() {
    const enabled = window.SoundEngine ? window.SoundEngine.isSoundEnabled() : true;
    if (soundIcon) {
      soundIcon.className = enabled ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark';
    }
  }

  // Update Favorites Badge
  function updateFavoritesBadge() {
    if (favoritesCountBadge) {
      favoritesCountBadge.textContent = state.favorites.length;
    }
  }

  // =========================================================================
  // Recipe Fetching & Rendering
  // =========================================================================
  async function loadRecipes(query = '') {
    showLoading(true);
    emptyState.style.display = 'none';
    recipeGrid.innerHTML = '';

    try {
      let meals = [];
      if (state.activeCategory === 'favorites') {
        meals = state.favorites;
        resultsTitle.innerHTML = `<span class="title-accent"></span> My Bookmarked Recipes`;
        resultsCount.textContent = `${meals.length} saved dishes`;
      } else if (query.trim()) {
        meals = await window.RecipeAPI.searchRecipes(query);
        resultsTitle.innerHTML = `<span class="title-accent"></span> Recipes for "${query}"`;
        resultsCount.textContent = `Found ${meals.length} delicious recipes`;
      } else if (state.activeCategory !== 'all') {
        meals = await window.RecipeAPI.getByCategory(state.activeCategory);
        resultsTitle.innerHTML = `<span class="title-accent"></span> ${state.activeCategory} Specialties`;
        resultsCount.textContent = `Showing ${meals.length} recipes`;
      } else {
        meals = await window.RecipeAPI.searchRecipes('');
        resultsTitle.innerHTML = `<span class="title-accent"></span> Featured Royal Dishes`;
        resultsCount.textContent = `Showing curated signature recipes`;
      }

      state.currentRecipes = meals;
      renderFilteredAndSortedRecipes();
    } catch (err) {
      console.error('Error loading recipes:', err);
      showToast('Failed to load recipes. Please try again.', '⚠️');
    } finally {
      showLoading(false);
    }
  }

  function showLoading(isLoading) {
    if (loadingSpinner) {
      loadingSpinner.style.display = isLoading ? 'block' : 'none';
    }
  }

  function renderFilteredAndSortedRecipes() {
    let list = [...state.currentRecipes];

    // Sort or filter
    if (state.activeFilter === 'az') {
      list.sort((a, b) => a.strMeal.localeCompare(b.strMeal));
    } else if (state.activeFilter === 'za') {
      list.sort((a, b) => b.strMeal.localeCompare(a.strMeal));
    } else if (state.activeFilter === 'has-video') {
      list = list.filter(m => m.ytInfo && m.ytInfo.isDirect);
    }

    if (list.length === 0) {
      recipeGrid.innerHTML = '';
      emptyState.style.display = 'block';
      return;
    }

    emptyState.style.display = 'none';
    recipeGrid.innerHTML = list.map(recipe => createRecipeCardHTML(recipe)).join('');

    // Bind 3D tilt physics & event listeners to newly created cards
    if (window.TiltEngine) {
      window.TiltEngine.bindAll('.recipe-card-3d');
    }

    attachCardEventListeners();
  }

  // Create 3D Recipe Card HTML
  function createRecipeCardHTML(recipe) {
    const isFav = state.favorites.some(f => f.idMeal === recipe.idMeal);
    const cuisine = getAreaLabel(recipe.strArea);
    const ytUrl = recipe.ytInfo ? recipe.ytInfo.directWatchUrl : `https://www.youtube.com/results?search_query=${encodeURIComponent(recipe.strMeal + " recipe")}`;

    return `
      <article class="recipe-card-3d" data-id="${recipe.idMeal}">
        <div class="card-media-wrapper">
          <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}" class="card-img" loading="lazy" onerror="this.onerror=null; this.src='assets/recipes/paneer_butter_masala.jpg';">
          <div class="card-img-gradient-overlay"></div>
          <div class="card-badge-cuisine">${cuisine}</div>
          <button class="card-fav-btn ${isFav ? 'favorited' : ''}" data-id="${recipe.idMeal}" title="${isFav ? 'Remove from favorites' : 'Save to favorites'}" aria-label="Favorite recipe">
            <i class="fa-${isFav ? 'solid' : 'regular'} fa-heart"></i>
          </button>
        </div>

        <div class="card-body">
          <div class="card-category-row">
            <span class="category-tag">${recipe.strCategory || 'Gourmet'}</span>
          </div>

          <h3 class="card-title">${recipe.strMeal}</h3>

          <div class="card-meta-row">
            <div class="card-meta-item">
              <i class="fa-regular fa-clock"></i>
              <span>${recipe.prepTime || '35 mins'}</span>
            </div>
            <div class="card-meta-item">
              <i class="fa-solid fa-users"></i>
              <span>${recipe.servings || '4 Servings'}</span>
            </div>
          </div>

          <div class="card-actions-grid">
            <button class="btn-card-details" data-id="${recipe.idMeal}">
              <i class="fa-solid fa-book-open"></i> Full Recipe
            </button>
            <a href="${ytUrl}" target="_blank" rel="noopener noreferrer" class="btn-card-youtube" data-id="${recipe.idMeal}" title="Watch video recipe on YouTube">
              <i class="fa-brands fa-youtube"></i> Watch
            </a>
          </div>
        </div>
      </article>
    `;
  }

  function attachCardEventListeners() {
    // Details Buttons
    document.querySelectorAll('.btn-card-details').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        openRecipeDetails(id);
      });
    });

    // Whole card click opens recipe
    document.querySelectorAll('.recipe-card-3d').forEach(card => {
      card.addEventListener('click', (e) => {
        // Prevent opening if clicked on YouTube link or heart
        if (e.target.closest('.btn-card-youtube') || e.target.closest('.card-fav-btn')) return;
        const id = card.getAttribute('data-id');
        openRecipeDetails(id);
      });
    });

    // Bookmark Buttons
    document.querySelectorAll('.card-fav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        toggleFavorite(id);
      });
    });

    // YouTube Click Audio Feedback
    document.querySelectorAll('.btn-card-youtube').forEach(link => {
      link.addEventListener('click', () => {
        if (window.SoundEngine) window.SoundEngine.playPop();
        window.showToast('Redirecting to YouTube Video Tutorial...', '▶️');
      });
    });
  }

  // =========================================================================
  // Bookmark / Favorites Handler
  // =========================================================================
  function toggleFavorite(id) {
    const recipe = state.currentRecipes.find(r => r.idMeal === id) ||
                   state.favorites.find(r => r.idMeal === id);
    if (!recipe) return;

    const index = state.favorites.findIndex(f => f.idMeal === id);
    const isNowFav = index === -1;

    if (isNowFav) {
      state.favorites.push(recipe);
      if (window.SoundEngine) window.SoundEngine.playChime();
      window.showToast(`"${recipe.strMeal}" saved to favorites!`, '❤️');
    } else {
      state.favorites.splice(index, 1);
      if (window.SoundEngine) window.SoundEngine.playClick();
      window.showToast(`"${recipe.strMeal}" removed from favorites.`, '💔');
    }

    localStorage.setItem('rasoi_favorites', JSON.stringify(state.favorites));
    updateFavoritesBadge();

    // Update modal heart if currently open
    if (state.activeRecipe && state.activeRecipe.idMeal === id) {
      modalFavBtn.classList.toggle('favorited', isNowFav);
      modalFavBtn.innerHTML = `<i class="fa-${isNowFav ? 'solid' : 'regular'} fa-heart"></i>`;
    }

    // Refresh current view if we are on the Favorites tab
    if (state.activeCategory === 'favorites') {
      loadRecipes('');
    } else {
      // Toggle card heart icon without full re-render
      const cardHeart = document.querySelector(`.card-fav-btn[data-id="${id}"]`);
      if (cardHeart) {
        cardHeart.classList.toggle('favorited', isNowFav);
        cardHeart.innerHTML = `<i class="fa-${isNowFav ? 'solid' : 'regular'} fa-heart"></i>`;
      }
    }
  }

  // =========================================================================
  // 3D Recipe Details Modal
  // =========================================================================
  async function openRecipeDetails(id) {
    if (window.SoundEngine) window.SoundEngine.playPop();

    let recipe = state.currentRecipes.find(r => r.idMeal === id);
    if (!recipe) {
      recipe = await window.RecipeAPI.getRecipeById(id);
    }
    if (!recipe) return;

    state.activeRecipe = recipe;

    // Populate Fields
    modalRecipeImg.onerror = function() { this.src = 'assets/recipes/paneer_butter_masala.jpg'; };
    modalRecipeImg.src = recipe.strMealThumb;
    modalRecipeImg.alt = recipe.strMeal;
    modalRecipeTitle.textContent = recipe.strMeal;
    modalRecipeCuisine.textContent = getAreaLabel(recipe.strArea);
    modalCategoryText.innerHTML = `<i class="fa-solid fa-bowl-food"></i> ${recipe.strCategory || 'Dish'}`;
    modalTimeEst.innerHTML = `<i class="fa-regular fa-clock"></i> ${recipe.prepTime || '35 mins'}`;
    modalServings.innerHTML = `<i class="fa-solid fa-user-group"></i> ${recipe.servings || '4 Servings'}`;

    // Tags
    if (recipe.strTags && recipe.strTags.length > 0) {
      modalRecipeTags.innerHTML = recipe.strTags
        .map(t => `<span class="modal-tag-chip">${t}</span>`)
        .join('');
    } else {
      modalRecipeTags.innerHTML = `<span class="modal-tag-chip">${recipe.strCategory || 'Gourmet'}</span>`;
    }

    // Favorite button state
    const isFav = state.favorites.some(f => f.idMeal === recipe.idMeal);
    modalFavBtn.classList.toggle('favorited', isFav);
    modalFavBtn.innerHTML = `<i class="fa-${isFav ? 'solid' : 'regular'} fa-heart"></i>`;

    // =====================================================================
    // 🌟 YouTube Redirection & Player Integration
    // =====================================================================
    const ytInfo = recipe.ytInfo || window.RecipeAPI.getYouTubeInfo(recipe);
    modalYtRedirectBtn.href = ytInfo.directWatchUrl;

    // Reset inline player
    ytPlayerContainer.style.display = 'none';
    modalYtIframe.src = '';
    modalYtPreviewBtn.innerHTML = `<i class="fa-solid fa-play"></i> <span>Watch Here (Inline)</span>`;

    if (ytInfo.embedUrl) {
      modalYtPreviewBtn.style.display = 'inline-flex';
    } else {
      modalYtPreviewBtn.style.display = 'none';
    }

    // Ingredients Checklist
    ingredientsCountPill.textContent = `${recipe.ingredients.length} items`;
    modalIngredientsList.innerHTML = recipe.ingredients.map((ing, idx) => `
      <div class="ingredient-item" data-idx="${idx}">
        <div class="ing-check-box"><i class="fa-solid fa-check"></i></div>
        <span class="ing-measure">${ing.measure}</span>
        <span class="ing-name">${ing.name}</span>
      </div>
    `).join('');

    // Attach checkbox toggle
    modalIngredientsList.querySelectorAll('.ingredient-item').forEach(item => {
      item.addEventListener('click', () => {
        item.classList.toggle('checked');
        if (window.SoundEngine) window.SoundEngine.playClick();
      });
    });

    // Step-by-Step Instructions
    modalStepsList.innerHTML = recipe.steps.map((step, idx) => `
      <div class="instruction-step-card">
        <div class="step-num-bubble">${idx + 1}</div>
        <p class="step-text">${step}</p>
      </div>
    `).join('');

    // Open Modal
    modalBackdrop.classList.add('open');
    modalBackdrop.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeRecipeDetails() {
    if (window.SoundEngine) window.SoundEngine.playClick();
    modalBackdrop.classList.remove('open');
    modalBackdrop.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    modalYtIframe.src = ''; // Stop video playback
    state.activeRecipe = null;
  }

  // =========================================================================
  // Chef Interactive Cooking Mode
  // =========================================================================
  function startCookingMode() {
    if (!state.activeRecipe) return;

    if (window.SoundEngine) window.SoundEngine.playPop();
    const recipe = state.activeRecipe;
    state.cookingMode.active = true;
    state.cookingMode.steps = recipe.steps;
    state.cookingMode.currentStep = 0;

    cookingModeDishName.textContent = recipe.strMeal;

    // Render step dots
    cookingStepDots.innerHTML = recipe.steps.map((_, i) => `
      <div class="step-dot ${i === 0 ? 'active' : ''}"></div>
    `).join('');

    updateCookingStepDisplay();

    cookingModeModal.classList.add('open');
    cookingModeModal.setAttribute('aria-hidden', 'false');
  }

  function updateCookingStepDisplay() {
    const { currentStep, steps } = state.cookingMode;
    cookingStepIndicator.textContent = `Step ${currentStep + 1} of ${steps.length}`;
    cookingStepText.textContent = steps[currentStep];

    const progressPct = ((currentStep + 1) / steps.length) * 100;
    cookingProgressFill.style.width = `${progressPct}%`;

    cookingPrevBtn.disabled = currentStep === 0;
    cookingNextBtn.innerHTML = currentStep === steps.length - 1
      ? `Finish Cooking <i class="fa-solid fa-check"></i>`
      : `Next Step <i class="fa-solid fa-chevron-right"></i>`;

    // Update dots
    const dots = cookingStepDots.querySelectorAll('.step-dot');
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentStep);
    });
  }

  function nextCookingStep() {
    const { currentStep, steps } = state.cookingMode;
    if (currentStep < steps.length - 1) {
      state.cookingMode.currentStep++;
      if (window.SoundEngine) window.SoundEngine.playClick();
      updateCookingStepDisplay();
    } else {
      // Completed!
      if (window.SoundEngine) window.SoundEngine.playChime();
      window.showToast('🎉 Shandaar! Recipe poori hui! Enjoy your meal!', '👨‍🍳');
      closeCookingMode();
    }
  }

  function prevCookingStep() {
    if (state.cookingMode.currentStep > 0) {
      state.cookingMode.currentStep--;
      if (window.SoundEngine) window.SoundEngine.playClick();
      updateCookingStepDisplay();
    }
  }

  function closeCookingMode() {
    state.cookingMode.active = false;
    cookingModeModal.classList.remove('open');
    cookingModeModal.setAttribute('aria-hidden', 'true');
  }

  // =========================================================================
  // Kitchen Timer Engine
  // =========================================================================
  function toggleKitchenTimerDrawer() {
    if (window.SoundEngine) window.SoundEngine.playPop();
    kitchenTimerDrawer.classList.toggle('open');
  }

  function setTimerDuration(seconds) {
    pauseTimer();
    state.timer.remainingSeconds = seconds;
    state.timer.totalSeconds = seconds;
    updateTimerDisplay();
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  function updateTimerDisplay() {
    const formatted = formatTime(state.timer.remainingSeconds);
    timerDisplayBig.textContent = formatted;
    quickTimerDisplay.textContent = state.timer.isRunning ? formatted : 'Timer';
  }

  function startTimer() {
    if (state.timer.isRunning) return;
    state.timer.isRunning = true;
    startPauseTimerBtn.innerHTML = `<i class="fa-solid fa-pause"></i> Pause`;

    state.timer.interval = setInterval(() => {
      if (state.timer.remainingSeconds > 0) {
        state.timer.remainingSeconds--;
        updateTimerDisplay();
      } else {
        // Finished!
        pauseTimer();
        if (window.SoundEngine) window.SoundEngine.playTimerBell();
        window.showToast('⏰ Kitchen Timer Finished! Khana check karein!', '🔔');
      }
    }, 1000);
  }

  function pauseTimer() {
    state.timer.isRunning = false;
    clearInterval(state.timer.interval);
    startPauseTimerBtn.innerHTML = `<i class="fa-solid fa-play"></i> Start`;
    quickTimerDisplay.textContent = 'Timer';
  }

  function resetTimer() {
    pauseTimer();
    state.timer.remainingSeconds = state.timer.totalSeconds;
    updateTimerDisplay();
    if (window.SoundEngine) window.SoundEngine.playClick();
  }

  // =========================================================================
  // Event Listeners Setup
  // =========================================================================
  function setupEventListeners() {
    // Search Submit
    searchSubmitBtn.addEventListener('click', () => {
      const q = searchInput.value.trim();
      state.searchQuery = q;
      loadRecipes(q);
      if (window.SoundEngine) window.SoundEngine.playClick();
    });

    // Enter Key on Search
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const q = searchInput.value.trim();
        state.searchQuery = q;
        loadRecipes(q);
        if (window.SoundEngine) window.SoundEngine.playClick();
      }
    });

    // Search Input Live Clear
    searchInput.addEventListener('input', () => {
      searchClearBtn.style.display = searchInput.value ? 'flex' : 'none';
    });

    searchClearBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchClearBtn.style.display = 'none';
      state.searchQuery = '';
      loadRecipes('');
      if (window.SoundEngine) window.SoundEngine.playClick();
    });

    // Popular Query Chips
    document.querySelectorAll('.query-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const query = chip.getAttribute('data-query');
        searchInput.value = query;
        searchClearBtn.style.display = 'flex';
        state.searchQuery = query;
        loadRecipes(query);
        if (window.SoundEngine) window.SoundEngine.playClick();
      });
    });

    // Category Buttons
    document.querySelectorAll('.category-card-3d').forEach(catBtn => {
      catBtn.addEventListener('click', () => {
        document.querySelectorAll('.category-card-3d').forEach(b => b.classList.remove('active'));
        catBtn.classList.add('active');

        const cat = catBtn.getAttribute('data-category');
        state.activeCategory = cat;
        searchInput.value = '';
        searchClearBtn.style.display = 'none';

        loadRecipes('');
        if (window.SoundEngine) window.SoundEngine.playClick();
      });
    });

    // Navigation Menu
    navExplore.addEventListener('click', () => {
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      navExplore.classList.add('active');
      state.activeCategory = 'all';
      loadRecipes('');
      if (window.SoundEngine) window.SoundEngine.playClick();
    });

    navBookmarks.addEventListener('click', () => {
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      navBookmarks.classList.add('active');
      state.activeCategory = 'favorites';
      loadRecipes('');
      if (window.SoundEngine) window.SoundEngine.playClick();
    });

    // Surprise Me Random Recipe
    navSurprise.addEventListener('click', async () => {
      if (window.SoundEngine) window.SoundEngine.playPop();
      window.showToast('Rolling the 3D Spice Dice... 🎲', '✨');
      const randomRecipe = await window.RecipeAPI.getRandomRecipe();
      if (randomRecipe) {
        openRecipeDetails(randomRecipe.idMeal);
      }
    });

    // Sound Toggle
    soundToggleBtn.addEventListener('click', () => {
      if (window.SoundEngine) {
        const enabled = window.SoundEngine.toggleSound();
        updateSoundIcon();
        window.showToast(enabled ? 'Sound Effects Enabled 🔊' : 'Sound Effects Muted 🔇');
      }
    });

    // Sort / Filter Change
    sortFilterSelect.addEventListener('change', (e) => {
      state.activeFilter = e.target.value;
      renderFilteredAndSortedRecipes();
      if (window.SoundEngine) window.SoundEngine.playClick();
    });

    // Modal Close
    modalCloseBtn.addEventListener('click', closeRecipeDetails);
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) closeRecipeDetails();
    });

    // Modal Favorite toggle
    modalFavBtn.addEventListener('click', () => {
      if (state.activeRecipe) {
        toggleFavorite(state.activeRecipe.idMeal);
      }
    });

    // Modal YouTube Redirect Audio Trigger
    modalYtRedirectBtn.addEventListener('click', () => {
      if (window.SoundEngine) window.SoundEngine.playPop();
      window.showToast('Redirecting directly to YouTube Video Tutorial...', '▶️');
    });

    // Inline Video Preview Toggle
    modalYtPreviewBtn.addEventListener('click', () => {
      if (!state.activeRecipe) return;
      const ytInfo = state.activeRecipe.ytInfo;
      if (!ytInfo || !ytInfo.embedUrl) return;

      const isHidden = ytPlayerContainer.style.display === 'none';
      if (isHidden) {
        ytPlayerContainer.style.display = 'block';
        modalYtIframe.src = ytInfo.embedUrl;
        modalYtPreviewBtn.innerHTML = `<i class="fa-solid fa-stop"></i> <span>Close Preview</span>`;
      } else {
        ytPlayerContainer.style.display = 'none';
        modalYtIframe.src = '';
        modalYtPreviewBtn.innerHTML = `<i class="fa-solid fa-play"></i> <span>Watch Here (Inline)</span>`;
      }
      if (window.SoundEngine) window.SoundEngine.playClick();
    });

    // Copy Ingredients
    copyIngredientsBtn.addEventListener('click', () => {
      if (!state.activeRecipe) return;
      const ingList = state.activeRecipe.ingredients
        .map(i => `• ${i.name} - ${i.measure}`)
        .join('\n');
      const textToCopy = `🛒 Ingredients for ${state.activeRecipe.strMeal}:\n\n${ingList}\n\nRecipe via Rasoi 3D`;

      navigator.clipboard.writeText(textToCopy).then(() => {
        if (window.SoundEngine) window.SoundEngine.playChime();
        window.showToast('Ingredients copied to clipboard! 📋');
      });
    });

    // Share Recipe
    shareRecipeBtn.addEventListener('click', () => {
      if (!state.activeRecipe) return;
      const shareData = {
        title: state.activeRecipe.strMeal,
        text: `Check out this delicious recipe for ${state.activeRecipe.strMeal} on Rasoi 3D!`,
        url: window.location.href
      };

      if (navigator.share) {
        navigator.share(shareData).catch(() => {});
      } else {
        navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`).then(() => {
          if (window.SoundEngine) window.SoundEngine.playChime();
          window.showToast('Recipe link copied to clipboard! 🔗');
        });
      }
    });

    // Cooking Mode Triggers
    startCookingModeBtn.addEventListener('click', startCookingMode);
    closeCookingModeBtn.addEventListener('click', closeCookingMode);
    cookingNextBtn.addEventListener('click', nextCookingStep);
    cookingPrevBtn.addEventListener('click', prevCookingStep);

    // Kitchen Timer Triggers
    quickTimerBtn.addEventListener('click', toggleKitchenTimerDrawer);
    closeTimerDrawer.addEventListener('click', toggleKitchenTimerDrawer);
    startPauseTimerBtn.addEventListener('click', () => {
      if (state.timer.isRunning) pauseTimer();
      else startTimer();
      if (window.SoundEngine) window.SoundEngine.playClick();
    });
    resetTimerBtn.addEventListener('click', resetTimer);

    timerPresetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        timerPresetBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const secs = parseInt(btn.getAttribute('data-seconds'), 10);
        setTimerDuration(secs);
        if (window.SoundEngine) window.SoundEngine.playClick();
      });
    });

    const stepTimerShortcut = document.getElementById('step-timer-shortcut');
    if (stepTimerShortcut) {
      stepTimerShortcut.addEventListener('click', () => {
        kitchenTimerDrawer.classList.add('open');
        if (window.SoundEngine) window.SoundEngine.playPop();
      });
    }

    // Reset Empty State
    emptyResetBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchClearBtn.style.display = 'none';
      state.activeCategory = 'all';
      document.querySelectorAll('.category-card-3d').forEach(b => b.classList.remove('active'));
      const catAll = document.getElementById('cat-all');
      if (catAll) catAll.classList.add('active');
      loadRecipes('');
    });

    // Global Keyboards
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (state.cookingMode.active) closeCookingMode();
        else if (modalBackdrop.classList.contains('open')) closeRecipeDetails();
      }

      if (state.cookingMode.active) {
        if (e.key === 'ArrowRight') nextCookingStep();
        if (e.key === 'ArrowLeft') prevCookingStep();
      }
    });
  }

  // Voice Search Setup
  function setupVoiceSearch() {
    if (window.VoiceSearchEngine) {
      new window.VoiceSearchEngine({
        onResult: (transcript) => {
          state.searchQuery = transcript;
          searchClearBtn.style.display = 'flex';
          loadRecipes(transcript);
        }
      });
    }
  }

  // Launch app
  initApp();
});
