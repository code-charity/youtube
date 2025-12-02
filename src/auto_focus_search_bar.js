document.addEventListener('DOMContentLoaded', function() {
  const searchIcon = document.getElementById('search-icon');
  const searchBar = document.getElementById('search-bar');

  if (searchIcon && searchBar) {
    searchIcon.addEventListener('click', function() {
      searchBar.focus();
    });
  }
});