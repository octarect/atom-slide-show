'use babel'

import { CompositeDisposable } from 'atom'

class Main {
  constructor() {
    this.active = false
    this.toggled = false
    this.interval = null
    this.image_dir = ''
    this.task = null
    this.subscription = null
  }

  activate() {
    if (this.active) return

    this.interval = atom.config.get('slide-show.updateInterval') * 1000
    this.image_dir = atom.config.get('slide-show.imageDir')

    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'slide-show:toggle': () => this.toggle()
    }));

    if (atom.config.get('slide-show.autoToggle')) {this.toggle()}
  }

  deactivate() {
    if (!this.active) return
    this.subscriptions.dispose();
  }

  serialize() {
  }

  toggle() {
    if (this.toggled) {
      this.toggled = false
      clearInterval(this.task)
    } else {
      this.toggled = true

      fs = require('fs')
      path = require('path')
      fileList = []
      files = fs.readdirSync(this.image_dir)
      images = files.filter((f) => /\.jpg|\.jpeg|\.png/.test(path.extname(f)))
      images = images.map((f) => path.join(this.image_dir, f))

      i = 0
      element = document.getElementsByTagName('atom-workspace')[0]
      this.task = setInterval(function() {
        element.style.backgroundImage = `url(${images[i]})`
        i = (i + 1) % images.length
      }, this.interval)
    }
  }
}

export default new Main()
