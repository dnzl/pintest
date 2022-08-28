const home = 'https://www.pinterest.fr/virtualroot/';

function saveData(pins) {
    browser.storage.local.set({ pins });
}

function getData(data) {
    return browser.storage.local.get(data);
}

function waitForElm(selector) {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelectorAll(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                resolve(document.querySelectorAll(selector));
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}

waitForElm('[data-test-id="non-story-pin-image"]').then((pics) => {
    if (window.location.href !== home){
        return;
    }
    const pins = [];
    pics.forEach(pic => {
        const href = pic.parentElement.closest('a').href;
        pins.push(href);
    });
    saveData(pins);
});

waitForElm('[data-test-id="closeup-data-loaded"]').then((pin) => {
    if (window.location.href === home){
        return;
    }
    doMagic();
})

function createBtn(kind) {
    const exists = document.getElementById(kind);
    if (exists?.length > 0){
        return exists;
    }
    const a = document.createElement("a");
    a.id = kind;
    a.innerHTML = kind === 'next' ? "Next Pin" : 'Prev Pin';
    a.style.position = 'absolute';
    a.style.border = 'solid 5px red';
    a.style.width = '50px';
    a.style.height = '20px';
    a.style.zIndex = 9999;
    if (kind === 'next') {
        a.style.right = 0;
    } else {
        a.style.left = 0;
    }

    a.style.top = '70px';
    return a;
}

function doMagic() {
    const aNext = createBtn('next');
    const aPrev = createBtn('prev');

    getNextPin().then(({ prev, next }) => {
        aNext.href = next;
        aPrev.href = prev;
        document.body.appendChild(aNext);
        document.body.appendChild(aPrev);
    });
}


function getNextPin() {
    return new Promise((resolve) => {
        const current = window.location.href;
        getData('pins').then((r) => {
            const list = r.pins;
            const index = list.findIndex(e => e === current);
            const last = list.length - 1;
            
            let next, prev;

            if (index === -1) {
                next = 0;
                prev = 0;
            } else {
                next = index + 1;
                prev = index - 1;
            }

            if (next > last) {
                next = 0;
            }
            if (index <= 0) {
                prev = last;
            }
            
            const res = {
                prev: list[prev],
                next: list[next],
            };
            resolve(res);
        });
    });
}