const fs = require("fs");
const path = require("path");
const reader = require("folder-reader");
const html = require("remark-html");
const frontmatter = require("remark-frontmatter");
const yaml = require("js-yaml");
const remark = require("remark");
const _ = require("lodash");
const visit = require("unist-util-visit");
const select = require("unist-util-select");

/*** This module is is effectively replacing gatsby-filesystem and gatsby-remark and gatsby-html
plugins with the node fs module and remark plugins. Ie, we're peeling away a layer of coupled abstractions.
Remark doesn't care what we do with the objects we generate from Markdown and our React components
don't care where our data comes from, while React Static acts as the bridge between two.

Advantages:
1) Avoiding collocation of data and templates

"Collocation of data queries with templates introduces a lot of cognitive and processing overhead into the project and builds.
It requires that at dev and build time, the data must be rediscovered and queried again from the database by executing all of
the queries found in the template files. This confused us as to where the data was coming from or how it was being injected
into our components (it is magically placed on the template’s props after the query resolves).

In the microcosm of a component, most think this collocation makes reasoning about component data easier, but at the larger level,
it ends up diluting the abstraction point for managing data from a central location. We wished we had more of a central location
to manage data and a more explicit way to consume it. We believe our components should be consumers, not producers of data."

-From https://medium.com/@tannerlinsley/introducing-react-static-a-progressive-static-site-framework-for-react-3470d2a51ebc

2) Stemming from this, since we control the data generation ourselves and can conveniently execute our
transformations independently of the SSR build itself, it's easier to extend behavior/introspect code/isolate errors
for debugging and general development. See ./dev_examples/remark_example.js for independent execution of remark + plugins.

3) Observability of steps, easier package version management: Upgrades will impact either our markdown processing or our
 static site rendering, but not both simultaneously. Any issues with a remark plugin can be addressed at the remark plugin directly rather than as a plugin connecting to build tool hooks.

4) Our tooling decisions around how we parse markdown and how we build our static site are decoupled. If we want to move away
from React-Static in the future, our parsing/data generation remains unaffected. If we want to move away from Remark in the future,
our components for static site generation are unaffected.

 Given the rapid iteration speed and ever-growing size of the javascript ecosystem, the value-add of a more modular toolchain
 can be significant.
***/

function playground(options = { customCodeLang: "playground" }) {
  // we're just mutating the ast here, fyi
  function transformer(ast) {
    visit(ast, `code`, node => {
      const escape = html => {
        return html
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#39;");
      };

      const { customCodeLang } = options;

      if (node.lang === customCodeLang) {
        // Changing `node.type` to `html` means the code needs to be escaped, else it’ll try to
        // transform to valid html, e.g. `<VictoryBar />` to `<victorybar></victorybar>`
        node.type = `html`;
        node.value = `<pre class="pre"><code class="language-${customCodeLang}">${escape(
          node.value
        )}</code></pre>`;
      }
      if (node.lang === `${customCodeLang}_norender`) {
        node.type = `html`;
        node.value = `<pre class="pre"><code class="language-${customCodeLang}_norender">${escape(
          node.value
        )}</code></pre>`;
      }
    });
  }
  return transformer;
}

const subHeadingRangeDefaults = {
  start: 2,
  end: 3
};

function setYamlToFile(subHeadingRange = subHeadingRangeDefaults) {
  function transformer(ast, file) {
    const yamlObj = select(ast, "yaml");
    let obj;
    if (yamlObj.length > 0) {
      const { children } = ast;

      obj = yaml.safeLoad(yamlObj[0].value);

      file.data = obj;
      file.data.ast = ast;
      file.data.raw = file.contents;
      // yeah, yeah, should be a single pass reduce, but the runtime cost is trivial.
      file.data.subHeadings = children
        .filter(
          c =>
            c.type === "heading" &&
            c.depth >= subHeadingRange.start &&
            c.depth <= subHeadingRange.end
        )
        .map(c => ({
          type: c.type,
          value: c.children[0].value,
          depth: c.depth
        }));
    }
  }

  return transformer;
}

// We'd rather do the parsing in the data layer and the rendering in the rendering layer
// and give our views as few things to think about as possible.

function deepSet(obj, keys, val) {
  keys.split && (keys = keys.split("."));
  let i = 0,
    l = keys.length,
    t = obj,
    x;
  for (; i < l; ++i) {
    x = t[keys[i]];
    t = t[keys[i]] =
      i === l - 1
        ? val
        : x != null
        ? x
        : !!~keys[i + 1].indexOf(".") || !(+keys[i + 1] > -1)
        ? {}
        : [];
  }
}

function deepGet(obj, key, def, p) {
  p = 0;
  key = key.split ? key.split(".") : key;
  while (obj && p < key.length) obj = obj[key[p++]];
  return obj === undefined || p < key.length ? def : obj;
}

async function renderMarkdown(relDir, opts = {}) {
  const renderer = opts.renderer || remark();
  const dir = path.join(__dirname, relDir);
  let contents = {};

  renderer
    .use(frontmatter, ["yaml", "toml"])
    .use(setYamlToFile)
    .use(html)
    .use(playground);

  function iterateFiles() {
    return new Promise((resolve, reject) => {
      reader(dir, {})
        .on("data", file => {
          let objKey = file.filepath
            .replace(dir, "")
            .replace(path.extname(file.filepath), "")
            .split(path.sep)
            .slice(1);
          if (file.type === "directory") {
            deepSet(contents, objKey, deepGet(contents, objKey, []));
          } else if (file.type === "file" && file.basename.match(/\.md$/)) {
            // file.file is uh... look, you can't win em all
            renderer.process(file.file, (err, results) => {
              let data = results.data;
              // Title needs to be set as an alias
              deepSet(contents, objKey, {
                contents: results.contents,
                ...data,
                data: data
              });
            });
          } else {
            deepSet(contents, objKey, {
              contents: file.file,
              ...data,
              data: data
            });
          }
        })
        .on("end", () => resolve(contents))
        .on("error", reject);
    });
  }
  return iterateFiles();
}

module.exports = {
  renderMarkdown
};

const getResult = async () => {
  try {
    return await renderMarkdown("../content", { renderer: remark() });
  } catch (err) {
    console.log(err);
    return err;
  }
};

module.exports = {
  renderMarkdown,
  getResult,
  playground
};
