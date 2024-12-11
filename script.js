const searchButton = document.getElementById("search-button");
const searchInput = document.getElementById("search-input");
const pokemonDetails = document.getElementById("pokemon-details");

searchButton.addEventListener("click", () => {
  const query = searchInput.value.trim().toLowerCase();
  if (query) {
    fetchPokemonData(query);
  }
});

searchInput.addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    const query = searchInput.value.trim().toLowerCase();
    if (query) {
      fetchPokemonData(query);
    }
  }
});

async function fetchPokemonData(name) {
  try {
    // Clear previous details
    pokemonDetails.innerHTML = "Loading...";

    // Fetch Pokémon basic data
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
    if (!response.ok) {
      throw new Error("Pokémon not found");
    }
    const data = await response.json();

    // Extract necessary information
    const pokemon = {
      id: data.id,
      name: data.name,
      image: data.sprites.other["official-artwork"].front_default,
      base_experience: data.base_experience,
      height: data.height,
      types: data.types.map((type) => type.type.name),
      stats: data.stats.map((stat) => ({
        name: stat.stat.name,
        value: stat.base_stat,
      })),
      speciesUrl: data.species.url,
    };

    // Fetch species data for evolutions and locations
    const speciesResponse = await fetch(pokemon.speciesUrl);
    const speciesData = await speciesResponse.json();

    // Fetch evolution chain
    const evolutionChainUrl = speciesData.evolution_chain.url;
    const evolutionResponse = await fetch(evolutionChainUrl);
    const evolutionData = await evolutionResponse.json();
    const evolutions = await parseEvolutionChain(evolutionData.chain);

    // Display all data
    displayPokemon(pokemon, evolutions);
  } catch (error) {
    pokemonDetails.innerHTML = `<p class="error">${error.message}</p>`;
  }
}

// Existing parseEvolutionChain function
async function parseEvolutionChain(chain) {
    const evolutions = [];
  
    let current = chain;
    while (current) {
      const speciesName = current.species.name;
      // Fetch Pokémon data to get the image
      const pokemonData = await fetchPokemonDataByName(speciesName);
      const imageUrl = pokemonData.image;
      
      evolutions.push({
        name: speciesName,
        image: imageUrl
      });
  
      if (current.evolves_to.length > 0) {
        current = current.evolves_to[0];
      } else {
        current = null;
      }
    }
  
    return evolutions;
  }
  
  // Helper function to fetch Pokémon data by name
  async function fetchPokemonDataByName(name) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch data for ${name}`);
    }
    const data = await response.json();
    return {
      name: data.name,
      image: data.sprites.other['official-artwork'].front_default || data.sprites.front_default
    };
  }
  

function displayPokemon(pokemon, evolutions) {
  pokemonDetails.innerHTML = "";
  const card = document.createElement("div");
  card.classList.add("pokemon-card");
  const id = document.createElement("div");
  id.classList.add("pokemon-id");
  id.textContent = `#${pokemon.id}`;
  card.appendChild(id);

  const imageContainer = document.createElement("div");
  imageContainer.classList.add("pokemon-image-container");
  const img = document.createElement("img");
  img.src = pokemon.image;
  img.alt = pokemon.name;
  imageContainer.appendChild(img);
  card.appendChild(imageContainer);

  const info = document.createElement("div");
  info.classList.add("pokemon-info");

  const name = document.createElement("h2");
  name.textContent = pokemon.name;
  info.appendChild(name);

  const baseExp = document.createElement("p");
  baseExp.innerHTML = `<strong>Base Experience:</strong> ${pokemon.base_experience}`;
  info.appendChild(baseExp);

  const height = document.createElement("p");
  height.innerHTML = `<strong>Height:</strong> ${pokemon.height}`;
  info.appendChild(height);

  const typesDiv = document.createElement('div');
typesDiv.classList.add('types');
const typesTitle = document.createElement('p');
typesTitle.innerHTML = `<strong>Types:</strong>`;
typesDiv.appendChild(typesTitle);
pokemon.types.forEach(type => {
    const typeSpan = document.createElement('span');
    typeSpan.textContent = type;
    console.log(type);
    // Assign the corresponding type class
    typeSpan.classList.add(`type-${type.toLowerCase()}`);
    console.log(`type-${type.toLowerCase()}`)
    typesDiv.appendChild(typeSpan);
  });
  info.appendChild(typesDiv);


  const evolutionsDiv = document.createElement("div");
  evolutionsDiv.classList.add("evolutions");
  const evolutionsTitle = document.createElement("p");
  evolutionsTitle.innerHTML = `<strong>Evolutions:</strong>`;
  evolutionsDiv.appendChild(evolutionsTitle);
  const evolutionContainer = document.createElement('div');
  evolutionContainer.classList.add('evolution-container');
  evolutions.forEach((evo, index) => {
    // Evolution Image
    const evoImg = document.createElement('img');
    evoImg.src = evo.image;
    evoImg.alt = evo.name;
    evoImg.classList.add('evolution-image');
    evolutionContainer.appendChild(evoImg);

    // Evolution Name
    const evoName = document.createElement('span');
    evoName.textContent = evo.name;
    evoName.classList.add('evolution-name');
    evolutionContainer.appendChild(evoName);

    // Add arrow if not the last evolution
    if (index < evolutions.length - 1) {
      const arrow = document.createElement('span');
      arrow.textContent = '→'; // Simple arrow; you can replace with an icon if desired
      arrow.classList.add('evolution-arrow');
      evolutionContainer.appendChild(arrow);
    }
  });
  evolutionsDiv.appendChild(evolutionContainer);
  info.appendChild(evolutionsDiv);

  card.appendChild(info);
  const stats = document.createElement("div");
  stats.classList.add("pokemon-stats");

  const statsTitle = document.createElement("h3");
  statsTitle.textContent = "Stats";
  stats.appendChild(statsTitle);

  const statsTable = document.createElement("table");

  // Table Header
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  const statNameHeader = document.createElement("th");
  statNameHeader.textContent = "Stat";
  const statValueHeader = document.createElement("th");
  statValueHeader.textContent = "Value";
  headerRow.appendChild(statNameHeader);
  headerRow.appendChild(statValueHeader);
  thead.appendChild(headerRow);
  statsTable.appendChild(thead);

  // Table Body
  const tbody = document.createElement("tbody");
  pokemon.stats.forEach((stat) => {
    const row = document.createElement("tr");
    const statName = document.createElement("td");
    statName.textContent = capitalizeFirstLetter(stat.name);
    const statValue = document.createElement("td");
    statValue.textContent = stat.value;
    row.appendChild(statName);
    row.appendChild(statValue);
    tbody.appendChild(row);
  });
  statsTable.appendChild(tbody);

  stats.appendChild(statsTable);
  card.appendChild(stats);

  // Append card to the DOM
  pokemonDetails.appendChild(card);
}

function capitalizeFirstLetter(val) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}
