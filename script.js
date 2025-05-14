// Seleção dos elementos do DOM
const keyboardContainer = document.getElementById('keyboard');
const output = document.getElementById('output');
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// Adiciona o SIM, NÃO
alphabet.push("SIM", "NÃO");

// Criação das teclas do teclado virtual
alphabet.forEach(letter => {
    const key = document.createElement('div');
    key.classList.add('key');
    key.innerText = letter;

    // Adiciona classes específicas para SIM e NÃO
    if (letter === "SIM") key.classList.add('yes');
    if (letter === "NÃO") key.classList.add('no');

    keyboardContainer.appendChild(key);
});

// Seleciona todas as teclas criadas
const keys = Array.from(document.querySelectorAll('.key'));
let activeIndex = 0;
let canSelect = true;

// 🔄 Timer para alternar as teclas
setInterval(() => {
    if (canSelect) {
        keys.forEach(key => key.classList.remove('active'));
        keys[activeIndex].classList.add('active');
        activeIndex = (activeIndex + 1) % keys.length;
    }
}, 500);

// MediaPipe Configuração
const videoElement = document.getElementById('video');

const faceMesh = new FaceMesh({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
});

faceMesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

faceMesh.onResults(onResults);

const camera = new Camera(videoElement, {
    onFrame: async () => {
        await faceMesh.send({ image: videoElement });
    },
    width: 640,
    height: 480
});
camera.start();

function onResults(results) {
    if (!results.multiFaceLandmarks[0]) return;

    const landmarks = results.multiFaceLandmarks[0];
    const nose = landmarks[1]; // Ponto referente ao nariz

    // Coordenadas do nariz relativas ao vídeo
    const x = nose.x * videoElement.clientWidth;
    const y = nose.y * videoElement.clientHeight;

    // 🔄 Lógica de captura
    if (x < videoElement.clientWidth * 0.2 && canSelect) {
        output.value = "";
        activeIndex = 0;
        canSelect = false;
        setTimeout(() => canSelect = true, 1000);
    }

    if (x > videoElement.clientWidth * 0.8 && canSelect) {
        output.value = output.value.slice(0, -1);
        canSelect = false;
        setTimeout(() => canSelect = true, 1000);
    }

    if (y > videoElement.clientHeight * 0.7 && canSelect) {
        const selectedKey = document.querySelector('.key.active');
        if (selectedKey) {
            const text = (selectedKey.innerText === "SIM" || selectedKey.innerText === "NÃO") ? ` ${selectedKey.innerText} ` : selectedKey.innerText;
            output.value += text === "ESPAÇO" ? " " : text;
            canSelect = false;
            setTimeout(() => canSelect = true, 1000);
        }
    }

    // Nariz no topo → Adicionar espaço
    if (y < videoElement.clientHeight * 0.2 && canSelect) {
        output.value += " ";
        canSelect = false;
        setTimeout(() => canSelect = true, 1000);
    }
}

// tutorial img toggle
const tutorialImg = document.getElementById('tutorial-img');

function openTutorial() {
		tutorialImg.style.display = 'block';
}

function closeTutorial() {
		tutorialImg.style.display = 'none';
}