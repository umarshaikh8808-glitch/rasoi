/**
 * RASOI 3D — Recipe Data & YouTube Video API Engine
 * Integrates TheMealDB API with smart YouTube link extraction, fallback queries, and local caching
 */

class RecipeAPI {
  constructor() {
    this.baseUrl = 'https://www.themealdb.com/api/json/v1/1';
    this.cache = new Map();

    // Curated Royal Signatures to ensure breathtaking initial load with authentic local photos
    this.curatedSignatures = [
      {
        idMeal: "52805",
        strMeal: "Royal Lamb Biryani",
        strCategory: "Lamb",
        strArea: "Indian",
        strMealThumb: "assets/recipes/royal_lamb_biryani.jpg",
        strYoutube: "https://www.youtube.com/watch?v=r7SYVSG5nxo",
        strInstructions: "1. Grind cashews, poppy seeds, and cumin into a rich fragrant paste.\r\n2. Deep fry thinly sliced onions till golden crisp.\r\n3. Sauté onions, blend ginger-garlic paste, fresh green chillies, and vine-ripened tomatoes.\r\n4. Add marinated tender lamb with biryani masala, saffron milk, and fresh yogurt.\r\n5. Boil aged basmati rice to 80% with whole spices (cinnamon, cloves, cardamom).\r\n6. Layer hot lamb with basmati rice, top with saffron ghee, mint, and fried onions (birista).\r\n7. Seal with tight lid and cook on dum for 20 minutes on slow flame.",
        ingredients: [
          { name: "Basmati Rice", measure: "2 Cups" },
          { name: "Tender Lamb / Mutton", measure: "500g" },
          { name: "Saffron dissolved in warm milk", measure: "1/4 Cup" },
          { name: "Desi Ghee", measure: "3 tbsp" },
          { name: "Thinly Sliced Onions", measure: "3 large" },
          { name: "Ginger Garlic Paste", measure: "2 tbsp" },
          { name: "Full Fat Yogurt", measure: "1/2 Cup" },
          { name: "Biryani Spices (Garam Masala)", measure: "2 tsp" },
          { name: "Fresh Mint & Cilantro", measure: "1 Bunch" }
        ],
        prepTime: "50 mins",
        servings: "4 Royal Servings"
      },
      {
        idMeal: "52806",
        strMeal: "Paneer Butter Masala",
        strCategory: "Vegetarian",
        strArea: "Indian",
        strMealThumb: "assets/recipes/paneer_butter_masala.jpg",
        strYoutube: "https://www.youtube.com/watch?v=kYv9q_8X0_c",
        strInstructions: "1. Cut fresh paneer into cubes and soak in warm lightly salted water for 10 mins.\r\n2. Sauté onions, garlic, ginger, and cashews in butter until soft. Add ripe tomatoes.\r\n3. Cool mixture and blend into an ultra-smooth velvety makhani puree.\r\n4. Strain gravy back into pan, simmer with Kashmiri red chilli, garam masala, and butter.\r\n5. Add soft paneer cubes, gently stir and simmer for 5 minutes.\r\n6. Finish with fresh cream, crushed kasuri methi, and a pinch of cardamom.",
        ingredients: [
          { name: "Fresh Paneer", measure: "300g" },
          { name: "Butter (Makhan)", measure: "3 tbsp" },
          { name: "Tomatoes (Pureed)", measure: "4 large" },
          { name: "Cashews (Kaju)", measure: "12 pieces" },
          { name: "Fresh Cream (Malai)", measure: "3 tbsp" },
          { name: "Kasuri Methi (Fenugreek)", measure: "1 tbsp" },
          { name: "Kashmiri Red Chilli", measure: "1.5 tsp" },
          { name: "Garam Masala", measure: "1 tsp" }
        ],
        prepTime: "30 mins",
        servings: "3-4 Servings"
      },
      {
        idMeal: "52772",
        strMeal: "Shahi Chicken Tikka Masala",
        strCategory: "Chicken",
        strArea: "Indian",
        strMealThumb: "assets/recipes/chicken_tikka_masala.jpg",
        strYoutube: "https://www.youtube.com/watch?v=1IszT_zGf7U",
        strInstructions: "1. Marinate bite-sized chicken with hung curd, lemon juice, ginger-garlic paste, and tandoori spices for 2 hours.\r\n2. Thread chicken on skewers and grill or char on high heat until smoky.\r\n3. In a pan, melt butter with whole spices, sauté onions and tomato reduction.\r\n4. Add grilled chicken tikka into the simmering silky gravy.\r\n5. Simmer on medium-low for 8 minutes, finish with heavy cream and coriander.",
        ingredients: [
          { name: "Chicken Breast / Thighs", measure: "500g" },
          { name: "Hung Yogurt", measure: "1/2 Cup" },
          { name: "Tandoori Masala", measure: "2 tbsp" },
          { name: "Butter & Ghee", measure: "2 tbsp" },
          { name: "Tomato Puree", measure: "1 Cup" },
          { name: "Heavy Cream", measure: "1/4 Cup" }
        ],
        prepTime: "40 mins",
        servings: "4 Servings"
      },
      {
        idMeal: "52855",
        strMeal: "Dal Makhani (Slow Cooked)",
        strCategory: "Vegetarian",
        strArea: "Indian",
        strMealThumb: "assets/recipes/dal_makhani.jpg",
        strYoutube: "https://www.youtube.com/watch?v=WkGq_0k_lJk",
        strInstructions: "1. Soak whole black urad dal and kidney beans (rajma) overnight.\r\n2. Pressure cook with salt, water, and whole cardamom until velvety soft.\r\n3. Sauté ginger-garlic paste and fresh tomato puree in lots of butter.\r\n4. Add cooked dal with remaining liquid, mash gently to release starch.\r\n5. Simmer on very low heat for at least 45 minutes, adding dollops of white butter.\r\n6. Stir in fresh cream, roasted kasuri methi, and serve hot with garlic naan.",
        ingredients: [
          { name: "Whole Black Lentils (Urad)", measure: "1 Cup" },
          { name: "Rajma (Kidney Beans)", measure: "1/4 Cup" },
          { name: "Butter", measure: "4 tbsp" },
          { name: "Tomato Puree", measure: "1 Cup" },
          { name: "Fresh Cream", measure: "3 tbsp" },
          { name: "Kasuri Methi", measure: "1 tbsp" }
        ],
        prepTime: "1 Hour",
        servings: "5 Servings"
      },
      {
        idMeal: "52844",
        strMeal: "Lasagne Classico",
        strCategory: "Pasta",
        strArea: "Italian",
        strMealThumb: "assets/recipes/lasagne_classico.jpg",
        strYoutube: "https://www.youtube.com/watch?v=gfhfsBPt46s",
        strInstructions: "1. Prepare a rich slow-cooked Bolognese sauce with herbs and garlic.\r\n2. Whisk melted butter, flour, and whole milk into a creamy béchamel sauce.\r\n3. Layer lasagna pasta sheets, meat sauce, béchamel, and mozzarella cheese in baking dish.\r\n4. Repeat 4 layers, topping with generous parmesan and mozzarella.\r\n5. Bake at 190°C (375°F) for 35 minutes until bubbling golden brown.",
        ingredients: [
          { name: "Lasagna Sheets", measure: "12 sheets" },
          { name: "Mozzarella & Parmesan", measure: "2 Cups" },
          { name: "Tomato Bolognese", measure: "2 Cups" },
          { name: "Béchamel Sauce", measure: "1.5 Cups" }
        ],
        prepTime: "45 mins",
        servings: "6 Servings"
      },
      {
        idMeal: "52857",
        strMeal: "Classic Gulab Jamun",
        strCategory: "Dessert",
        strArea: "Indian",
        strMealThumb: "assets/recipes/gulab_jamun.jpg",
        strYoutube: "https://www.youtube.com/watch?v=x7nS0U3kQ-g",
        strInstructions: "1. Knead fresh mawa (khoya) and chenna with a little all-purpose flour into a soft, crack-free dough.\r\n2. Roll into smooth, small marble-sized balls without any crevices.\r\n3. Simmer sugar, water, crushed green cardamom, and saffron strands to make a warm sticky syrup.\r\n4. Fry balls in medium-low ghee until dark golden mahogany brown throughout.\r\n5. Transfer directly into warm saffron syrup and let soak for 2 hours.",
        ingredients: [
          { name: "Khoya / Mawa", measure: "250g" },
          { name: "Paneer / Chenna", measure: "100g" },
          { name: "All Purpose Flour (Maida)", measure: "3 tbsp" },
          { name: "Sugar Syrup with Saffron", measure: "2 Cups" },
          { name: "Ghee for deep frying", measure: "As needed" }
        ],
        prepTime: "40 mins",
        servings: "12-15 Pieces"
      },
      {
        idMeal: "52858",
        strMeal: "Crispy Punjabi Samosa",
        strCategory: "Side",
        strArea: "Indian",
        strMealThumb: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
        strYoutube: "https://www.youtube.com/watch?v=F3_6eQ949_E",
        strInstructions: "1. Make a firm pastry dough using maida, ajwain (carom seeds), ghee (moyen), and cold water.\r\n2. Prepare spicy potato stuffing with boiled potatoes, green peas, ginger, green chillies, roasted cumin, and amchur (dry mango powder).\r\n3. Roll oval dough portions, cut in half, shape into cones, and stuff generously.\r\n4. Seal edges with water to form classic triangular samosas.\r\n5. Deep fry in low-to-medium hot oil for 20 minutes until extra crispy and golden brown.\r\n6. Serve piping hot with spicy mint chutney and sweet saunth chutney.",
        ingredients: [
          { name: "Maida (All-purpose flour)", measure: "2 Cups" },
          { name: "Boiled Potatoes (Aloo)", measure: "4 large" },
          { name: "Green Peas (Matar)", measure: "1/2 Cup" },
          { name: "Desi Ghee", measure: "4 tbsp" },
          { name: "Ajwain (Carom seeds)", measure: "1 tsp" },
          { name: "Garam Masala & Amchur", measure: "2 tsp" },
          { name: "Oil for frying", measure: "As needed" }
        ],
        prepTime: "45 mins",
        servings: "8 Crispy Samosas"
      }
    ];
  }

