import React, { Component } from 'react';
import * as seedrandom from 'seedrandom';
import './App.css';
import WebGL from './WebGL';
import * as palette from 'google-palette';
import { shuffle } from './utils';
import { Z_BEST_COMPRESSION } from 'zlib';
const T = window.THREE;

function transform(state, x, y, z, pp, gg) {
  let r3 = 1;
  let r2 = 1;

  if (state.props.mapToSphere) {
    r3 = r2 = Math.sqrt(x * x + y * y + z * z) / 1500;
  } else if (state.props.mapToBenchmarkTransform) {
    r3 = Math.sqrt(x * x + y * y + z * z) / 1500;
    r2 = Math.sqrt(x * x + y * y) / 150;
  } else if (state.props.mapToCylinder) {
    r3 = Math.sqrt(x * x + y * y) / 150;
  } else if (state.props.mapToXYDisk) {
    r2 = 15;
    r3 = 1 / 2;
  }

  x /= r3;
  y /= r3;
  z /= r2;

  if (state.props.polarCoors) {
    const r = Math.sqrt(x * x + y * y + z * z)
    const t1 = (Math.acos(z / r) - Math.PI / 2) * 2500; // x-y theta
    const t2 = Math.atan(y / x) * 2500; // z-xy theta
    z = r - 1;
    x = t1;
    y = t2;
  }

  return { x, y, z };
}
const Points = WebGL(state => {
  const positions = [];
  const colors = [];
  const color = new T.Color();
  const color_dim = new T.Color();
  color_dim.set(0xaaaaaa)

  const data = state.props.data[state.props.group];
  const lines = state.props.lines;
  const pid = Object.keys(data);
  const ngroups = state.props.ngroups || pid.length;
  const seed = state.props.seed || 0;
  let cols = shuffle(palette(['tol', 'qualitative'], ngroups).map(x => +('0x' + x)));
  let vertices;

  let nums = {};
  if (state.props.ngroups) {
    var rng = new Math.seedrandom(seed);
    while (Object.keys(nums).length < ngroups) {
      nums[Math.floor(rng.double() * (pid.length + 1))] = true;
    }
    nums = Object.keys(nums);
  } else {
    nums = Array.from(pid.keys())
  }

  for (let ii = 0; ii < nums.length; ii++) {
    const i = nums[ii];
    if (!state.props.renderNoise) {
      if (pid[i] === '0') {
        continue;
      }
    }
    if (lines) {
      vertices = [];
    }
    if (state.props.color) {
      color.set(cols[i % ngroups]);
    } else color.set(0xeeeeee);

    for (let j = 0; j < data[pid[i]].x.length; j++) {
      let pushed = false;
      const cond = data[pid[i]].score[j] < 0.5;// && !data[pid[i]].match[j];
      for (let pp = -0; pp <= 0; pp += 10) {
        for (let gg = -0; gg <= 0; gg++) {
          // if (data[pid[i]].match[j]) continue;
          if (!cond) continue;
          let a = transform(state,
            data[pid[i]].x[j],
            data[pid[i]].y[j],
            data[pid[i]].z[j], pp, gg);

          if (!a) {
            continue;
          }
          let { x, y, z } = a

          if (!pushed && lines) {
            vertices.push(x, y, z);
            pushed = true;
          }
          positions.push(x, y, z);
          if (cond) {
            // if (!data[pid[i]].match[j]) {
            colors.push(color.r, color.g, color.b);
          } else {
            colors.push(color_dim.r, color_dim.g, color_dim.b);
          }
        }
      }
    }

    // if (lines && vertices.length > 3 * 6) {
    if (lines) {
      const lineGeom = new T.BufferGeometry();
      lineGeom.addAttribute('position', new T.Float32BufferAttribute(vertices, 3));
      const lineMat = new T.LineBasicMaterial({
        transparent: true,
        opacity: state.props.lineOpacity,
        color
      })
      const line = new T.Line(lineGeom, lineMat);
      state.scene.add(line);
    }
  }

  const geometry = new T.BufferGeometry();
  const material = new T.PointsMaterial({
    sizeAttenuation: true,
    size: state.props.pointSize,
    vertexColors: T.VertexColors,
  });
  geometry.addAttribute('position', new T.Float32BufferAttribute(positions, 3));
  geometry.addAttribute('color', new T.Float32BufferAttribute(colors, 3));
  geometry.computeBoundingSphere();

  state.points = new T.Points(geometry, material);
  state.scene.add(state.points);
}, state => {
  state.renderer.render(state.scene, state.camera);
});

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      failed: false
    };
  }

  componentDidMount() {
    fetch('/api', {
      query: {
        event: 0
      }
    })
      .then(raw => raw.json())
      .then(json => this.setState({
        data: json,
        loading: false
      }))
      .catch(err => this.setState({
        failed: err.toString()
      }));
  }

  render() {
    if (this.state.failed) {
      return <div className='app'> {this.state.failed} </div>;
    }

    if (this.state.loading) {
      return <div className='app-fetch'> ... </div>;
    }

    return (
      <div className="app">
        <Points
          className='points-container'
          data={this.state.data}
          group='actual'
          seed={null}
          ngroups={400}
          renderNoise={false}
          color={true}
          lines={true}
          polarCoors={false}
          cylindricalCoords={false}
          mapToXYDisk={false}
          mapToCylinder={false}
          mapToSphere={false}
          mapToBenchmarkTransform={false}
          mapToSweepTransform={false}
          mapToSweep={true}
          lineOpacity={0.65}
          pointSize={5}
        />
      </div>
    );
  }
}

export default App;
