'use babel'

import { CompositeDisposable } from 'atom'

class Main {
  constructor() {
    this.active = false
    this.toggled = false
    this.intvl = null
    this.imgdir = ''
    this.wall = null;
    this.task = null
    this.subscr = null
  }

  activate() {
    if (this.active)
      return

    this.intvl = atom.config.get('atom-slide-show.updateInterval') * 1000
    this.imgdir = atom.config.get('atom-slide-show.imageDir')
    this.wall = atom.config.get('atom-slide-show.targetTag')

    this.subscr = new CompositeDisposable();
    this.subscr.add(atom.commands.add('atom-workspace', {
      'atom-slide-show:toggle': () => this.toggle()
    }));

    if (atom.config.get('atom-slide-show.autoToggle'))
      this.toggle()
  }

  deactivate() {
    if (!this.active)
      return
    this.subscr.dispose();
  }

  serialize() {
  }

  toggle() {
    if (this.toggled) {
      this.toggled = false
      if (atom.config.get('atom-slide-show.usePackageStyle'))
        this.remove_style()
      if (this.task)
        clearInterval(this.task)
    } else {
      this.toggled = true

      fs = require('fs')
      path = require('path')

      files = fs.readdirSync(this.imgdir)
      imgs = files.filter((f) => /\.jpg|\.jpeg|\.png/.test(path.extname(f))).map((f) => path.join(this.imgdir, f))

      elem = document.getElementsByTagName(this.wall)[0]
      if (imgs.length > 0) {
        if (atom.config.get('atom-slide-show.usePackageStyle'))
          this.preset_style()
        this.update(elem, imgs)()
        if (imgs.length > 1)
          this.task = setInterval(this.update(elem, imgs, 1), this.intvl)
      }
    }
  }

  update(elem, imgs, org = 0) {
    var i = org % imgs.length

    return () => {
      elem.style.backgroundImage = `url(${imgs[i]})`
      i = (i + 1) % imgs.length
    }
  }

  preset_style() {
    path = require('path')
    pkgdir = atom.packages.getLoadedPackage('atom-slide-show').path

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

    elem = document.getElementsByTagName(this.wall)[0]
    elem.style.backgroundImage = ''
  }

}

export default new Main()
