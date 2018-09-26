const path = require("path");
const _ = require("lodash");
const { createFilePath } = require(`gatsby-source-filesystem`);


exports.onCreateWebpackConfig = ({ actions, getConfig
                                 }) => {

  actions.setWebpackConfig({module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
            plugins: [
              '@babel/plugin-syntax-dynamic-import',
              '@babel/plugin-proposal-class-properties',
              //TODO WIP: slug resolver logic currently broken which means
              // the whole thing is borked, but if you just need to see something
              // on your browser uncomment out this line:
              // 'babel-plugin-remove-graphql-queries'
            ]
          }
        }
      },
      {
      test: /\.(jpg|jpeg|png|gif|mp4|webm|wav|mp3|m4a|aac|oga)(\?.*)?$/,
    loader: "url-loader",
    query: {
    limit: 10000,
      name: "static/[name].[hash:8].[ext]"
      }
    },
      {
        test: /\.(svg)(\?.*)?$/,
          loader: "raw-loader"
      },
      // {
      //  From readme at https://github.com/postcss/postcss-loader:
      //  Use it after css-loader and style-loader, but before other preprocessor loaders like e.g sass|less|stylus-loader, if you use any.
      //   // which I guess means, "don't use with gatsby plugins"
      //   although there's an api option to replace the entire webpack config and compose it ourselves via getConfig
      //   test: /\.css$/,
      //   loader: "postcss-loader"
      // }
  ]
  }
  })
};


exports.onCreateNode = ({ node, actions, getNode }) => {

  let slug;
  const { createNodeField } = actions;
  const { frontmatter } = node;
  if (frontmatter) {
    const { image } = frontmatter;
    if (image) {
      if (image.indexOf('/img') === 0) {
        frontmatter.image = path.relative(
          path.dirname(node.fileAbsolutePath),
          path.join(__dirname, '/static/', image)
        )
      }
    }
  }

  if (node.internal.type === `MarkdownRemark`) {
    const value = createFilePath({ node, getNode });
    createNodeField({
      name: `slug`,
      node,
      value,
    });

    // just to make extra, extra sure. But no, it doesn't work.
    createNodeField({
      name: `pageContext`,
      node,
      value: {
        slug:  value
      }
    });

    if (
      Object.prototype.hasOwnProperty.call(node, "frontmatter") &&
      Object.prototype.hasOwnProperty.call(node.frontmatter, "slug")
    ) {
      slug = `/${_.kebabCase(node.frontmatter.slug)}`;
    }
    createNodeField({ node, name: "slug", value: slug });
  }


  if (node.internal.type === "MarkdownRemark") {
    const fileNode = getNode(node.parent);
    const parsedFilePath = path.parse(fileNode.relativePath);

    // manually overriding slug in frontmatter
    if (
      Object.prototype.hasOwnProperty.call(node, "frontmatter") &&
      Object.prototype.hasOwnProperty.call(node.frontmatter, "slug")
    ) {
      slug = `/${_.kebabCase(node.frontmatter.slug)}`;
    }

    // create slug
    if (parsedFilePath.name !== "index" && parsedFilePath.dir !== "") {
      slug = `/${parsedFilePath.dir}/${parsedFilePath.name}/`;
    } else if (parsedFilePath.dir === "") {
      slug = `/${parsedFilePath.name}/`;
    } else {
      slug = `/${parsedFilePath.dir}/`;
    }

    // Add raw content for galleries
    let raw = "";
    if (parsedFilePath.dir === "gallery") {
      raw = node.internal.content;
    }
    createNodeField({ node, name: "raw", value: raw });

    // Add slug as a field on the node.
    createNodeField({ node, name: "slug", value: slug });

    // createNodeField({ node, name: "pathLolNopeContext", value: slug });
    // Separate /docs from /guides for <Sidebar />
    createNodeField({ node, name: "type", value: parsedFilePath.dir });

    const useSidebar =
      parsedFilePath.dir === "docs" || parsedFilePath.dir === "guides";
    createNodeField({ node, name: "sidebar", value: useSidebar });
  }
};

// Implement the Gatsby API `createPages`.
// This is called after the Gatsby bootstrap is finished
// so you have access to any information necessary to
// programatically create pages.
exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions;

  return new Promise((resolve, reject) => {
    const docsTemplate = path.resolve("src/templates/docs.js");
    const galleryTemplate = path.resolve("src/templates/gallery.js");

    resolve(
      graphql(
        `
          {
            allMarkdownRemark {
              edges {
                node {
                  frontmatter {
                    id
                    category
                  }
                  headings {
                    depth
                    value
                  }
                  fields {
                    slug
                    type
                    sidebar
                    raw
                  }
                }
              }
            }
          }
        `
      ).then((result) => {
        if (result.errors) {
          /* eslint no-console: "off"*/
          console.log(result.errors);
          reject(result.errors);
        }

        // const categorySet = new Set();
        result.data.allMarkdownRemark.edges.forEach((edge) => {
          const useSidebar = edge.node.fields.sidebar;
          createPage({
            path: edge.node.fields.slug, // required
            component: useSidebar ? docsTemplate : galleryTemplate,
            context: {
              slug: edge.node.fields.slug
            },
            layout: "index" // useSidebar ? "with-sidebar" : "index"
          });
        });
      })
    );
  });
};

// Implement the Gatsby API “onCreatePage”. This is
// called after every page is created.
exports.onCreatePage = async ({ page, actions }) => {
  const { createPage } = actions;
  // if (page.path.match("/guides/themes/")) {
  //   page.layout = "with-sidebar";
  //
  //   // Update /guides/themes/ to use with-sidebar layout
  //   createPage(page);
  // }
};


// exports.onCreateNode = ({node, actions, getNode}) => {
//   const {createNodeField} = actions;
//   let slug;
//   switch (node.internal.type) {
//     case "MarkdownRemark":
//       const fileNode = getNode(node.parent);
//       const [basePath, name] = fileNode.relativePath.split('/');
//       slug = `/${basePath}/${name}/`;
//       break;
//   }
//   if (slug) {
//     createNodeField({node, name: slug, value: slug});
//   }
// };