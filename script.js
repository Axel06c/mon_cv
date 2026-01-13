
const html = document.documentElement;

// Appliquer le thème par défaut selon le système
html.style.setProperty('color-scheme', 'light');
//if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
//    html.style.setProperty('color-scheme', 'dark');
//} else {
//    html.style.setProperty('color-scheme', 'light');
//}
// Ajouter l'événement au bouton d'impression
document.getElementById('download-pdf-btn').addEventListener('click', () => {
  window.print();
});


//////////// Icone theme toggle ////////////
const themeIcon = document.getElementById('theme-icon');
// Fonction pour mettre à jour l'icône selon le thème
function updateThemeIcon() {
  const current = html.style.getPropertyValue('color-scheme');
  if (current === 'dark') {
    themeIcon.textContent = '🌙';
    themeIcon.classList.remove('sun');
  } else {
    themeIcon.textContent = '☀️';
    themeIcon.classList.add('sun');
  }
}
// Mettre à jour l'icône au chargement
updateThemeIcon();
//Clique sur toggle theme
document.getElementById('theme-toggle-btn').addEventListener('click', () => {
  const current = html.style.getPropertyValue('color-scheme');
  
  if (current === 'dark') {
      html.style.setProperty('color-scheme', 'light');
  } else {
      html.style.setProperty('color-scheme', 'dark');
  }
  
  // Mettre à jour l'icône après le changement de thème
  updateThemeIcon();
});

//////////// Sliders HSL ////////////
const hSlider = document.getElementById('h-slider');
const sSlider = document.getElementById('s-slider');
const hValue = document.getElementById('h-value');
const sValue = document.getElementById('s-value');

// Fonction pour mettre à jour la variable CSS --h
function updateH(value) {
  html.style.setProperty('--h', value);
  hValue.textContent = value;
}

// Fonction pour mettre à jour la variable CSS --s
function updateS(value) {
  html.style.setProperty('--s', value + '%');
  sValue.textContent = value + '%';
}

// Événements pour le slider H
hSlider.addEventListener('input', (e) => {
  updateH(e.target.value);
});

// Événements pour le slider S
sSlider.addEventListener('input', (e) => {
  updateS(e.target.value);
});

// Initialiser les valeurs affichées
updateH(hSlider.value);
updateS(sSlider.value);

//////////// Ajustement du spacer ////////////
function adjustSpacerHeight(valueFlat = -1) {
  const spacer = document.getElementById('spacer');
  const axelImage = document.querySelector('img[src="images/Axel.jpg"]');
  
  if (!spacer || !axelImage) return;
  
  // Obtenir les positions (les deux sont relatifs au viewport)
  const imageRect = axelImage.getBoundingClientRect();
  const spacerRect = spacer.getBoundingClientRect();
  
  // Position du bas de l'image (par rapport au viewport)
  const imageBottom = imageRect.bottom;
  
  // Position du haut du spacer (par rapport au viewport)
  const spacerTop = spacerRect.top;
  
  // Calculer la hauteur nécessaire pour atteindre le bas de l'image
  var heightNeeded = imageBottom - spacerTop + 14;

  if (typeof valueFlat === 'number' && valueFlat !== -1) {
    heightNeeded = valueFlat;
  }
  console.log(imageBottom, spacerTop, heightNeeded)
  if (heightNeeded > 0) {
    // Le spacer peut atteindre le bas de l'image
    spacer.style.height = heightNeeded + 'px';
  } else {
    // Le spacer est déjà en dessous du bas de l'image (ou ne peut pas l'atteindre)
    spacer.style.height = '0';
  }
}
// Écoute l'événement "avant impression"
window.addEventListener('beforeprint', () => {
  console.log("Préparation de l'impression...");
  adjustSpacerHeight(60); 
});

// Optionnel : Recalculer après (si l'impression modifie l'affichage écran)
window.addEventListener('afterprint', () => {
  adjustSpacerHeight();
});

// Appeler la fonction au chargement et au redimensionnement
window.addEventListener('load', adjustSpacerHeight);
window.addEventListener('resize', adjustSpacerHeight);

