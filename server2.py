from flask import Flask, request, app, jsonify
import pandas as pd
import numpy as np
app = Flask(__name__)
cache = {}


@app.route('/api')
def getEvent():
    event = 'event000001000'

    if event in cache:
        return cache[event]

    data = pd.read_csv('out.a.csv')
    data.head()

    df = data.groupby('particle_id')
    actual = {}
    for pid, value in df:
        idx = np.argsort((value[['x', 'y', 'z']]**2).sum(axis=1))
        actual[str(pid)] = {
            'x': value['x'].values[idx].tolist(),
            'y': value['y'].values[idx].tolist(),
            'z': value['z'].values[idx].tolist(),
            'match': value['match'].values[idx].tolist(),
            'score': value['score'].values[idx].tolist(),
        }

    df = data.groupby('track_id')
    yhat = {}
    for pid, value in df:
        idx = np.argsort((value[['x', 'y', 'z']]**2).sum(axis=1))
        yhat[str(pid)] = {
            'x': value['x'].values[idx].tolist(),
            'y': value['y'].values[idx].tolist(),
            'z': value['z'].values[idx].tolist(),
            'match': value['match'].values[idx].tolist(),
            'score': value['match'].values[idx].tolist(),
        }

    cache[event] = jsonify(dict(actual=actual, yhat=yhat))
    return cache[event]


# a = getEvent()
