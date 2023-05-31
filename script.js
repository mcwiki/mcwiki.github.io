//varible
var audioList = [];  // will be loaded later

let firstSquish = true;
//end varible

//language support
const LANGUAGES = {
    "en": {
        audioList: [
            "audio/cn/gululu.mp3",
            "audio/cn/gururu.mp3",
            "audio/cn/转圈圈.mp3",
            "audio/cn/转圈圈咯.mp3",
        ],
        texts: {
            "page-title": "骑ZZZ",
            "doc-title": "骑ZZZ~",
            "page-descriptions": "给ZZZ写的小网站，对，就是那个<del>傻逼</del>最可爱的学委！",
            "counter-descriptions": ["ZZZ已经被骑了", "ZZZ已经跑了"],
            "counter-unit": ["次", "回"],
            "counter-button": ["骑一次~", "跑一圈！"],
            "credits-gif": "网盘：",
            "footer-repository-text": "文档：",
            "footer-repository-text-2": "ZZZZZZ"
        },
        cardImage: "img/card_cn.jpg"
    }, "cn": {
        audioList: [
            "audio/cn/gululu.mp3",
            "audio/cn/gururu.mp3",
            "audio/cn/转圈圈.mp3",
            "audio/cn/转圈圈咯.mp3",
        ],
        texts: {
            "page-title": "骑ZZZ",
            "doc-title": "骑ZZZ~",
            "page-descriptions": "给ZZZ写的小网站，对，就是那个<del>傻逼</del>最可爱的学委！",
            "counter-descriptions": ["ZZZ已经被骑了", "ZZZ已经跑了"],
            "counter-unit": ["次", "回"],
            "counter-button": ["骑一次~", "跑一圈！"],
            "credits-gif": "网盘：",
            "footer-repository-text": "文档：",
            "footer-repository-text-2": "ZZZZZZ"
        },
        cardImage: "img/card_cn.jpg"
    },
    "ja": {
        audioList: [
            "audio/cn/gululu.mp3",
            "audio/cn/gururu.mp3",
            "audio/cn/转圈圈.mp3",
            "audio/cn/转圈圈咯.mp3",
        ],
        texts: {
            "page-title": "骑ZZZ",
            "doc-title": "骑ZZZ~",
            "page-descriptions": "给ZZZ写的小网站，对，就是那个<del>傻逼</del>最可爱的学委！",
            "counter-descriptions": ["ZZZ已经被骑了", "ZZZ已经跑了"],
            "counter-unit": ["次", "回"],
            "counter-button": ["骑一次~", "跑一圈！"],
            "credits-gif": "网盘：",
            "footer-repository-text": "文档：",
            "footer-repository-text-2": "ZZZZZZ"
        },
        cardImage: "img/card_cn.jpg"
    },
    "kr": {
        audioList: [
            "audio/cn/gululu.mp3",
            "audio/cn/gururu.mp3",
            "audio/cn/转圈圈.mp3",
            "audio/cn/转圈圈咯.mp3",
        ],
        texts: {
            "page-title": "骑ZZZ",
            "doc-title": "骑ZZZ~",
            "page-descriptions": "给ZZZ写的小网站，对，就是那个<del>傻逼</del>最可爱的学委！",
            "counter-descriptions": ["ZZZ已经被骑了", "ZZZ已经跑了"],
            "counter-unit": ["次", "回"],
            "counter-button": ["骑一次~", "跑一圈！"],
            "credits-gif": "网盘：",
            "footer-repository-text": "文档：",
            "footer-repository-text-2": "ZZZZZZ"
        },
        cardImage: "img/card_cn.jpg"
    }
};

var current_language = localStorage.getItem("lang") || "cn";
if (current_language != "cn") {
    document.getElementById("language-selector").value = current_language;
};

function reload_language() {
    let curLang = LANGUAGES[current_language];
    let localTexts = curLang.texts;
    Object.entries(localTexts).forEach(([textId, value]) => {
        if (!(value instanceof Array))
            document.getElementById(textId).innerHTML = value;
    });
    refreshDynamicTexts()
    document.getElementById("herta-card").src = curLang.cardImage;
};

