
const fs = require('fs');
const path = require('path');
const util = require('./util');

/**
 * @module joinx
 */

/**
 * Class JoinScript - A light-weight javascript templating engine for generating html.
 */
class JoinX {

  /**
   * Create JoinScript
   * 
   * @param {Object} options - contains options.
   * @param {string} options.boilerplate - runs on every render.
   * @param {string | undefined} options.views - path to view folder.
   * @param {string | undefined} options.blocks - path to blocks folder.
   * @param {Array | undefined} options.default - add default data that can be altered by passing in options.
   */
  constructor(options) {
    /** @private */
    this.boilerplate = options && options.boilerplate ? options.boilerplate : false;
    /** @private */
    this.dirname = options && options.views ? options.views : path.join(process.cwd(), './views');
    /** @private */
    this.blockDirname = options && options.blocks ? options.blocks : path.join(process.cwd(), './views/blocks');
    /** @private */
    this.blocks = options && options.blocks ? fs.readdirSync(options.blocks) : fs.readdirSync(path.join(process.cwd(), './views/blocks'));
    /** @private */
    this.default = options && options.default ? {...options.default} : {...''};
  }

  parse = template => {
    let returnArray = [];
    let jxArray = util.split(template, /<JX(.*?)<\/JX>/g);
    jxArray
      .forEach(el => {
        let arr = util.split(el, /{{(.*?)}}/g);
        returnArray.push(...arr)
      })
    return returnArray;
  }

  compile = (template, options) => {
    const els = this.parse(template);
    let data = {
      ...this.default,
      ...options,
    }
    let code = `let out = [];`;
    els.forEach(e => {
      let el = e.replaceAll(' <$_ENTER_$> ', '\n');
      if (el.startsWith('<JX') && el.endsWith('<\/JX>')) {
        el = util.parseDataKeys(data, el);
        let tempEl = `\n${el.split(/<JX>|<\/JX>/).filter(Boolean)[0].trim()}`;
        code += tempEl.includes('out$(') ? tempEl.replaceAll('out$(', 'out.push(') : tempEl;
      } else if (el.startsWith('{{') && el.endsWith('}}')) {
        el = util.parseDataKeys(data, el);
        code += `\nout.push(${el.split(/{{|}}/).filter(Boolean)[0].trim()})`;
      } else {
        code += `\nout.push(\`${el}\`)`;
      }
    })
    code += `\nreturn out.join('')`;
    let compileHTML = new Function('data', code);
    return compileHTML(data);
  }

  /** @private */
  parseCustomBlocks = content => {
    return new Promise((resolve, reject)=> {
      if (content.includes(`<JX @=".`)) {
        let customBlocks = content.match(/<JX @="\.(.+?)" \/>/g);
        let cbCount = customBlocks.length;
        if (cbCount === 0)
          resolve(content)
        let cbProcessed = 0;
        customBlocks.map(cB => {
          let customBlock = cB.replace('<JX @="', '').replace('" />', '');
          fs.readFile(path.join(this.dirname, `${customBlock}.jx`), (err, blockC)=> {
            if (err)
              reject(err)
            content = content.replace(`<JX @="${customBlock}" />`, blockC);
            cbProcessed += 1;
            if (cbCount === cbProcessed)
              resolve(content)
          })
        })
      } else {
        resolve(content)
      }
    })
  }

  /** @private */
  parseBlocks = content => {
    return new Promise((resolve, reject)=> {
      if (!content.includes(`<JX @="`))
        resolve(content)
      this.parseCustomBlocks(content)
        .then(content => {
          let blockCount = this.blocks.length;
          if (blockCount === 0)
            resolve(content)
          let blocksTested = 0;
          this.blocks.map(block => {
            if (content.includes(`<JX @="${block.replace('.jx', '')}" />`)) {
              fs.readFile(path.join(this.blockDirname, block), (err, blockContent)=> {
                if (err)
                  reject(err)
                content = content.replace(`<JX @="${block.replace('.jx', '')}" />`, blockContent);
                blocksTested += 1;
                if (blocksTested === blockCount)
                  resolve(content)
              })
            } else {
              blocksTested += 1;
              if (blocksTested === blockCount)
                resolve(content)
            }
          })
        })
    })
  }

  render = (file, options)=> {
    return new Promise((resolve, reject)=> {
      fs.readFile(path.join(this.dirname, file), (err, fileContent)=> {
        if (err) 
          reject(err);

        this.parseBlocks(fileContent.toString().replaceAll('\n', ' <$_ENTER_$> '))
          .then(content => {
            if (this.boilerplate) {
              fs.readFile(this.boilerplate, (err, fc)=> {
                this.parseBlocks(fc.toString().replaceAll('\n', ' <$_ENTER_$> '))
                .then(fC => {
                  let newContent = fC.replace('<JX @="children" />', content)
                  const elements = this.compile(newContent, options);
                  resolve(elements)
                })
              })
            } else {
              const elements = this.compile(content, options);
              resolve(elements)
            }
          })
          .catch(err => {
            if (err) 
              reject(err)
          })

      })
    })
  }

  use = (app, engine)=> {
    app.engine(engine, (filePath, options, callback)=> {
      this.render(path.basename(filePath), options)
        .then(file => {
          callback(null, file)
        })
        .catch(err => {
          callback(err)
        })
    })
    app.set('view engine', engine);
  }
  
}

module.exports = JoinX;
