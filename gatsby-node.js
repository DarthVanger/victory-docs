const path = require("path");
const _ = require("lodash");

exports.onCreateWebpackConfig = ({ actions
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
        // use: "url-loader",
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
      {
        test: /\.css$/,
        //use: ['style-loader', 'postcss-loader'],
        loader: 'postcss-loader',
      }
  ]
  }
  })
};

exports.onCreateNode = ({ node, boundActionCreators, getNode }) => {
  const { createNodeField } = boundActionCreators;
  let slug;

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
exports.createPages = ({ graphql, boundActionCreators }) => {
  const { createPage } = boundActionCreators;

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
            layout: useSidebar ? "with-sidebar" : "index"
          });
        });
      })
    );
  });
};

// Implement the Gatsby API “onCreatePage”. This is
// called after every page is created.
exports.onCreatePage = async ({ page, boundActionCreators }) => {
  const { createPage } = boundActionCreators;
  if (page.path.match("/guides/themes/")) {
    page.layout = "with-sidebar";

    // Update /guides/themes/ to use with-sidebar layout
    createPage(page);
  }
};
