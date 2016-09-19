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
      if (atom.config.get('slide-show.usePackageStyle')) {this.remove_style()}
      clearInterval(this.task)
    } else {
      this.toggled = true
      if (atom.config.get('slide-show.usePackageStyle')) {this.preset_style()}

      fs = require('fs')
      path = require('path')

      fileList = []
      files = fs.readdirSync(this.image_dir)
      images = files.filter((f) => /\.jpg|\.jpeg|\.png/.test(path.extname(f)))
      images = images.map((f) => path.join(this.image_dir, f))

      i = 0
      element = document.getElementsByTagName('atom-workspace')[0]
      this.update(element, images)()
      this.task = setInterval(this.update(element, images, 1), this.interval)
    }
  }

  update(elem, imgs, org = 0) {
    var i = org % imgs.length;
    return () => {
      elem.style.backgroundImage = `url(${imgs[i]})`
      i = (i + 1) % imgs.length
    }
  }

  preset_style() {
    path = require('path')
    pkgdir = atom.packages.getLoadedPackage('slide-show').path
    link = document.createElement('link')
    link.id = 'atom-slide-show'
    link.href = path.join(pkgdir, 'resources/styles.less')
    link.rel  = 'stylesheet'
    link.type = 'text/css'
    head = document.getElementsByTagName('head')[0]
    head.appendChild(link)
  }

  remove_style() {
    link = document.getElementById('atom-slide-show')
    link.parentNode.removeChild(link)
    element = document.getElementsByTagName('atom-workspace')[0]
    element.style.backgroundImage = ''
  }

}

export default new Main()
