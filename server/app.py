from flask import Flask, jsonify
from flask_cors import CORS
import subprocess
import os
import json
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

# Usar las credenciales de tu cuenta de Firebase
cred = credentials.Certificate('/Users/john/Desktop/app/key.json')
firebase_admin.initialize_app(cred)

# Obtener una referencia a la base de datos Firestore
db = firestore.client()

app = Flask(__name__)
CORS(app, origins='*')


@app.route('/actualizar/<uid>')
def actualizar_capitulos(uid):
    # Ejecuta el script de actualización
    process = subprocess.run(['python', './actualizar_capitulos.py', uid], capture_output=True, text=True)

    # Captura la salida del proceso
    output = process.stdout

    # Verifica si hubo algún nuevo capítulo
    nuevo_capitulo = "Nuevo capítulo disponible!" in output

    # Devuelve una respuesta al frontend
    return jsonify({'nuevoCapitulo': nuevo_capitulo})



@app.route('/')
def get_resultados():
    capitulos_ref = db.collection('capitulos')
    docs = capitulos_ref.stream()

    data = []
    for doc in docs:
        data.append(doc.to_dict())

    return jsonify(data)


if __name__ == '__main__':
    app.run(port=int(os.environ.get('PORT', 3001)))
