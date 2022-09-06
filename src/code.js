/* Prevent loading image if user misses box */
window.addEventListener("drop", (event) => {
  event.preventDefault();
});
window.addEventListener("dragover", (event) => {
  event.preventDefault();
});

/* Frequently used elements */
var dropArea = document.getElementById("dropzone");
var dropMask = document.getElementById("dropmask");
var closeImageBtn = document.getElementById("close-image-btn");
var fileInput = document.getElementById("file-input");
var imageForm = document.getElementById("image-form");
var gifHolder = document.getElementById("gif-holder");
var previewImage = document.getElementById("preview-image");
var browseLabel = document.getElementById("browse-label");

//***************************************** */
//code to handle the hover stuff
var drag_over = function (e) {
  console.log("dragover");

  e.stopPropagation();
  e.preventDefault();
  dropArea.classList.add("hover");
  dropMask.classList.remove("hidden");
};

var drag_leave = function (e) {
  console.log("dragleave");

  e.stopPropagation();
  e.preventDefault();
  dropArea.classList.remove("hover");
  dropMask.classList.add("hidden");
};

var drag_drop = function (e) {
  console.log("dragdrop");

  e.stopPropagation();
  e.preventDefault();
  dropArea.classList.remove("hover");
  document.getElementById("dropmask").classList.add("hidden");
  fileInput.files = e.dataTransfer.files;
  fileInput.dispatchEvent(new Event("change"));
};

dropArea.addEventListener("dragover", drag_over, false);
dropArea.addEventListener("dragleave", drag_leave, false);
dropArea.addEventListener("drop", drag_drop, false);

function share_click() {
  console.log(this);
}

function reset_click() {
  imageForm.style.display = "block";
  gifHolder.style.display = "none";
  previewImage.setAttribute("src", "#");
  dropMask.classList.add("hidden");
  fileInput.classList.remove("hidden");
  imageForm.reset();
  closeImageBtn.classList.add("hidden");
  browseLabel.classList.remove("hidden");
}

/// code to get the input and send over
fileInput.addEventListener("change", function () {
  if (fileInput.files && fileInput.files[0]) {
    // this no longer matters
    /* Check if image is too large */
    // if (fileInput.files[0].size > 5_000_000) {
    //     fileInput.value = '';
    //     previewImage.setAttribute("src", '#');
    //     alert("Image is too large! Try an image under 5mb.")
    //     return;
    // }

    var reader = new FileReader();
    reader.onload = function (e) {
      previewImage.setAttribute("src", e.target.result);
      fileInput.classList.add("hidden"); //`${input.files[0].name} (${input.files[0].size} bytes)`;
      browseLabel.classList.add("hidden");
      closeImageBtn.classList.remove("hidden");
    };

    reader.readAsDataURL(fileInput.files[0]);
  }
});

//display the gif
function displayGIF(gifData) {
  let img = document.getElementById("finished-gif");
  img.src = URL.createObjectURL(gifData);
  let aTag = document.getElementById("finished-gif-link");
  aTag.setAttribute("href", img.src);
  imageForm.style.display = "none";
  gifHolder.style.display = "block";
}

//setup what the parrotify button does
imageForm.addEventListener("submit", function (event) {
  event.preventDefault();
  if (Object.keys(faceapi.nets).length < 1) {
    console.log("Model still not loaded");
    return;
  }
  if (fileInput.files.length < 1) {
    console.log("No file selected. Not submitting.");
    return;
  }
  console.log("SUBMISSION");
  parrotifyFace(previewImage);
});