  // Parse YouTube URL to extract video ID
  parseYouTubeId(url) {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }

  // Generate comprehensive YouTube details
  getYouTubeInfo(recipe) {
    const rawUrl = recipe.strYoutube || '';
    const videoId = this.parseYouTubeId(rawUrl);

    if (videoId) {
      return {
        hasVideo: true,
        directWatchUrl: `https://www.youtube.com/watch?v=${videoId}`,
        embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`,
        videoId: videoId,
        isDirect: true
      };
    }

    // Fallback: Smart YouTube Search Link for exact recipe video
    const searchQuery = encodeURIComponent(`${recipe.strMeal} recipe cooking tutorial`);
    return {
      hasVideo: true,
      directWatchUrl: `https://www.youtube.com/results?search_query=${searchQuery}`,
      embedUrl: null,
      videoId: null,
      isDirect: false
    };
  }

  // Normalize meal object from API to standard format
  normalizeMeal(meal) {
    // Extract ingredients and measures (1 to 20)
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ing = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      if (ing && ing.trim()) {
        ingredients.push({
          name: ing.trim(),
          measure: measure && measure.trim() ? measure.trim() : 'As required'
        });
      }
    }

    // Format steps into array
    const rawInstructions = meal.strInstructions || '';
    const stepList = this.cleanInstructionsIntoSteps(rawInstructions);

    // YouTube Details
    const ytInfo = this.getYouTubeInfo(meal);

    return {
      idMeal: meal.idMeal,
      strMeal: meal.strMeal,
      strCategory: meal.strCategory || 'Main Dish',
      strArea: meal.strArea || 'International',
      strMealThumb: meal.strMealThumb || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80',
      strInstructions: rawInstructions,
      steps: stepList,
      ingredients: ingredients.length ? ingredients : (meal.ingredients || []),
      strYoutube: meal.strYoutube || '',
      ytInfo: ytInfo,
      prepTime: meal.prepTime || `${Math.floor(25 + Math.random() * 25)} mins`,
      servings: meal.servings || '3-4 Servings',
      strTags: meal.strTags ? meal.strTags.split(',').map(t => t.trim()) : []
    };
  }

