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
      this.remove_style()
      this.stop_iteration()
    } else {
      this.toggled = true
      this.start_iteration()
    }
  }

  start_iteration() {
    var fs = require('fs')
    var path = require('path')
    var exec = require('child_process').execSync

    this.intvl = atom.config.get('atom-slide-show.updateInterval') * 1000
    var rawpath = atom.config.get('atom-slide-show.imageDir')
    this.imgdir = exec(`ls -d ${rawpath}`).toString().replace(/\r?\n/g, "")
    this.wall = atom.config.get('atom-slide-show.targetTag')

    var files = fs.readdirSync(this.imgdir)
    var imgs = files.filter((f) => /\.jpg|\.jpeg|\.png/.test(path.extname(f))).map((f) => path.join(this.imgdir, f))
    var elem = document.getElementsByTagName(this.wall)[0]
    if (imgs.length > 0) {
      if (atom.config.get('atom-slide-show.usePackageStyle'))
        this.preset_style()
      this.update(elem, imgs)()
      if (imgs.length > 1)
        this.task = setInterval(this.update(elem, imgs, 1), this.intvl)
    }
  }

  stop_iteration() {
    if (this.task)
      clearInterval(this.task)
  }

  restart_iteration() {
    this.stop_iteration()
    this.start_iteration()
  }

  update(elem, imgs, org = 0) {
    var i = org % imgs.length

    return () => {
      elem.style.backgroundImage = `url(${imgs[i]})`
      i = (i + 1) % imgs.length
    }
  }

  preset_style() {
    var path = require('path')
    var pkgdir = atom.packages.getLoadedPackage('atom-slide-show').path

    var link = document.createElement('link')
    link.id = 'atom-slide-show'
    link.href = path.join(pkgdir, 'resources/styles.less')
    link.rel  = 'stylesheet'
    link.type = 'text/css'

    var head = document.getElementsByTagName('head')[0]
    head.appendChild(link)
  }

  remove_style() {
    if (atom.config.get('atom-slide-show.usePackageStyle')) {
      var link = document.getElementById('atom-slide-show')
      link.parentNode.removeChild(link)

      var elem = document.getElementsByTagName(this.wall)[0]
      elem.style.backgroundImage = ''
    }
  }

}

export default new Main()
