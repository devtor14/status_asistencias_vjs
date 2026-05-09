const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');

function handleThemeChange(event) {
  if (document.cookie) {
    document.documentElement.className = document.cookie;
    return;
  }

  if (event.matches) {
    document.documentElement.className = 'dark';
  } else {
    document.documentElement.className = 'light';
  }
}

colorSchemeQuery.addEventListener('change', handleThemeChange);

handleThemeChange(colorSchemeQuery);
