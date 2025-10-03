const backgrounds = [
    'url("/assets/img/innosolv-boat_screen-hintergrund.png")',
    'url("/assets/img/innosolv-desert_screen-hintergruend.png")',
    'url("/assets/img/innosolv-galaxy_screen-hintergruend.png")',
    'url("/assets/img/innosolv-saentis_screen-hintergrund.png")'
  ];

  let current = 0;

  function changeBackground() {
    document.body.style.backgroundImage = backgrounds[current];
    current = (current + 1) % backgrounds.length;
  }

  // Initiales Setzen
  changeBackground();

  // Alle 24 Sekunden wechseln
  setInterval(changeBackground, 24000);