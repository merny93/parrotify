//penis
console.log("penis2")
window.addEventListener("drop", (event) =>{
    event.preventDefault();
})

window.addEventListener("dragover", (event) =>{
    event.preventDefault();
})


//***************************************** */
//code to handle the hover stuff

//not gonna lie i have no clue why we need this but we simply do 
//jkjk it initiates the mask as hidden since we have no need for it  
document.getElementById("dropmask").classList.add('hidden');

var drag_over = function(e) {
    e.stopPropagation();
    e.preventDefault();
    document.getElementById("dropzone").classList.add('hover');
    document.getElementById("dropmask").classList.remove('hidden')
};

var drag_leave = function(e) {
    e.stopPropagation();
    e.preventDefault();
    document.getElementById("dropzone").classList.remove('hover');
    document.getElementById("dropmask").classList.add('hidden');

};


var drag_drop = function(e){
    e.stopPropagation();
    e.preventDefault();	
    document.getElementById("dropzone").classList.remove('hover');
    document.getElementById("dropmask").classList.add('hidden');
    document.querySelector('input').files = e.dataTransfer.files;
    document.getElementById('file-input').dispatchEvent(new Event('change'));
};

var overArea = document.getElementById('dropzone');
var dropMask = document.getElementById('dropmask');

overArea.addEventListener('dragover', drag_over, false);
dropMask.addEventListener('dragleave',drag_leave, false);
dropMask.addEventListener('drop', drag_drop, false);


/// code to get the input and send over
document.getElementById('file-input').addEventListener("change", function () {
    input = this;
    if (input.files && input.files[0]) {
        if (input.files[0].size > 5_000_000) {
            input.value = '';
            document.getElementById("preview-image").setAttribute("src", '#');
            alert("Image is too large! Try an image under 5mb.")
            return;
        }

        let extension = input.files[0].name.split('.').pop();
        if (extension != 'jpg' && extension != 'pnj'){
            input.value = '';
            document.getElementById("preview-image").setAttribute("src", '#');
            alert("File format not supported")
            return;
        }
        let reader = new FileReader();

        reader.onload = function (e) {
            document.getElementById("preview-image").setAttribute("src", e.target.result);
            input.labels[0].innerHTML =  '';//`${input.files[0].name} (${input.files[0].size} bytes)`;
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
            document.getElementById('image-form').style.display = "none"
            document.getElementById('gif-holder').style.display = "block"
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
        // console.log("SUBMISSION")
        if (document.getElementById("preview-image").getAttribute("src") == "#"){
            alert("select image fist")
            return;
        }

        sendData();
    });
});


function resetform(){
    document.getElementById("image-form").style.display = "block";
    document.getElementById("gif-holder").style.display = "none";
    document.getElementById("image-form").value = '';
    document.getElementById("preview-image").setAttribute("src", '#');
    document.getElementById("browse-label").innerHTML = "Drop or browse face";
}