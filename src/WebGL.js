import React, { Component } from 'react';
import * as Stats from 'stats-js';
import './App.css';

const THREE = window.THREE

const WebGL = (init, render) => class App extends Component {
    animate = () => {
        requestAnimationFrame(this.animate);
        render(this);
        this.stats.update();
        this.controls.update();
    }

    getSize() {
        return {
            width: window.innerWidth,
            height: window.innerHeight
        }
    }

    _init() {
        const { width, height } = this.getSize();

        this.stats = new Stats()
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({
            antialias: true
        });
        this.container.appendChild(this.renderer.domElement);

        this.camera = new THREE.PerspectiveCamera(45, width / height, 1, 145500);
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.camera.position.set(1200, 1500, -2500);

        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.25;
        this.controls.screenSpacePanning = true;

        this.scene.background = new THREE.Color(0x000000);
        // this.scene.fog = new THREE.Fog(0x050505, 3000, 50000);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(width, height);

        init(this);

        this.container.appendChild(this.stats.domElement);

        window.addEventListener('resize', () => {
            const { width, height } = this.getSize();

            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height);
        }, false);
    }

    setRef = (r) => {
        if (r) {
            this.container = r;
        }
        this._init();
        this.animate();
    }

    render() {
        return (
            <div ref={this.setRef} className="webgl-container" />
        );
    }
}

export default WebGL;
