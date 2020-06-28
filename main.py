""" Module docstring so pylint stops getting mad at me """

from flask import Flask, request, jsonify, render_template, send_file, make_response
from flask_cors import CORS
from flask_api import status
# Reading an animated GIF file using Python Image Processing Library - Pillow

from io import BytesIO

import file_tools

# from share_blueprint import fuck_ur_shit
from share_blueprint import share_blueprint

import os

#CHRIS WAS HERE 2020

import numpy as np

SHARE_DIR = "raw_gif"


from markupsafe import escape

from image_helper import make_parrot

## PURGATORY: mimetypes ##
# Add support for interpreting common web types without relying on system registry
# import mimetypes
# mimetypes.add_type("text/css", ".css")
# mimetypes.add_type("text/javascript", ".js")

##init the flask app
app = Flask(__name__)

# blueprint for image sharing html 
app.register_blueprint(share_blueprint)
CORS(app)


##splash screen
@app.route('/home')
@app.route('/index')
@app.route('/')
def splash():
    return render_template('index.html')

##404 handler
@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

##testing will remove later TODO: remove
@app.route('/red', methods=['GET'])
def red_test():
    return app.root_path


##main post request for parrotifying the image
@app.route('/parrotify', methods=['POST'])
def parrotify():
    if not request.files:
        return (jsonify("No file received"), status.HTTP_400_BAD_REQUEST)

    try:
        gif = make_parrot(request.files['image'])
    except Exception as ex:
        return str(ex), status.HTTP_500_INTERNAL_SERVER_ERROR


    file_id = file_tools.generate_resource_id() 
    file_name = file_id + ".gif"
    raw_gif_location = SHARE_DIR + "/" + file_name
    share_link = "http://parrotify.me/share/"+file_id

    gif[0].save(
            os.path.join(app.root_path, SHARE_DIR, file_name),
            format = 'GIF',
            save_all = True,
            disposal = 2,
            append_images = gif[1:]
        )

    response = make_response(jsonify(
        file_id=file_id,
        raw_gif_location = raw_gif_location,
        share_link = share_link, 
    ))
    response.headers['Location'] = SHARE_DIR + "/" + file_name
    response.headers['File-ID'] = file_id
    return response, status.HTTP_201_CREATED


# running REST interface, port=5000 for direct test, port=5001 for deployment from PM2
if __name__ == "__main__":
    app.run(debug=False, port=5000)

















    # bytesObject = BytesIO()
    # gif[0].save(
    #         bytesObject,
    #         format = 'GIF',
    #         save_all = True,
    #         disposal=2,
    #         append_images = gif[1:] ) # [background[x] for x in range(imageObject.n_frames)])
    # bytesObject.seek(0,0)

    # return send_file(bytesObject, attachment_filename= "namey.gif", mimetype='image/gif', as_attachment=True)