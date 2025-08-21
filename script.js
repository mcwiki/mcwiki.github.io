//varible
var audioList = [];  // will be loaded later

let firstSquish = true;
//end varible

// --- Optimized Code ---

// Since the language is fixed to Chinese, we can simplify the configuration.
const APP_CONFIG = {
    audioList: [
        "audio/cn/gululu.mp3",
        "audio/cn/gururu.mp3",
        "audio/cn/转圈圈.mp3",
        "audio/cn/转圈圈咯.mp3",
    ],
    texts: {
        "counter-descriptions": ["ZZZ已经被骑了", "ZZZ已经跑了"],
        "counter-unit": ["次", "回"],
        "counter-button": ["骑一次~", "跑一圈！"]
    }
};

// Cache frequently accessed DOM elements
const textElements = {
    counterDescriptions: document.getElementById("counter-descriptions"),
    counterUnit: document.getElementById("counter-unit"),
    counterButton: document.getElementById("counter-button")
};

// Function to update dynamic text elements, now more efficient.
function refreshDynamicTexts() {
    const localTexts = APP_CONFIG.texts;
    textElements.counterDescriptions.innerHTML = randomChoice(localTexts["counter-descriptions"]);
    textElements.counterUnit.innerHTML = randomChoice(localTexts["counter-unit"]);
    textElements.counterButton.innerHTML = randomChoice(localTexts["counter-button"]);
}

const getTimestamp = () => Date.parse(new Date());

const globalCounter = document.querySelector('#global-counter');
const localCounter = document.querySelector('#local-counter');
let globalCount = 0;
let localCount = localStorage.getItem('count-v2') || 0;
// stores counts from clicks until 5 seconds have passed without a click
let heldCount = 0;

function getGlobalCount(duration = null, callback = null) {
    // duration: in milliseconds, how long will it take to animate the numbers, in total.
    fetch('https://zqqapi.161560.xyz/sync', { method: 'GET' })
        .then((response) => response.json())
        .then((data) => {
            globalCount = data.count;
            // animate counter starting from current value to the updated value
            const startingCount = parseInt(globalCounter.textContent.replace(/,/g, ''));
            (animateCounter = () => {
                const k = 5;
                var currentCount = parseInt(globalCounter.textContent.replace(/,/g, ''));
                const step = (globalCount - startingCount) * 1.0 / (duration || 200) * k;  // how many numbers it'll fly through, in 1ms
                console.log(duration, step)
                if (currentCount < globalCount) {
                    currentCount += step;
                    globalCounter.textContent = Math.ceil(currentCount).toLocaleString('en-US');
                    setTimeout(animateCounter, k);
                } else {
                    globalCounter.textContent = globalCount.toLocaleString('en-US');
                    if (callback != null) {
                        callback();
                    }
                }
            })();
        })
        .catch((err) => console.error(err));
};
// initialize counters
localCounter.textContent = localCount.toLocaleString('en-US');

let prevTime = 0;
// update global count every 10 seconds when tab is visible
const UPDATE_INTERVAL = 10000;
function updateGlobalCount(first = false) {
    if ((getTimestamp() - prevTime > UPDATE_INTERVAL) || first) {
        getGlobalCount(first ? 200 : UPDATE_INTERVAL, () => {
            updateGlobalCount();
        });
    } else {
        setTimeout(updateGlobalCount, 1000);  // check it 1sec later
    }
};

updateGlobalCount(true);

function update(e, resetCount = true) {
    // update global count
    const data = {
        count: heldCount
    };

    fetch('https://zqqapi.161560.xyz/update', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(() => {
            // local count is now saved immediately on click
            if (resetCount) heldCount = 0;
        })
        .catch((err) => console.error(err));
};

let timer;

//counter button
const counterButton = document.querySelector('#counter-button');
counterButton.addEventListener('click', (e) => {
    prevTime = getTimestamp();

    heldCount++;
    localCount++;
    globalCount++;

    // Save local count immediately on click, regardless of API call success
    localStorage.setItem('count-v2', localCount);

    if (heldCount === 10) {
        // update on 10 counts
        update(e, false);
        heldCount -= 10;
    } else {
        // update 5 seconds after last click
        clearTimeout(timer);
        timer = setTimeout(() => update(e), 5000);
    }

    localCounter.textContent = localCount.toLocaleString('en-US');
    globalCounter.textContent = globalCount.toLocaleString('en-US');

    triggerRipple(e);

    playKuru();
    animateHerta();
    refreshDynamicTexts();
});

function randomChoice(myArr) {
    const randomIndex = Math.floor(Math.random() * myArr.length);
    const randomItem = myArr[randomIndex];
    return randomItem;
};

// Simplified audio playback, letting the browser handle caching.
function playKuru() {
    let audioUrl;
    const audioList = APP_CONFIG.audioList;

    if (firstSquish) {
        firstSquish = false;
        audioUrl = audioList[0]; // Play the first sound once.
    } else {
        // Select a random sound from the rest of the list.
        const randomIndex = Math.floor(Math.random() * (audioList.length - 1)) + 1;
        audioUrl = audioList[randomIndex];
    }

    const audio = new Audio(audioUrl);
    audio.play();
}

// --- Herta Animation Optimization using Object Pooling ---
const hertaImagePool = [];
const MAX_HERTA_IMAGES = 10; // Maximum number of concurrent animations.

// Pre-create image elements for the pool.
for (let i = 0; i < MAX_HERTA_IMAGES; i++) {
    const elem = document.createElement("img");
    elem.style.position = "absolute";
    elem.style.right = "-500px";
    elem.style.zIndex = "-10";
    elem.style.visibility = "hidden"; // Initially hidden
    document.body.appendChild(elem);
    hertaImagePool.push({ element: elem, inUse: false });
}

function animateHerta() {
    // Find an available image element from the pool.
    const herta = hertaImagePool.find(h => !h.inUse);
    if (!herta) return; // Pool is full, skip animation for this click.

    herta.inUse = true;
    const { element: elem } = herta;

    const random = Math.floor(Math.random() * 2) + 1;
    elem.src = `img/hertaa${random}.gif`;
    elem.style.top = counterButton.getClientRects()[0].bottom + scrollY - 430 + "px";
    elem.style.visibility = "visible";

    let pos = -500;
    const limit = window.innerWidth + 500;
    let id = setInterval(() => {
        if (pos >= limit) {
            clearInterval(id);
            // Reset and release the element back to the pool.
            elem.style.visibility = "hidden";
            elem.style.right = "-500px";
            herta.inUse = false;
        } else {
            pos += 20;
            elem.style.right = pos + 'px';
        }
    }, 12);
}

function triggerRipple(e) {
    let ripple = document.createElement("span");

    ripple.classList.add("ripple");

    const counter_button = document.getElementById("counter-button");
    counter_button.appendChild(ripple);

    let x = e.clientX - e.target.offsetLeft;
    let y = e.clientY - e.target.offsetTop;

    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;

    setTimeout(() => {
        ripple.remove();
    }, 300);
};
//end counter button

// Initial text setup on page load.
refreshDynamicTexts();
