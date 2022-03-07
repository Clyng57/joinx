
# JoinX

A light-weight javascript templating engine for generating html.


## Features:

- Write blocks of javascript to create dynamic html.
- Express.js compatible.
- Light-weight and fast.
- Add blocks with just `<JX @="<block name>" />`.
- Add custom path blocks with `<JX @="./<folder name>/<block name>" />`..
- Supports adding a boilerplate.
- Add custom default data that can be altered by passing in options.

<br />

# Table of Contents
1. [ Install ](#install) <br />
2. [ Usage ](#examples) <br />

<br />

<a name="install"></a>
## Install

```console
npm i --save joinscript 
```

<br />

<a name="examples"></a>
## Usage


### Options:

```js
const JoinX = require('joinx')

// create JX passing in (options)
const JX = new JoinX({
  // views directory
  views: path.join(__dirname, './views'),
  // blocks directory
  blocks: path.join(__dirname, './views/blocks'),
  // boilerplate to render on each function call
  boilerplate: path.join(__dirname, './views/boilerplate/app.jx'),
  // default data
  default: {
    title: 'Default Title',
    description: 'Default Description',
  }
})

//// for express.js
// pass in app and 'jx' or custom file extension
// allows for res.render()
JX.use(app, 'jx)
```


### Render:

```js
//// JX pattern
// returns a promise
JX.render('fileName', {
  'data-key': 'data',
})

// express.js pattern
res.render('fileName', {
  'data-key': 'data',
})
```


### JavaScript in HTML Use:

```handlebars
<ul>
  <!--> block of javascript that will render as html <-->
  <!-->  must call out$() or some other function to output a string to render <-->
  <JX>
    pages.forEach(page => {
      out$(`<li> ${page} </li>`)
    })
  </JX>
</ul>

<!--> output the string as html <-->
<p>{{ user.username }}</p>
```


### Block Use:

```handlebars
<!--> include a block <-->
<JX @="<block-name>" />

<!--> include a block inside a custom directory <-->
<!--> must start with a . | ./ will equal the views directory <-->
<JX @="./custom/<block-name>" />
```


### Boilerplate Use:

```handlebars
<JX @="head" />
<JX @="navbar" />

<!--> must include (children) block <-->
<!--> this is where the rest of your view will be rendered <-->
<JX @="children" />

<JX @="footer" />
```
