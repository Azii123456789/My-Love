// Animated background hearts (realistic SVG)
function createBgHeart() {
    const bgHearts = document.querySelector('.bg-hearts');
    const heart = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const width = 28 + Math.random() * 24;
    const height = 24 + Math.random() * 18;
    heart.setAttribute('width', width);
    heart.setAttribute('height', height);
    heart.setAttribute('viewBox', '0 0 50 45');
    heart.classList.add('bg-heart');
    heart.style.left = Math.random() * 98 + 'vw';
    heart.style.bottom = '-40px';
    heart.style.animationDuration = (8 + Math.random() * 8) + 's';
    heart.style.opacity = 0.18 + Math.random() * 0.12;

    // SVG heart path with gradient and shine
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const grad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    grad.setAttribute('id', 'bgHeartGrad');
    grad.setAttribute('x1', '0%');
    grad.setAttribute('y1', '0%');
    grad.setAttribute('x2', '0%');
    grad.setAttribute('y2', '100%');
    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', '#ff5eae');
    stop1.setAttribute('stop-opacity', '1');
    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '100%');
    stop2.setAttribute('stop-color', '#ffb6c1');
    stop2.setAttribute('stop-opacity', '1');
    grad.appendChild(stop1);
    grad.appendChild(stop2);
    defs.appendChild(grad);
    heart.appendChild(defs);

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M24.5,42 C24.5,42 2,26 2,13.5 C2,6.5 8,2 14.5,2 C19.5,2 24.5,7 24.5,7 C24.5,7 29.5,2 34.5,2 C41,2 47,6.5 47,13.5 C47,26 24.5,42 24.5,42 Z');
    path.setAttribute('fill', 'url(#bgHeartGrad)');
    path.setAttribute('stroke', '#ff5eae');
    path.setAttribute('stroke-width', '1.2');
    path.setAttribute('opacity', '0.95');
    heart.appendChild(path);

    // Shine effect
    const shine = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    shine.setAttribute('cx', '18');
    shine.setAttribute('cy', '12');
    shine.setAttribute('rx', '6');
    shine.setAttribute('ry', '2.5');
    shine.setAttribute('fill', '#fff');
    shine.setAttribute('opacity', '0.25');
    heart.appendChild(shine);

    bgHearts.appendChild(heart);
    setTimeout(() => heart.remove(), 13000);
}
setInterval(createBgHeart, 600);

// Minimal floating hearts animation
function createHeart() {
    const heartsContainer = document.querySelector('.floating-hearts');
    const heart = document.createElement('div');
    heart.className = 'heart';
    heart.style.left = Math.random() * 90 + '%';
    heart.style.animationDuration = (5 + Math.random() * 3) + 's';
    heart.style.opacity = 0.5 + Math.random() * 0.5;
    heartsContainer.appendChild(heart);
    setTimeout(() => heart.remove(), 7000);
}
setInterval(createHeart, 1200);


document.getElementById('sendBtn').addEventListener('click', function() {
    const message = document.getElementById('message');
    message.innerHTML = "Message sent! 💌<br>Forever yours.";
    message.style.color = '#ff1493';
    this.disabled = true;
    this.innerText = 'Sent';
});

// Auto-play the audio
window.addEventListener('load', function() {
    const audio = document.querySelector('.custom-audio');
    if (audio) {
        // Try to play with sound
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                // Autoplay was prevented, play muted first then unmute
                audio.muted = true;
                audio.play().then(() => {
                    audio.muted = false;
                }).catch(err => {
                    console.log('Autoplay not allowed');
                });
            });
        }
    }
});

// Allow audio to play on any user interaction
document.addEventListener('click', function() {
    const audio = document.querySelector('.custom-audio');
    if (audio && audio.paused) {
        audio.play().catch(err => console.log('Play failed'));
    }
}, { once: true });

// ----- waveform syncing using Web Audio API -----
function setupWaveformSync() {
    const audio = document.querySelector('.custom-audio');
    const waveformBars = document.querySelectorAll('.waveform .bar');
    if (waveformBars.length === 0) return;

    // prepare audio context if available
    let analyser, ctx;
    if (audio) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        ctx = new AudioContext();
        analyser = ctx.createAnalyser();
        const source = ctx.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(ctx.destination);
        analyser.fftSize = 64;
    }

    const bufferLength = analyser ? analyser.frequencyBinCount : 32;
    const dataArray = new Uint8Array(bufferLength);

    function animate() {
        if (analyser) {
            analyser.getByteFrequencyData(dataArray);
        } else {
            // fallback: random values if no analyser
            for (let i = 0; i < bufferLength; i++) {
                dataArray[i] = Math.random() * 255;
            }
        }
        waveformBars.forEach((bar, i) => {
            const value = dataArray[i % bufferLength];
            const percent = value / 255;
            const min = 10; // px minimum height
            const max = 60; // px maximum height
            const height = min + percent * (max - min);
            bar.style.height = height + 'px';
        });
        requestAnimationFrame(animate);
    }

    // start animation right away so bars are visible
    animate();

    if (audio) {
        audio.addEventListener('play', () => {
            if (ctx.state === 'suspended') ctx.resume();
        });
    }
}

window.addEventListener('load', setupWaveformSync);
