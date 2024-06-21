// Dentro de la función Start, agrega la referencia al botón de reinicio
function Start() {
    gameOver = document.querySelector(".game-over");
    suelo = document.querySelector(".suelo");
    contenedor = document.querySelector(".contenedor");
    textoScore = document.querySelector(".score");
    dino = document.querySelector(".dino");
    reiniciarBtn = document.querySelector(".reiniciar"); // Añadir esta línea
  
    document.addEventListener("keydown", HandleKeyDown);
    document.addEventListener("touchstart", HandleTouchStart); // Añadir soporte para eventos táctiles
  }
  
  // Función para reiniciar el juego
  function Reiniciar() {
    gameOver.style.display = "none";
    reiniciarBtn.style.display = "none"; // Ocultar el botón de reinicio
    obstaculos.forEach(obstaculo => obstaculo.remove());
    obstaculos = [];
    nubes.forEach(nube => nube.remove());
    nubes = [];
    score = 0;
    textoScore.innerText = score;
    gameVel = 1;
    contenedor.classList.remove("mediodia", "tarde", "noche");
    parado = false;
    dino.classList.add("dino-corriendo");
    dino.classList.remove("dino-estrellado");
    dinoPosY = sueloY;
    velY = 0;
    Loop(); // Volver a iniciar el loop del juego
  }
  
  // Modificar la función GameOver para mostrar el botón de reinicio
  function GameOver() {
    Estrellarse();
    gameOver.style.display = "block";
    reiniciarBtn.style.display = "block"; // Mostrar el botón de reinicio
  }
  