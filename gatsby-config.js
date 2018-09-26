const config = require("./data/site-config");
const pathPrefix = config.pathPrefix === "/" ? "" : config.pathPrefix;

/* eslint-disable camelcase */
module.exports = {
  pathPrefix: config.pathPrefix,
  siteMetadata: {
    siteUrl: config.siteUrl + pathPrefix,
    rssMetadata: {
      site_url: config.siteUrl + pathPrefix,
      feed_url: config.siteUrl + pathPrefix + config.siteRss,
      title: config.siteTitle,
      description: config.siteDescription,
      image_url: `${config.siteUrl + pathPrefix}/logos/favicon.ico`,
      copyright: config.copyright
    }
  },
  plugins: [
    // You might think this would fully restore the magic gatsby v1 behavior,
    // but you'd be wrong
    // "gatsby-plugin-layout",
    "gatsby-plugin-react-helmet",
    "gatsby-plugin-postcss",

    // Tried and discarded as possible alternatives to our custom webpack config

    //"gatsby-plugin-sass",
    // {
    //   resolve: 'gatsby-plugin-react-svg',
    //   options: {
    //     rule: {
    //       include: `/static/*.svg`
    //     }
    //   }
    // },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "pages",
        path: `${__dirname}/src/pages/`
      }
    },
    {
      resolve: "gatsby-transformer-remark",
      options: {
        plugins: [
          {
            resolve: "gatsby-remark-images",
            options: {
              linkImagesToOriginal: false
            }
          },
          "gatsby-remark-responsive-iframe",
          "gatsby-remark-copy-linked-files",
          "gatsby-remark-autolink-headers",
          "gatsby-remark-smartypants",
          {
            resolve: "gatsby-remark-playground",
            options: {
              customCodeLang: "playground"
            }
          },
          "gatsby-remark-prismjs"
        ]
      }
    },
    {
      resolve: "gatsby-plugin-google-analytics",
      options: {
        trackingId: config.googleAnalyticsID
      }
    },
    {
      resolve: "gatsby-plugin-nprogress",
      options: {
        color: config.themeColor
      }
    },
    "gatsby-plugin-sharp",
    "gatsby-plugin-sitemap",
    "gatsby-catch-links"
  ]
};
/* eslint-enable camelcase */
