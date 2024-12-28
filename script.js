const url = "https://api.github.com/search/users";
const searchInputEl = document.getElementById("searchInput");
const searchButtonEl = document.getElementById("searchBtn");
const profileContainerEl = document.getElementById("profileContainer");
const loadingEl = document.getElementById("loading");
const themeToggleBtn = document.getElementById("toggleTheme");
const favoritesContainerEl = document.getElementById("favoritesContainer");

// Generate profile cards
const generateProfiles = (profiles) => {
  return profiles
    .map(
      (profile) => `
    <div class="profile-box">
      <div class="avatar">
        <img src="${profile.avatar_url}" alt="${profile.login}" />
      </div>
      <div class="profile-info">
        <h3>@${profile.login}</h3>
        <p>${profile.bio || "No bio available"}</p>
        <a href="${profile.html_url}" target="_blank">View Profile</a>
        <button class="favorite-btn" onclick="addToFavorites('${profile.login}', '${profile.avatar_url}', '${profile.html_url}')">⭐ Add to Favorites</button>
      </div>
      <div class="profile-stats">
        <div><strong>Followers:</strong> ${profile.followers || 0}</div>
        <div><strong>Following:</strong> ${profile.following || 0}</div>
        <div><strong>Repositories:</strong> ${profile.public_repos || 0}</div>
      </div>
    </div>`
    )
    .join("");
};

// Fetch profiles
const fetchProfiles = async () => {
  const query = searchInputEl.value.trim();

  if (!query) {
    loadingEl.innerText = "Please enter a username.";
    return;
  }

  loadingEl.innerHTML = "<div class='spinner'></div>";
  profileContainerEl.innerHTML = "";

  try {
    const res = await fetch(`${url}?q=${query}&per_page=5`);
    const data = await res.json();

    if (data.items && data.items.length > 0) {
      const detailedProfiles = await Promise.all(
        data.items.map(async (item) => {
          const userRes = await fetch(item.url);
          return await userRes.json();
        })
      );
      loadingEl.innerText = "";
      profileContainerEl.innerHTML = generateProfiles(detailedProfiles);
    } else {
      loadingEl.innerText = "No profiles found.";
    }
  } catch (error) {
    loadingEl.innerText = "Failed to fetch profiles. Please try again.";
  }
};

// Add to Favorites
const addToFavorites = (username, avatar_url, html_url) => {
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  const alreadyFavorited = favorites.find((item) => item.username === username);

  if (alreadyFavorited) {
    alert("This profile is already in your favorites.");
    return;
  }

  favorites.push({ username, avatar_url, html_url });
  localStorage.setItem("favorites", JSON.stringify(favorites));
  alert("Profile added to favorites!");
  renderFavorites();
};

// Render Favorites
const renderFavorites = () => {
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  if (favorites.length === 0) {
    favoritesContainerEl.innerHTML = "<p>No favorites yet.</p>";
    return;
  }

  favoritesContainerEl.innerHTML = favorites
    .map(
      (fav) => `
    <div class="favorite-box">
      <div class="avatar">
        <img src="${fav.avatar_url}" alt="${fav.username}" />
      </div>
      <div class="profile-info">
        <h3>@${fav.username}</h3>
        <a href="${fav.html_url}" target="_blank">View Profile</a>
        <button class="remove-btn" onclick="removeFavorite('${fav.username}')">❌ Remove</button>
      </div>
    </div>`
    )
    .join("");
};

// Remove from Favorites
const removeFavorite = (username) => {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  favorites = favorites.filter((item) => item.username !== username);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  renderFavorites();
};

// Theme Toggle
themeToggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  themeToggleBtn.innerText = document.body.classList.contains("dark-mode")
    ? "☀️ Light Mode"
    : "🌙 Dark Mode";
});

// Event Listeners
searchButtonEl.addEventListener("click", fetchProfiles);
searchInputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") fetchProfiles();
});

document.addEventListener("DOMContentLoaded", renderFavorites);