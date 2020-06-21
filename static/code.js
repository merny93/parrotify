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
    // document.getElementById("dropmask").classList.add('hidden');
    document.querySelector('input').files = e.dataTransfer.files;
    document.getElementById('file-input').dispatchEvent(new Event('change'));
};

var overArea = document.getElementById('dropzone');
var dropMask = document.getElementById('dropmask');
var closeImageBtn = document.getElementById("close-image-btn")

overArea.addEventListener('dragover', drag_over, false);
dropMask.addEventListener('dragleave',drag_leave, false);
dropMask.addEventListener('drop', drag_drop, false);

function share_click(){
    console.log(this);
}

function reset_click(){
    console.log(this);
    document.getElementById('image-form').style.display = "block";
    document.getElementById('gif-holder').style.display = "none";
    document.getElementById("preview-image").setAttribute("src", '#');
    document.getElementById("dropmask").classList.add('hidden');
    document.getElementById("file-input").labels[0].classList.remove("hidden");
    document.getElementById('image-form').reset();
    closeImageBtn.classList.add('hidden')
}


/// code to get the input and send over
document.getElementById('file-input').addEventListener("change", function () {
    input = this;
    if (input.files && input.files[0]) {
        /* Check if image is too large */
        if (input.files[0].size > 5_000_000) {
            input.value = '';
            document.getElementById("preview-image").setAttribute("src", '#');
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
            document.getElementById("preview-image").setAttribute("src", e.target.result);
            input.labels[0].classList.add("hidden");//`${input.files[0].name} (${input.files[0].size} bytes)`;
            closeImageBtn.classList.remove("hidden");
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



window.addEventListener("load", function () {

    function sendData() {
        const XHR = new XMLHttpRequest();
        // Bind the FormData object and the form element
        const FD = new FormData(form);
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
            document.getElementById('image-form').style.display = "none"
            document.getElementById('gif-holder').style.display = "block"
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
    const form = document.getElementById("image-form");

    // ...and take over its submit event.
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        if ( document.getElementById("file-input").files.length < 1) {
            console.log("No file selected. Not submitting.")
            return;
        }

        console.log("SUBMISSION")

        sendData();
    });
});


// function resetform(){
//     document.getElementById("image-form").style.display = "block";
//     document.getElementById("gif-holder").style.display = "none";
//     document.getElementById("image-form").value = '';
//     document.getElementById("preview-image").setAttribute("src", '#');
//     document.getElementById("browse-label").innerHTML = "Drop or browse face";
// }