'use babel';

import { CompositeDisposable } from 'atom'

class Main {
  constructor() {

    // initialize members
    this.active = false
    this.toggled = false
    this.interval = null
    this.image_dir = ''
  }

  activate() {
    if (this.active) return

    this.interval = atom.config.get('slide-show.updateInterval') * 1000;
    this.image_dir = atom.config.get('slide-show.imageDir')

    if (atom.config.get('slide-show.autoToggle')) {this.toggle()}
  }

  deactivate() {
    if (!this.active) return
  }

  serialize() {
  }

  toggle() {
    if (this.toggled) {
      this.toggled = false
    } else {
      this.toggled = true

      fs = require('fs');
      path = require('path');
      fileList = [];
      files = fs.readdirSync(this.image_dir);
      images = files.filter((f) => /\.jpg|\.jpeg|\.png/.test(path.extname(f)));
      images = images.map((f) => path.join(this.image_dir, f));

      i = 0;
      element = document.getElementsByTagName('atom-workspace')[0];
      setInterval(function() {
        element.style.backgroundImage = `url(${images[i]})`;
        i = (i + 1) % images.length;
      }, this.interval);
    }
  }
}

export default new Main()
