const html = document.documentElement;
const ua = navigator.userAgent.toLowerCase();

// Appliquer le thème blanc par défaut
html.style.setProperty('color-scheme', 'light');
// Ajouter l'événement impression au bouton d'impression
document.getElementById('print-btn').addEventListener('click', () => {
  window.print();
});



//////////// Sliders HSL ////////////
const hSlider = document.getElementById('h-slider');
const sSlider = document.getElementById('s-slider');
function updateH(value) {
  html.style.setProperty('--h', value);
}
function updateS(value) {
  html.style.setProperty('--s', value + '%');
}

hSlider.addEventListener('input', (e) => {
  updateH(e.target.value);
  localStorage.setItem('h', e.target.value);
});
sSlider.addEventListener('input', (e) => {
  updateS(e.target.value);
  localStorage.setItem('s', e.target.value);
});

console.log(localStorage.getItem('h'))
if (localStorage.getItem('h')) updateH(localStorage.getItem('h'))
else updateH(hSlider.value);

if (localStorage.getItem('s')) updateS(localStorage.getItem('s'))
else updateS(sSlider.value);
////////////////////



//////////// Ajustement du spacer (pour laisser de la place sous la photo) ////////////
function adjustSpacerHeight(valueFlat = -1) {
  const spacer = document.getElementById('spacer');
  const axelImage = document.getElementById('image_perso');
  
  if (!spacer || !axelImage) return;
  
  const imageRect = axelImage.getBoundingClientRect();
  const spacerRect = spacer.getBoundingClientRect();
  const imageBottom = imageRect.bottom;
  const spacerTop = spacerRect.top;
  
  var heightNeeded = imageBottom - spacerTop + 7;

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
  if (ua.indexOf('firefox') > -1) {
      adjustSpacerHeight(60); 
  } else if (ua.indexOf('chrome') > -1) {    
    adjustSpacerHeight(80); 
  } else if (ua.indexOf('safari') > -1) {
      adjustSpacerHeight(84); 
  }
});
// Optionnel : Recalculer après (si l'impression modifie l'affichage écran)
window.addEventListener('afterprint', () => {
  adjustSpacerHeight();
});

// Appeler la fonction au chargement et au redimensionnement
window.addEventListener('load', adjustSpacerHeight);
window.addEventListener('resize', adjustSpacerHeight);
////////////////////////////



/////////////////// BULLE /////////////////
const widget = document.getElementById('floating-widget');
const bubble = widget.querySelector('.bubble');

let isDragging = false;
let hasMoved = false; // Pour distinguer le clic du drag
let startX, startY, initialLeft, initialTop; // Positions
const widgetSize = 60; // Taille du widget pour les calculs de bords

// --- Événements Souris & Tactile ---
// 1. Début du drag
const onStart = (e) => {
    // Si le menu est ouvert et qu'on clique sur la bulle, on le ferme sans drag
    if(widget.classList.contains('open') && !e.target.closest('.menu-options')) {
          // On laisse le click event gérer la fermeture
    }
    
    isDragging = true;
    hasMoved = false;
    widget.classList.remove('snapping'); // On enlève l'animation pendant le drag

    // Support souris ou tactile
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    startX = clientX;
    startY = clientY;
    
    const rect = widget.getBoundingClientRect();
    initialLeft = rect.left;
    initialTop = rect.top;
    
    // On écoute le mouvement sur window pour ne pas perdre le focus si on va trop vite
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
};

// 2. Pendant le drag
const onMove = (e) => {
    if (!isDragging) return;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const dx = clientX - startX;
    const dy = clientY - startY;

    // Si on a bougé de plus de 5 pixels, c'est un drag, pas un clic
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        hasMoved = true;
        // Si on drag, on ferme le menu pour éviter des bugs visuels
        widget.classList.remove('open');
    }

    // Mise à jour de la position
    widget.style.left = `${initialLeft + dx}px`;
    widget.style.top = `${initialTop + dy}px`;
    
    // Empêcher le scroll sur mobile
    if(e.touches) e.preventDefault();
};

// 3. Fin du drag (Relâchement)
const onEnd = () => {
    if (!isDragging) return;
    isDragging = false;

    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('mouseup', onEnd);
    window.removeEventListener('touchmove', onMove);
    window.removeEventListener('touchend', onEnd);

    if (hasMoved) {
        snapToEdge();
    }
};

// --- Logique de Magnétisme ---
function snapToEdge() {
    const rect = widget.getBoundingClientRect();
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    // Limites pour ne pas sortir de l'écran verticalement
    let newTop = rect.top;
    if (newTop < 10) newTop = 10;
    if (newTop > screenHeight - widgetSize - 10) newTop = screenHeight - widgetSize - 10;

    // Calcul du bord le plus proche (Gauche ou Droite)
    const centerX = rect.left + (widgetSize / 2);
    let newLeft;

    if (centerX < screenWidth / 2) {
        newLeft = 10; // Bord gauche (avec marge 10px)
    } else {
        newLeft = screenWidth - widgetSize - 10; // Bord droit
    }

    // Appliquer l'animation et la nouvelle position
    widget.classList.add('snapping');
    widget.style.left = `${newLeft}px`;
    widget.style.top = `${newTop}px`;
    
    // Gestion de l'affichage du menu (gauche ou droite)
    // Si on est à droite, le menu doit s'afficher un peu vers la gauche pour ne pas être coupé
    const menu = widget.querySelector('.menu-options');
    if (newLeft > screenWidth / 2) {
        menu.style.left = 'auto';
        menu.style.right = '0';
    } else {
        menu.style.left = '0';
        menu.style.right = 'auto';
    }
}

// --- Logique du Clic (Ouverture/Fermeture) ---
bubble.addEventListener('mousedown', onStart);
bubble.addEventListener('touchstart', onStart, { passive: false });

bubble.addEventListener('click', (e) => {
    // Si on n'a pas bougé (hasMoved == false), c'est un vrai clic
    if (!hasMoved) {
        widget.classList.toggle('open');
    }
});

// Initialisation : snap au démarrage pour se caler
snapToEdge();
// Gérer le redimensionnement de la fenêtre
window.addEventListener('resize', snapToEdge);
////////////////////////////////////