  cleanInstructionsIntoSteps(instructionsText) {
    if (!instructionsText) return ["Follow chef video instructions for full details."];

    // Split by newlines or numbered lines (1., 2., STEP 1, etc.)
    const rawLines = instructionsText
      .split(/\r?\n+/)
      .map(line => line.trim())
      .filter(line => line.length > 5);

    if (rawLines.length > 1) {
      return rawLines.map(line => line.replace(/^(\d+[\.\)]|step\s*\d+[:\.-]?)\s*/i, ''));
    }

    // If it's a giant single paragraph, split by periods
    const sentenceSplit = instructionsText
      .split(/(?<=[.?!])\s+(?=[A-Z0-9])/)
      .map(s => s.trim())
      .filter(s => s.length > 10);

    return sentenceSplit.length > 0 ? sentenceSplit : [instructionsText];
  }

  // Search recipes by query
  async searchRecipes(query = '') {
    const cleanQuery = query.trim().toLowerCase();

    // If query is empty, return curated signatures
    if (!cleanQuery) {
      return this.curatedSignatures.map(m => this.normalizeMeal(m));
    }

    // Check cache
    const cacheKey = `search_${cleanQuery}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await fetch(`${this.baseUrl}/search.php?s=${encodeURIComponent(cleanQuery)}`);
      if (!response.ok) throw new Error('Network error');

      const data = await response.json();

      if (data && data.meals && data.meals.length > 0) {
        const normalized = data.meals.map(meal => this.normalizeMeal(meal));
        this.cache.set(cacheKey, normalized);
        return normalized;
      }

      // Check in curated signatures for partial matches
      const localMatches = this.curatedSignatures.filter(m =>
        m.strMeal.toLowerCase().includes(cleanQuery) ||
        m.strCategory.toLowerCase().includes(cleanQuery) ||
        m.strArea.toLowerCase().includes(cleanQuery)
      );

      if (localMatches.length > 0) {
        return localMatches.map(m => this.normalizeMeal(m));
      }

      return [];
    } catch (err) {
      console.warn('TheMealDB Search fetch error, returning fallback:', err);
      // Return filtered local signatures
      return this.curatedSignatures
        .filter(m => m.strMeal.toLowerCase().includes(cleanQuery))
        .map(m => this.normalizeMeal(m));
    }
  }

  // Get recipe details by ID
  async getRecipeById(id) {
    if (!id) return null;

    // Check curated first
    const curated = this.curatedSignatures.find(m => m.idMeal === id);
    if (curated) return this.normalizeMeal(curated);

    // Cache check
    const cacheKey = `meal_${id}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await fetch(`${this.baseUrl}/lookup.php?i=${id}`);
      const data = await response.json();
      if (data && data.meals && data.meals[0]) {
        const normalized = this.normalizeMeal(data.meals[0]);
        this.cache.set(cacheKey, normalized);
        return normalized;
      }
    } catch (e) {
      console.warn('Recipe by ID fetch failed:', e);
    }

    return null;
  }

  // Filter recipes by Category (Chicken, Vegetarian, Seafood, Dessert, Pasta, etc.)
  async getByCategory(category) {
    const cat = category.trim();
    if (cat.toLowerCase() === 'all') {
      return this.curatedSignatures.map(m => this.normalizeMeal(m));
    }

    // Special Indian cuisine filter
    if (cat.toLowerCase() === 'indian') {
      return this.getByArea('Indian');
    }

    const cacheKey = `category_${cat}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await fetch(`${this.baseUrl}/filter.php?c=${encodeURIComponent(cat)}`);
      const data = await response.json();

      if (data && data.meals && data.meals.length > 0) {
        // Filter.php returns basic info; take first 10 and fetch full details or fallback
        const topMeals = data.meals.slice(0, 10);
        const detailedMeals = await Promise.all(
          topMeals.map(async (item) => {
            const detail = await this.getRecipeById(item.idMeal);
            return detail || this.normalizeMeal(item);
          })
        );

        this.cache.set(cacheKey, detailedMeals);
        return detailedMeals;
      }
    } catch (e) {
      console.warn('Category filter failed, fallback to local:', e);
    }

    // Fallback to local curated
    return this.curatedSignatures
      .filter(m => m.strCategory.toLowerCase().includes(cat.toLowerCase()))
      .map(m => this.normalizeMeal(m));
  }

  // Filter by Area (Indian, Italian, etc.)
  async getByArea(area) {
    const cacheKey = `area_${area}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await fetch(`${this.baseUrl}/filter.php?a=${encodeURIComponent(area)}`);
      const data = await response.json();

      if (data && data.meals && data.meals.length > 0) {
        const topMeals = data.meals.slice(0, 10);
        const detailedMeals = await Promise.all(
          topMeals.map(async (item) => {
            const detail = await this.getRecipeById(item.idMeal);
            return detail || this.normalizeMeal(item);
          })
        );

        this.cache.set(cacheKey, detailedMeals);
        return detailedMeals;
      }
    } catch (e) {
      console.warn('Area filter failed:', e);
    }

    return this.curatedSignatures
      .filter(m => m.strArea.toLowerCase() === area.toLowerCase())
      .map(m => this.normalizeMeal(m));
  }

  // Random Recipe generator
  async getRandomRecipe() {
    try {
      const response = await fetch(`${this.baseUrl}/random.php`);
      const data = await response.json();
      if (data && data.meals && data.meals[0]) {
        return this.normalizeMeal(data.meals[0]);
      }
    } catch (e) {}

    // Fallback random curated
    const randomItem = this.curatedSignatures[Math.floor(Math.random() * this.curatedSignatures.length)];
    return this.normalizeMeal(randomItem);
  }
}

// Global API Instance
window.RecipeAPI = new RecipeAPI();
