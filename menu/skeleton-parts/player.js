// Player initialization fix for autoplay and buttons on new tabs

// Wait until the DOM and YouTube player are ready
function initPlayerFix() {
    const checkPlayer = setInterval(() => {
        const player = document.querySelector('video');
        const rotateButton = document.querySelector('.ytp-rotate-button');

        if (player) {
            // Autoplay fix: trigger play if not already playing
            if (player.paused) {
                player.play().catch(err => {
                    console.warn('Autoplay failed (browser policy):', err);
                });
            }

            // Ensure Rotate button is visible
            if (!rotateButton) {
                addRotateButton();
            }

            clearInterval(checkPlayer);
        }
    }, 100);
}

// Function to add Rotate button if missing
function addRotateButton() {
    const controls = document.querySelector('.ytp-right-controls');
    if (!controls) return;

    const rotateBtn = document.createElement('button');
    rotateBtn.className = 'ytp-rotate-button';
    rotateBtn.title = 'Rotate video';
    rotateBtn.textContent = '⟳';

    rotateBtn.addEventListener('click', () => {
        const video = document.querySelector('video');
        if (video) {
            const currentRotation = video.style.transform.match(/rotate\((\d+)deg\)/);
            const rotation = currentRotation ? parseInt(currentRotation[1]) : 0;
            video.style.transform = `rotate(${rotation + 90}deg)`;
        }
    });

    controls.insertBefore(rotateBtn, controls.firstChild);
}

// Run the fix on page load
window.addEventListener('yt-page-data-updated', initPlayerFix);
window.addEventListener('DOMContentLoaded', initPlayerFix);

// Also trigger on history navigation (YouTube SPA)
document.addEventListener('yt-navigate-finish', initPlayerFix);