/* Prevent loading image if user misses box */
window.addEventListener("drop", (event) =>{
    event.preventDefault();
})
window.addEventListener("dragover", (event) =>{
    event.preventDefault();
})

/* Frequently used elements */
var dropArea = document.getElementById('dropzone');
var dropMask = document.getElementById('dropmask');
var closeImageBtn = document.getElementById("close-image-btn")
var fileInput = document.getElementById("file-input")
var imageForm = document.getElementById("image-form")
var gifHolder = document.getElementById("gif-holder")
var previewImage = document.getElementById("preview-image")
var browseLabel = document.getElementById("browse-label")
var finishedGif =document.getElementById("finished-gif")

var image_url = "";

//***************************************** */
//code to handle the hover stuff
var drag_over = function(e) {
    console.log("dragover")

    e.stopPropagation();
    e.preventDefault();
    dropArea.classList.add('hover');
    dropMask.classList.remove('hidden')
};

var drag_leave = function(e) {
    console.log("dragleave")

    e.stopPropagation();
    e.preventDefault();
    dropArea.classList.remove('hover');
    dropMask.classList.add('hidden');

};

var drag_drop = function(e){
    console.log("dragdrop")

    e.stopPropagation();
    e.preventDefault();	
    dropArea.classList.remove('hover');
    document.getElementById("dropmask").classList.add('hidden');
    fileInput.files = e.dataTransfer.files;
    fileInput.dispatchEvent(new Event('change'));
};

dropArea.addEventListener('dragover', drag_over, false);
dropMask.addEventListener('dragleave',drag_leave, false);
dropMask.addEventListener('drop', drag_drop, false);

function share_click(){
    console.log(this);
}

function reset_click(){
    imageForm.style.display = "block";
    gifHolder.style.display = "none";
    previewImage.setAttribute("src", '#');
    dropMask.classList.add('hidden');
    fileInput.classList.remove("hidden");
    imageForm.reset();
    closeImageBtn.classList.add('hidden')
    browseLabel.classList.remove('hidden')
    image_url = ""
}

/// code to get the input and send over
fileInput.addEventListener("change", function () {
    if (fileInput.files && fileInput.files[0]) {
        /* Check if image is too large */
        if (fileInput.files[0].size > 5_000_000) {
            fileInput.value = '';
            previewImage.setAttribute("src", '#');
            alert("Image is too large! Try an image under 5mb.")
            return;
        }

        // let extension = input.files[0].name.split('.').pop();
        // if (extension != 'jpg' && extension != 'jpeg' && extension != 'png' && extension != 'HEIC'){
        //     input.value = '';
        //     document.getElementById("preview-image").setAttribute("src", '#');
        //     alert("File format not supported. Please use gif, jpg, or png.")
        //     return;
        // }
        // let reader = new FileReader();
        var reader = new FileReader();
        reader.onload = function (e) {
            previewImage.setAttribute("src", e.target.result);
            fileInput.classList.add("hidden");//`${input.files[0].name} (${input.files[0].size} bytes)`;
            browseLabel.classList.add('hidden')
            closeImageBtn.classList.remove("hidden");
        }
        
        reader.readAsDataURL(fileInput.files[0]);
    }
})

// function httpGetAsync(theUrl, callback) {
//     var xmlHttp = new XMLHttpRequest();
//     xmlHttp.onreadystatechange = function () {
//         if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
//             callback(xmlHttp);
//     }
//     xmlHttp.open("GET", theUrl, true); // true for asynchronous 
//     xmlHttp.send(null);
// }

function copyToClipboard() {
    console.log("copy to clipboard btccchhhh");
    var img = document.getElementById("finished-gif");
    img.select();
    document.execCommand("copy");
    alert("Image copied to clipboard");
}


window.addEventListener("load", function () {

    function sendData() {
        const XHR = new XMLHttpRequest();
        // Bind the FormData object and the form element
        const FD = new FormData(imageForm);
        // Define what happens on successful data submission
        XHR.addEventListener("load", function (event) {

            xk = this.response
            // alert(this.response.status)
            if (this.status == 500){
                alert(this.response);
                return;
            }
            if (this.status != 201){
                alert(this.response);
                return;
            }


            let imageId = this.HEADERS_RECEIVED.location;
            console.log(imageId);
            let img = document.getElementById("finished-gif");
            img.src = this.getResponseHeader("Location")

            console.log(this)
            let aTag = document.getElementById("finished-gif-link");
            aTag.setAttribute("href", img.src);
            imageForm.style.display = "none"
            gifHolder.style.display = "block"
        });

        // Define what happens in case of error
        XHR.addEventListener("error", function (event) {
            alert('Oops! Something went wrong.')
        });

        // Set up our request
        XHR.open("POST", "/parrotify");
        XHR.responseType = "text";

        // The data sent is what the user provided in the form
        XHR.send(FD);
    }

    // ...and take over its submit event.
    imageForm.addEventListener("submit", function (event) {
        event.preventDefault();
        if ( fileInput.files.length < 1) {
            console.log("No file selected. Not submitting.")
            return;
        }

        console.log("SUBMISSION")

        sendData();
    });
});
