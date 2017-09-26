import React, { Component } from "react";
import PropTypes from "prop-types";
import Helmet from "react-helmet";
import config from "../../../data/site-config";

class SEO extends Component {
  static propTypes = {
    postNode: PropTypes.object,
    postPath: PropTypes.object,
    postSEO: PropTypes.object
  };

  generateTitle() {
    const { postNode, postSEO } = this.props;
    let title;
    if (postSEO) {
      const postMeta = postNode.frontmatter;
      title = postMeta.title;
    } else {
      title = config.siteTitle;
    }
    return title;
  }

  generateDescription() {
    const { postNode, postSEO } = this.props;
    let description;
    if (postSEO) {
      const postMeta = postNode.frontmatter;
      description = postMeta.description
        ? postMeta.description
        : postNode.excerpt;
    } else {
      description = config.siteDescription;
    }
    return description;
  }

  generateImage() {
    const { postNode, postSEO } = this.props;
    let image;
    if (postSEO) {
      const postMeta = postNode.frontmatter;
      image = postMeta.cover;
    } else {
      image = config.siteLogo;
    }
    const realPrefix = config.pathPrefix === "/" ? "" : config.pathPrefix;
    image = config.siteUrl + realPrefix + image;
    return image;
  }

  render() {
    const { postPath, postSEO } = this.props;
    const postURL = postSEO ? config.siteUrl + config.pathPrefix + postPath : null;
    const blogURL = config.siteUrl + config.pathPrefix;
    const title = this.generateTitle();
    const description = this.generateDescription();
    const image = this.generateImage();

    const schemaOrgJSONLD = [
      {
        "@context": "http://schema.org",
        "@type": "WebSite",
        url: blogURL,
        name: title,
        alternateName: config.siteTitleAlt ? config.siteTitleAlt : ""
      }
    ];
    if (postSEO) {
      schemaOrgJSONLD.push([
        {
          "@context": "http://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              item: {
                "@id": postURL,
                name: title,
                image
              }
            }
          ]
        },
        {
          "@context": "http://schema.org",
          "@type": "BlogPosting",
          url: blogURL,
          name: title,
          alternateName: config.siteTitleAlt ? config.siteTitleAlt : "",
          headline: title,
          image: {
            "@type": "ImageObject",
            url: image
          },
          description
        }
      ]);
    }

    return (
      <Helmet>
        {/* General tags */}
        <meta name="description" content={description} />
        <meta name="image" content={image} />

        {/* Schema.org tags */}
        <script type="application/ld+json">
          {JSON.stringify(schemaOrgJSONLD)}
        </script>

        {/* OpenGraph tags */}
        <meta property="og:url" content={postSEO ? postURL : blogURL} />
        {postSEO ? <meta property="og:type" content="article" /> : null}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={image} />
        <meta
          property="fb:app_id"
          content={config.siteFBAppID ? config.siteFBAppID : ""}
        />
      </Helmet>
    );
  }
}

export default SEO;
