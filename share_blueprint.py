from flask import Blueprint, make_response, current_app, request, \
     send_file, abort, render_template, send_from_directory
from functools import wraps
from werkzeug.utils import secure_filename
import os
import uuid


import os


share_blueprint = Blueprint('share_blueprint', __name__)

SHARE_DIR = "raw_gif"

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

@share_blueprint.route(f'/raw_gif/<image_file>')
def raw_gif(image_file):
    return send_from_directory(os.path.join(
        current_app.root_path, SHARE_DIR
    ), image_file)

@share_blueprint.route('/share/<image_id>')
def get_shared_image(image_id):
    return render_template('share.html', image_id=image_id)
