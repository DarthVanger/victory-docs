import { reloadRoutes } from 'react-static/node'
import chokidar from 'chokidar'
import Document from './src/html';
import { getResult } from './util/parser';
import _ from 'lodash';

chokidar.watch('content').on('all', () => reloadRoutes());

// I'm not gonna lie to you, this file can seem pretty scary -- It's the guts of react-static,
// and it's more explicit, but it's still a bunch of stuff to specify!

export default {
  //TODO: move config values into getSiteData
  getSiteData: () => ({
    title: 'Victory Docs',
  }),

  paths: {
    root: process.cwd(), // The root of your project. Don't change this unless you know what you're doing.
    src: 'src', // The source directory. Must include an index.js entry file.
    dist: 'dist', // The production output directory.
    devDist: 'tmp/dev-server', // The development scratch directory.
    public: 'public' // The public directory (files copied to dist during build)
  },

  getRoutes: async () => {

    const transformed = await getResult();

    // this function takes care of sorting!! :code:
    // The only difference between this and
    // allMarkdownRemark(sort: { fields: [frontmatter___title], order: ASC }) is how numbers are handled
    // orderBy places number before letter, prior code disregarded umbers and used
    // first alphabetical character..
    const orderByTitle = (arr) => _.orderBy(arr, ['title'], ['asc']);

    const dec = async () => {
       let { home, posts, docs, about, faq, gallery } = transformed;

     /* This transformation of objects to arrays is not intrinsic to react-static but due to
     the parser returning a plain object for both files in a dir and single files as plain objects
     instead of files in dir as array and and single file as object. It can be changed.
    */
     const sidebarDict = {};

     const docsArr =  Object.keys(docs).reduce((av, cv) => {
         return av.concat({...docs[cv], slug: `${docs[cv].slug || _.kebabCase(cv)}`})
       }, []);

      // temporary, for reals, because hey we still need to support Documentation-Common Props-none
      // and intro + faq, we will ofc get these dynamically
      const directDocs = [ 'guides', 'charts', 'containers', 'more'];

        docsArr.forEach(d => {

       // FIXME: and with this lazy empty array, another crime against clarity
       const {slug, subHeadings = [], category, title} = d;

       // bail if there are no subheadings
           if (!subHeadings) {
             return;
           }

          const convertHeading = r => ({
            title: r.value,
            depth: r.depth,
            slug: `${slug}#${_.kebabCase(r.value).toLowerCase()}`,
            subHeadings: []
          });

          const nestedSubHeadings = subHeadings.filter(r => r.depth === 2).map(r => convertHeading(r));

          let topLevelIdx = 0;

          // I'm so sorry, this should be made clearer...
          subHeadings.forEach(r => {
            if (r.depth === 2) {
              topLevelIdx = topLevelIdx ? topLevelIdx += 1 : 0;
            }
            if (r.depth === 3) {
              if (!nestedSubHeadings.length) {
                return;
              }
              nestedSubHeadings[topLevelIdx].subHeadings.push(
                convertHeading(r)
              )
            }
          });

       const sidebarFields = {slug, category, subHeadings: nestedSubHeadings, title};

       if (directDocs.includes(category)) {
         if(!sidebarDict[category]) {
           sidebarDict[category] = [];
         }
         sidebarDict[category].push(sidebarFields);
       }
     });

     // Bit A: We could do the sidebar here, actually.
     // Bit B: Go on...
     return Object.assign({}, transformed, {
         ...transformed,
         docs: docsArr,
       gallery:
         orderByTitle(
         Object.keys(gallery).reduce((av, cv) => {
         return av.concat({...gallery[cv], slug:  _.kebabCase(cv)})
       }, [])),
       sidebar: directDocs.map(d => sidebarDict[d])
     })

     };

    // TODO: refactor this mess. I "promise" there was a reason for it to be split like this at one point.
   return await dec().then((res) => {
     let { home, docs, about, faq, gallery, index, sidebar } = res;
     const sidebarContent = sidebar;

    return [
      {
        path: '/',
        component: 'src/pages/',
        getData: async () => ({
          doc: home,
          sidebarContent
        }),
      },
      {
        path: '/about',
        getData: () => ({
          about,
          sidebarContent
        }),
      },
      {
        path: '/faq',
        component: 'src/containers/Doc',
         getData: async () => ({
         faq,
         sidebarContent
       }),
      },
      {
        path: '/docs',
        getData: async () => ({
          docs,
          sidebarContent
        }),
        children: docs.map(doc => ({
          path: `/${doc.slug}`,
          component: 'src/containers/Doc',
          getData: async () => ({
            doc,
            sidebarContent,
            location: {pathname: doc.slug}
          }),
        })),
      },
      {
        path: '/gallery',
        component: 'src/pages/gallery',
        getData: async () => ({
          gallery
        }),
        children: gallery.map(galleryItem => ({
          path: `/${galleryItem.slug}`,
          component: 'src/containers/Gallery',
          getData: async () => ({
            galleryItem,
            location: {pathname: galleryItem.slug}
          }),
        })),
      },
    ]
    });
  },

  // So this is kinda cutesy, it's the equivalent of html.js in gatsby, it defines
  // the root html page as a react component:
  // https://github.com/nozzle/react-static/blob/master/docs/config.md#document
  Document: Document,

  bundleAnalyzer: true,

  webpack: (config, { defaultLoaders, stage }) => {
    //FIXME: restore stage checks and loaders for node
    //let loaders = [];


    config.module.rules = [
      {
        // https://webpack.js.org/configuration/module/#rule-oneof
        // Preferred where possible, since multiple/overlapping loader rules cascading
        // can get pretty hard to reason about pretty fast
        oneOf: [

          {
            // test: /\.svg$/,
            test: /\.(svg)(\?.*)?$/,
            loader: 'svg-inline-loader'
          },
          {
            test: /\.css$/,
            use: [
              'style-loader',
              { loader: 'css-loader', options: { importLoaders: 1 } },
              {loader:'postcss-loader',
                options: {
                  plugins: [
                    require("postcss-import"),
                    require("postcss-url")({ url: "inline", encodeType: "base64"}),
                    require("postcss-browser-reporter"),
                    require("postcss-reporter"),
                    require("postcss-preset-env"),
                    require('postcss-custom-media')({stage: 0}),
                  ]
                }
              }
            ]
          },
          defaultLoaders.jsLoader,
            {
              test: /\.md$/,
              use: [       'babel-loader',
                {
                  loader: 'remark-loader',
                  options: {
                    react: true,
            plugins: [ require('remark-kbd')]
          }
          }
          ]},
          // defaultLoaders.fileLoader,

          { loader: 'url-loader',
            test: /\.(jpg|jpeg|png|gif|mp4|webm|wav|mp3|m4a|aac|oga)(\?.*)?$/,
            query: {
              limit: 10000,
              name: "static/[name].[hash:8].[ext]"
            }
          },

          {
          test: /\.css$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'style-loader',
            },
            {
              loader: 'postcss-loader'
            }
            ]
        },
        ],
      },
      {}
    ];

    return config
  }
}
