import React from "react";
import PropTypes from "prop-types";
import Helmet from "react-helmet";
import { graphql, StaticQuery } from "gatsby";
import Footer from "../partials/footer";
import Playground from "../partials/playground";
import Seo from "../partials/seo/index";
import config from "../../data/site-config";

// funnily enough, these specific queries throw a show-stopping error
// but the automagical query export format is still valid, only for pages.
// But these are not pages
// You can follow the github issue in real-time: https://github.com/gatsbyjs/gatsby/issues/8395,
// presumably it will give us some sort of resolution, for instance it may be any
// of our plugins or none of them, it's indeterminate. Instead of you running gatsby code
// you provide code in magic hooks for gatsby to run your code, which makes the stack traces
// a lot more lively.

// export const pageQuery = graphql`
//   query DocsBySlug($slug: String!) {
//     markdownRemark(fields: { slug: { eq: $slug } }) {
//       html
//       frontmatter {
//         id
//         scope
//         title
//       }
//       fields {
//         slug
//       }
//     }
//   }
// `;
//
//
// // class DocsTemplate extends React.Component {
// //   render() {
// //     return (
// //       <StaticQuery
// //         query={pageQuery}
// //         render={(data) => {
// //           const { slug } = this.props.pageContext;
// //           const postNode = data.markdownRemark;
// //           const post = postNode.frontmatter;
// //           if (!post.id) {
// //             post.id = slug;
// //           }
// //           if (!post.id) {
// //             post.categoryId = config.postDefaultCategoryID;
// //           }
// //
// //           return (
// //             <div className="Page-content">
// //               <Helmet>
// //                 <title>{`${config.siteTitle} |  ${post.title}`}</title>
// //                 <meta name="description" content={config.siteDescription} />
// //               </Helmet>
// //               <Seo postPath={slug} postNode={postNode} postSEO />
// //               <article className="Article">
// //                 <div className="Recipe Markdown">
// //                   {/* TODO: Add edit this page link once everything is merged to master
// //               <a className="SubHeading" href="">Edit this page</a>
// //             */}
// //                   <Playground
// //                     html={postNode.html}
// //                     scope={post.scope}
// //                     theme="elegant"
// //                   />
// //                 </div>
// //               </article>
// //               <Footer />
// //             </div>
// //           );
// //         }}
// //       />
// //     );
// //   }
// // }
// //
// // DocsTemplate.propTypes = {
// //   data: PropTypes.object,
// //   pageContext: PropTypes.object
// // };
// //
// // export default DocsTemplate;

class DocsTemplate extends React.Component {
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
          <div className="Recipe Markdown">
            {/* TODO: Add edit this page link once everything is merged to master
              <a className="SubHeading" href="">Edit this page</a>
            */}
            <Playground
              html={postNode.html}
              scope={post.scope}
              theme="elegant"
            />
          </div>
        </article>
        <Footer />
      </div>
    );
  }
}

DocsTemplate.propTypes = {
  data: PropTypes.object,
  pageContext: PropTypes.object
};

export default DocsTemplate;

export const pageQuery = graphql`
  query DocsBySlug($slug: String!) {
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

