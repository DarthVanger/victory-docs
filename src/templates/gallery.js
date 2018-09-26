import React from "react";
import PropTypes from "prop-types";
import Helmet from "react-helmet";
import { Link, graphql, StaticQuery } from "gatsby";
import Footer from "../partials/footer";
import Playground from "../partials/playground";
import Seo from "../partials/seo/index";
import config from "../../data/site-config";

// Per v2 docs, this is still fine/correct: https://www.gatsbyjs.org/docs/adding-markdown-pages/
// Surprisingly, we get the error:
// gatsby-browser-entry.js:135 Uncaught Error: It appears like Gatsby is misconfigured. Gatsby related `graphql`
// calls are supposed to only be evaluated at compile time, and then compiled away,.
// Unfortunately, something went wrong and the query was left in the compiled code.

// It's entirely possible that all of these errors are second-order effects caused by literally anything,
// from the dependency version of plugin, to babel core mismatch, etc. etc. The tricky thing about trying to
// use an unstable pile of magic and undocumented assumptions, faux-graphql, faux-react, and even faux-webpack
// in conjunction with one another is that it requires a bit of luck or tons of domain knowledge to fix when it breaks.

// To resolve these potentially interconnected and cryptic issues, it would probably make the most sense to start
// from scratch with a canonical and minimal gatsby v2 setup, then layer on plugins in such a way that it's possible
// to tell what combinations are broken, if any. Unfortuantely, this is not very practical to do with an existing codebase.



class GalleryTemplate extends React.Component {
  render() {
    const { slug } = this.props.pageContext;
    const postNode = this.props.data.markdownRemark;
    const post = postNode.frontmatter;
    if (!post.id) {
      post.id = slug;
    }
    if (!post.id) {
      post.categoryId = config.postDefaultCategoryID;
    }
    return (
      <div className="Page-content">
        <Helmet>
          <title>{`${config.siteTitle} |  ${post.title}`}</title>
          <meta name="description" content={config.siteDescription} />
        </Helmet>
        <Seo postPath={slug} postNode={postNode} postSEO />
        <article className="Article">
          <Link to="/gallery" className="SubHeading">
            Back to Gallery
          </Link>
          <div className="Recipe Recipe--gallery">
            <h1>{post.title}</h1>
            <pre className="u-noMarginTop u-noPadding">
              <div className="Interactive">
                <Playground
                  html={postNode.html}
                  scope={post.scope}
                  theme="elegant"
                />
              </div>
            </pre>
          </div>
        </article>
        <Footer />
      </div>
    );
  }
}

GalleryTemplate.propTypes = {
  data: PropTypes.object,
  pageContext: PropTypes.object
};

export default GalleryTemplate;

export const pageQuery = graphql`
  query ExampleBySlug($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      frontmatter {
        id
        scope
        title
      }
      fields {
        slug
      }
    }
  }
`;