reload_language()
document.getElementById("language-selector").addEventListener("change", (ev) => {
    current_language = ev.target.value;
    localStorage.setItem("lang", ev.target.value);
    reload_language();
});

function getLocalAudioList() {
    return LANGUAGES[current_language].audioList;
};
//end language support

const getTimestamp = () => Date.parse(new Date());

const globalCounter = document.querySelector('#global-counter');
const localCounter = document.querySelector('#local-counter');
let globalCount = 0;
let localCount = localStorage.getItem('count-v2') || 0;
// stores counts from clicks until 5 seconds have passed without a click
let heldCount = 0;

function getGlobalCount(duration = null, callback = null) {
    // duration: in milliseconds, how long will it take to animate the numbers, in total.
    fetch('https://kuru-kuru-count-api.onrender.com/sync', { method: 'GET' })
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
        count: heldCount,
        e: e // check if request is triggered by event
    };

    fetch('https://kuru-kuru-count-api.onrender.com/update', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(() => {
            // update local count
            localStorage.setItem('count-v2', localCount);
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

var cachedObjects = {};

function tryCachedObject(origUrl) {
    // check if the object is already cached
    if (cachedObjects[origUrl]) {
        return cachedObjects[origUrl];
    } else {
        // start caching it
        fetch(origUrl)
            .then((response) => response.blob())
            .then((blob) => {
                // Create a blob URL for the object
                const blobUrl = URL.createObjectURL(blob);
                // get the object cached by storing the blob URL in the cachedObjects object
                cachedObjects[origUrl] = blobUrl;
            })
            .catch((error) => {
                console.error(`Error caching object from ${origUrl}: ${error}`);
            });
        return origUrl;
    }
};

function randomChoice(myArr) {
    const randomIndex = Math.floor(Math.random() * myArr.length);
    const randomItem = myArr[randomIndex];
    return randomItem;
};

function getRandomAudioUrl() {
    var localAudioList = getLocalAudioList()
    if (current_language == "en" || current_language == "ja" || current_language == "kr") {
        const randomIndex = Math.floor(Math.random() * 2) + 1; //kuruto audio only play once at first squish
        const randomItem = localAudioList[randomIndex];
        return randomItem;
    }
    const randomIndex = Math.floor(Math.random() * localAudioList.length);
    const randomItem = localAudioList[randomIndex];
    return randomItem;
};

function playKuru() {
    let audioUrl;

    if (firstSquish) {
        firstSquish = false;
        audioUrl = getLocalAudioList()[0]; //get kuruto audio at first squish, then never again
    } else {
        audioUrl = getRandomAudioUrl();
    }

    let audio = new Audio(tryCachedObject(audioUrl));

    audio.play();

    audio.addEventListener("ended", function () {
        this.remove();
    });
};

function animateHerta() {
    let id = null;

    const random = Math.floor(Math.random() * 2) + 1;
    const elem = document.createElement("img");
    elem.src = `img/hertaa${random}.gif`;
    elem.style.position = "absolute";
    elem.style.right = "-500px";
    elem.style.top = counterButton.getClientRects()[0].bottom + scrollY - 430 + "px"
    elem.style.zIndex = "-10";
    document.body.appendChild(elem);

    let pos = -500;
    const limit = window.innerWidth + 500;
    clearInterval(id);
    id = setInterval(() => {
        if (pos >= limit) {
            clearInterval(id);
            elem.remove()
        } else {
            pos += 20;
            elem.style.right = pos + 'px';
        }
    }, 12);
};

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

function refreshDynamicTexts() {
    let curLang = LANGUAGES[current_language];
    let localTexts = curLang.texts;
    Object.entries(localTexts).forEach(([textId, value]) => {
        if (value instanceof Array)
            document.getElementById(textId).innerHTML = randomChoice(value);
    });
};