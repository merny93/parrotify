var mainArea = document.getElementsByClassName('page-wrap')[0];

function parrotFactory(parrotSize, parrotTime, parrotPos){
    let el = document.createElement('div');
    let inner = document.createElement('img');
    inner.setAttribute('src', 'parrots/parrot/parrot.gif');
    inner.setAttribute('class','parrot');


    el.setAttribute('class', 'parrot-slider');
    el.appendChild(inner)
    el.style.setProperty('--parrot-size', parrotSize);
    el.style.setProperty('--parrot-time', parrotTime);
    el.style.top = parrotPos;

    el.addEventListener('animationend', () => {
        el.remove();
    });
    return el;
}
function spawnParrot(){
    let pSize = Math.floor(Math.random() * 300 + 50);
    let pTime = Math.floor(Math.random() * 10 + 2);
    let pPos = Math.floor(Math.random() * 100);
    mainArea.appendChild(parrotFactory(pSize+'px', pTime+'s', pPos + '%'));
    setTimeout(spawnParrot, Math.floor(Math.random() * 1000 + 500));
}
    
spawnParrot();