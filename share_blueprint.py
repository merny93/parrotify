from flask import Blueprint, make_response, current_app, request, \
     send_file, abort, render_template, send_from_directory
from functools import wraps
from werkzeug.utils import secure_filename
import os
import uuid

uuid.uuid1()

UPLOAD_DIR = "uploads"
SHARE_DIR = "raw_gif"
ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'gif'}

def allowed_file(filename):
    return '.' in filename and \
        filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def debug_only(f):
    @wraps(f)
    def wrapped(**kwargs):
        if not current_app.debug:
            abort(404)
        return f(**kwargs)
    return wrapped

import os

share_blueprint = Blueprint('share_blueprint', __name__)

@share_blueprint.route('/upload', methods=["POST"])
def upload():
    if 'image' not in request.files:
        return "ERR: No file uploaded"
    file = request.files['image']
    if file.filename == '':
        return "ERR: empty file uploaded"
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file.save("upload1.jpg")
        return "FILE UPLOAD!"

# @debug_only
# @share_blueprint('/preview', methods=["GET"])
# def fuck_ur_mom():
#     filename = request.args.get('filename')


@share_blueprint.route(f'/raw_gif/<image_file>')
def raw_gif(image_file):
    return send_from_directory(os.path.join(
        current_app.root_path, SHARE_DIR
    ), image_file)

@share_blueprint.route('/share/<image_id>')
def get_shared_image(image_id):
    return render_template('share.html', image_id=image_id)


@share_blueprint.route('/blue', methods=["POST"])
def blue():
    file = request.files[0]
    response = make_response('penis')
    response.headers['Location'] = 'share/' + 'big_deal'
    return response, 201
    # chris is sad


@share_blueprint.route('/green', methods=["GET"])
@debug_only
def green():
    return os.path.join(current_app.root_path, 'uploads')


    