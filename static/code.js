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


httpGetAsync("/getParrot", processImageCallback);