let ingredients = [];
let offset = 0;
const limit = 10;

// Function to add ingredients
function addIngredient() {
    const ingredientInput = document.getElementById('ingredientInput');
    const ingredient = ingredientInput.value.trim();

    if (ingredient) {
        ingredients.push(ingredient);
        updateIngredientList();
        ingredientInput.value = ''; // Clear input field
    }
}

// Function to select ingredient for removal
let selectedIngredients = []; // Array to hold multiple selected ingredients

function selectIngredient(ingredient) {
    if (selectedIngredients.includes(ingredient)) {
        selectedIngredients = selectedIngredients.filter(ing => ing !== ingredient);
    } else {
        selectedIngredients.push(ingredient);
    }
    highlightSelectedIngredients();
}

function highlightSelectedIngredients() {
    const ingredientList = document.getElementById('ingredientList');
    const listItems = ingredientList.getElementsByTagName('li');

    for (let li of listItems) {
        if (selectedIngredients.includes(li.textContent)) {
            li.style.backgroundColor = '#ffc107'; // Highlight selected ingredients
        } else {
            li.style.backgroundColor = '#007BFF';
        }
    }
}

function removeSelectedIngredients() {
    if (selectedIngredients.length > 0) {
        ingredients = ingredients.filter(ing => !selectedIngredients.includes(ing));
        selectedIngredients = [];
        updateIngredientList();
    } else {
        alert('Please select one or more ingredients to remove');
    }
}

// Update ingredient list display
function updateIngredientList() {
    const ingredientList = document.getElementById('ingredientList');
    ingredientList.innerHTML = '';

    ingredients.forEach(ingredient => {
        const li = document.createElement('li');
        li.textContent = ingredient;

        // Add click event to select ingredient
        li.addEventListener('click', () => selectIngredient(ingredient));

        ingredientList.appendChild(li);
    });

    highlightSelectedIngredients();
}

// Function to suggest recipes based on ingredients
function suggestRecipes() {
    if (ingredients.length === 0) {
        alert('Please add some ingredients first!');
        return;
    }

    offset = 0; // Reset offset when suggesting new recipes
    fetchRecipes();
}

// Function to fetch recipes from the backend
function fetchRecipes() {
    fetch('/recipes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            ingredients: ingredients,
            limit: limit,
            offset: offset
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            displayRecipes(data); // Display the recipes
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Function to display the fetched recipes
function displayRecipes(recipes) {
    const recipeSection = document.getElementById('recipe-section');
    recipeSection.innerHTML = ''; // Clear the previous results to replace with new ones

    if (recipes.length === 0) {
        recipeSection.textContent = 'No recipes found.';
        return;
    }

    // Create a two-column layout using divs
    const leftColumn = document.createElement('div');
    leftColumn.classList.add('column');

    const rightColumn = document.createElement('div');
    rightColumn.classList.add('column');

    recipes.forEach((recipe, index) => {
        const recipeDiv = document.createElement('div');
        recipeDiv.classList.add('recipe');

        // Recipe title (click to expand/collapse)
        const recipeTitle = document.createElement('h2');
        recipeTitle.textContent = recipe.name;
        recipeTitle.style.cursor = 'pointer';

        // Container for the details (hidden initially)
        const recipeDetails = document.createElement('div');
        recipeDetails.classList.add('recipe-details');

        const recipeIngredients = document.createElement('p');
        recipeIngredients.textContent = `Ingredients: ${recipe.ingredients}`;

        const recipeInstructions = document.createElement('p');
        recipeInstructions.textContent = `Instructions: ${recipe.instructions}`;

        recipeDetails.appendChild(recipeIngredients);
        recipeDetails.appendChild(recipeInstructions);

        // Initially hidden using display: none
        recipeDetails.style.display = 'none';

        // Toggle details visibility with smooth height transition
        recipeTitle.addEventListener('click', () => {
            if (recipeDetails.style.display === 'none') {
                recipeDetails.style.display = 'block';
                recipeDetails.style.maxHeight = '300px'; // Limit height for scrollable area within recipe
                recipeDetails.style.overflowY = 'auto'; // Enable vertical scrolling within recipe
            } else {
                recipeDetails.style.display = 'none';
            }
        });

        recipeDiv.appendChild(recipeTitle);
        recipeDiv.appendChild(recipeDetails);

        // Add to left column if index < 5, otherwise add to right column
        if (index < 5) {
            leftColumn.appendChild(recipeDiv);
        } else {
            rightColumn.appendChild(recipeDiv);
        }
    });

    // Add columns to the recipe section
    recipeSection.appendChild(leftColumn);
    recipeSection.appendChild(rightColumn);

    offset += limit;
}
// Function to load new recipes (replacing current ones)
function loadMoreRecipes() {
    fetchRecipes();
}

// Add event listeners
document.getElementById('addButton').addEventListener('click', addIngredient);
document.getElementById('removeButton').addEventListener('click', removeSelectedIngredients);
document.getElementById('suggestButton').addEventListener('click', suggestRecipes);
document.getElementById('loadMoreButton').addEventListener('click', loadMoreRecipes);