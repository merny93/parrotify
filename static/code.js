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


//***************************************** */
//code to handle the hover stuff

//not gonna lie i have no clue why we need this but we simply do 
//jkjk it initiates the mask as hidden since we have no need for it  
// dropMask.classList.add('hidden');

var drag_over = function(e) {
    e.stopPropagation();
    e.preventDefault();
    dropArea.classList.add('hover');
    dropMask.classList.remove('hidden')
};

var drag_leave = function(e) {
    e.stopPropagation();
    e.preventDefault();
    dropArea.classList.remove('hover');
    dropMask.classList.add('hidden');

};

var drag_drop = function(e){
    e.stopPropagation();
    e.preventDefault();	
    dropArea.classList.remove('hover');
    // document.getElementById("dropmask").classList.add('hidden');
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
    fileInput.labels[0].classList.remove("hidden");
    imageForm.reset();
    closeImageBtn.classList.add('hidden')
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
            fileInput.labels[0].classList.add("hidden");//`${input.files[0].name} (${input.files[0].size} bytes)`;
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



window.addEventListener("load", function () {

    function sendData() {
        const XHR = new XMLHttpRequest();
        // Bind the FormData object and the form element
        const FD = new FormData(imageForm);
        xy = FD;
        // Define what happens on successful data submission
        XHR.addEventListener("load", function (event) {
            // alert(this.response.status)
            if (this.status == 500){
                alert("brosky");
                return;
            }
            let img = document.getElementById("finished-gif");
            img.src = URL.createObjectURL(this.response);
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
        XHR.responseType = "blob";

        // The data sent is what the user provided in the form
        XHR.send(FD);
    }

    // Access the form element...
    // const form = document.getElementById("image-form");

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
