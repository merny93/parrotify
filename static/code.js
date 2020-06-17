//penis
console.log("penis2")


function httpGetAsync(theUrl, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}


function processImageCallback(response){
    let text = response.responseText;
    console.log(text)
    let dicks = JSON.parse(text);
    // console.log(dicks)
}

function getImage(url){
    return new Promise( (resolve, reject) =>{
        let request = new XMLHttpRequest();
        request.open('GET', url);
        request.responseType = 'blob';

        request.onload = () =>{
            if (request.status === 200){
                resolve(request.response)
            }
            else{
                reject(new Error('Couldn\'t load image. Code' + request.statusText))
            }
        };

        request.onerror = () => {
            reject(new Error('Error loading image.'));
        }

        request.send();

    })
}


// httpGetAsync("/getParrot", processImageCallback);
// httpGetAsync("/getParrotGIF", (response) => pr = response);


canvas = document.getElementById('canvas');
function showimage(canvas, blob){
    let ctx = canvas.getContext('2d');
    let img = new Image();

    img.onload = function(){
        ctx.drawImage(img, 0, 0)
    }

    img.src = URL.createObjectURL(blob);
}


var x;
getImage("/getParrotGIF").then( (value) => {
    x = value;
    // showimage(canvas, value);
    console.log("did it")
});

var y;
getImage("/test1").then( (value) => {
    y = value;
    showimage(canvas, value);

    let img = new Image();
    img.src = URL.createObjectURL(value);

    makeGIF(img);
})
// window.open('https://www.google.com')


function makeGIF(img){
    console.log("makin a gif")
    let gif = new GIF({
        workers:2,
        quality:10
    });
    
    gif.addFrame(img);
    gif.on('finished', function (blob){
        window.open(URL.createObjectURL(blob));
    })

    gif.render();
}
