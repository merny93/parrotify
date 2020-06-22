# Live site
Now live at [parrotify.me](http://parrotify.me)!


# Running the site on Flask
run the thing needs add the name

https://github.com/blueimp/JavaScript-Load-Image

https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Using_images

https://stackoverflow.com/questions/28027472/flask-get-image-via-post

https://stackoverflow.com/questions/8637153/how-to-return-images-in-flask-response

https://github.com/lukechilds/merge-images

## Set up python requirements:  
pip install -r requirements.txt  

## HOW TO START API (ON WINDOWS POWERSHELL):
$env:FLASK_APP = "main.py"  
$env:FLASK_ENV = "development"  
flask run  

## HOW TO START API (ON WINDOWS CMD):  
set FLASK_APP=main.py   <- not needed if app is called app.py
set FLASK_ENV=development  
flask run  

## ON OTHER SYSTEMS  
export FLASK_APP=main.py  
export FLASK_ENV=development  
flask run 
