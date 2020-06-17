//penis
console.log("penis2")

var x;
document.getElementById('file-input').addEventListener("change", function () {
    input = this;
    if (input.files && input.files[0]) {
        if (input.files[0].size > 5_000_000) {
            input.value = '';
            alert("Image is too large! Try an image under 5mb.")
            return;
        }

        let reader = new FileReader();

        reader.onload = function (e) {
            document.getElementById("preview-image").setAttribute("src", e.target.result);
            input.labels[0].innerHTML = `${input.files[0].name} (${input.files[0].size} bytes)`;
        }

        reader.readAsDataURL(input.files[0]);
    }
})

function httpGetAsync(theUrl, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}


function processImageCallback(response) {
    let text = response.responseText;
    console.log(text)
    let dicks = JSON.parse(text);
    // console.log(dicks)
}

function getImage(url) {
    return new Promise((resolve, reject) => {
        let request = new XMLHttpRequest();
        request.open('GET', url);
        request.responseType = 'blob';

        request.onload = () => {
            if (request.status === 200) {
                resolve(request.response)
            }
            else {
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
function showimage(canvas, blob) {
    let ctx = canvas.getContext('2d');
    let img = new Image();

    img.onload = function () {
        ctx.drawImage(img, 0, 0)
    }

    img.src = URL.createObjectURL(blob);
}


// var x;
// getImage("/getParrotGIF").then((value) => {
//     x = value;
//     // showimage(canvas, value);
//     console.log("did it")
// });

function makeGIF(img) {
    console.log("makin a gif")
    let gif = new GIF({
        workers: 2,
        quality: 10
    });

    gif.addFrame(img);
    gif.on('finished', function (blob) {
        window.open(URL.createObjectURL(blob));
    })

    gif.render();
}

function doGiffing(gif){
    
}

//// THE FORM CODE IS BELLOW



var xy;

window.addEventListener("load", function () {


    function sendData() {
        const XHR = new XMLHttpRequest();
        // Bind the FormData object and the form element
        const FD = new FormData(form);

        // Define what happens on successful data submission
        XHR.addEventListener("load", function (event) {

            let img = document.getElementById("finished-gif");
            img.src = URL.createObjectURL(this.response);
            let aTag = document.getElementById("finished-gif-link");
            aTag.setAttribute("href", img.src);
        });

        // Define what happens in case of error
        XHR.addEventListener("error", function (event) {
            alert('Oops! Something went wrong.');
        });

        // Set up our request
        XHR.open("POST", "/parrotify");
        XHR.responseType = "blob";

        // The data sent is what the user provided in the form
        XHR.send(FD);
    }

    // Access the form element...
    const form = document.getElementById("image-form");

    // ...and take over its submit event.
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        console.log("SUBMISSION")

        sendData();
    });
});